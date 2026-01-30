alter table public.friendships
  add column if not exists requested_by uuid;

alter table public.friendships
  add constraint friendships_requested_by_check
  check (
    requested_by is null
    or requested_by = user_id
    or requested_by = friend_id
  ) not valid;

alter table public.friendships
  validate constraint friendships_requested_by_check;

create or replace function public.accept_friend_request(f_id uuid, acting_user uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  u uuid;
  v uuid;
  st text;
  requester uuid;
begin
  if f_id is null or acting_user is null then
    raise exception 'friendship id and acting_user must be provided';
  end if;

  select user_id, friend_id, status, requested_by
  into u, v, st, requester
  from public.friendships
  where id = f_id
  for update;

  if not found then
    raise exception 'friendship not found';
  end if;

  if st <> 'pending' then
    raise exception 'friendship is not pending';
  end if;

  if acting_user <> u and acting_user <> v then
    raise exception 'not authorized to accept this request';
  end if;

  if requester is not null and acting_user = requester then
    raise exception 'requester cannot accept this request';
  end if;

  update public.friendships
  set status = 'accepted',
      updated_at = timezone('utc', now())
  where id = f_id;

  return f_id;
end;
$$;

create or replace function public.create_friend_request(requester uuid, addressee uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  r uuid := requester;
  s uuid := addressee;
  small uuid;
  large uuid;
  existing_id uuid;
  existing_status text;
begin
  if r is null or s is null then
    raise exception 'requester and addressee must be provided';
  end if;
  if r = s then
    raise exception 'cannot send friend request to self';
  end if;

  if r < s then
    small := r;
    large := s;
  else
    small := s;
    large := r;
  end if;

  select id, status
  into existing_id, existing_status
  from public.friendships
  where user_id = small
    and friend_id = large
  limit 1
  for update;

  if existing_id is not null then
    if existing_status = 'accepted' then
      raise exception 'users are already friends';
    elsif existing_status = 'pending' then
      raise exception 'there is already a pending friend request between these users';
    elsif existing_status = 'blocked' then
      raise exception 'friendship is blocked';
    end if;
  end if;

  insert into public.friendships(user_id, friend_id, status, requested_by)
  values (small, large, 'pending', r)
  returning id into existing_id;

  return existing_id;
end;
$$;

create or replace function public.fetch_friend_requests()
returns table (
  id uuid,
  requester_id uuid,
  requester_code text,
  requester_username text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  user_id uuid := auth.uid();
begin
  if user_id is null then
    raise exception 'not authenticated';
  end if;

  return query
    select
      f.id,
      requester.requester_id,
      public.derive_friend_code(requester.requester_id) as requester_code,
      u.username,
      f.created_at
    from public.friendships f
    cross join lateral (
      select coalesce(
        f.requested_by,
        case when f.user_id = user_id then f.friend_id else f.user_id end
      ) as requester_id
    ) requester
    left join public.users u on u.id = requester.requester_id
    where f.status = 'pending'
      and (f.user_id = user_id or f.friend_id = user_id)
      and (f.requested_by is null or f.requested_by <> user_id)
    order by f.created_at desc;
end;
$$;

create or replace function public.respond_friend_request(p_request_id uuid, p_action text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  user_id uuid := auth.uid();
  action text := lower(coalesce(p_action, ''));
  u uuid;
  v uuid;
  st text;
  requester uuid;
  updated_count integer := 0;
begin
  if user_id is null then
    raise exception 'not authenticated';
  end if;
  if p_request_id is null then
    raise exception 'request id missing';
  end if;

  select user_id, friend_id, status, requested_by
  into u, v, st, requester
  from public.friendships
  where id = p_request_id
  for update;

  if not found then
    raise exception 'friendship not found';
  end if;

  if st <> 'pending' then
    raise exception 'friendship is not pending';
  end if;

  if user_id <> u and user_id <> v then
    raise exception 'not authorized to respond';
  end if;

  if action in ('accept', 'accepted') then
    if requester is not null and user_id = requester then
      raise exception 'requester cannot accept this request';
    end if;
    update public.friendships
    set status = 'accepted',
        updated_at = timezone('utc', now())
    where id = p_request_id;
  elsif action in ('decline', 'declined', 'reject', 'rejected') then
    delete from public.friendships
    where id = p_request_id;
  else
    raise exception 'unknown action';
  end if;

  get diagnostics updated_count = row_count;
  if updated_count = 0 then
    raise exception 'friendship not updated';
  end if;

  return p_request_id;
end;
$$;

create or replace function public.send_friend_request(p_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  user_id uuid := auth.uid();
  normalized_code text := public.normalize_friend_code(p_code);
  target_id uuid;
  request_id uuid;
begin
  if user_id is null then
    raise exception 'not authenticated';
  end if;

  if normalized_code is null or length(normalized_code) = 0 then
    raise exception 'Bitte gültigen Code angeben.';
  end if;

  select u.id
  into target_id
  from public.users u
  where public.derive_friend_code(u.id) = normalized_code
  limit 1;

  if target_id is null then
    raise exception 'Freund nicht gefunden.';
  end if;

  request_id := public.create_friend_request(user_id, target_id);

  return request_id;
end;
$$;

create or replace function public.fetch_friends()
returns table (
  id uuid,
  owner_id uuid,
  code text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  auth_user_id uuid := auth.uid();
begin
  if auth_user_id is null then
    raise exception 'not authenticated';
  end if;

  return query
    select
      f.id,
      auth_user_id as owner_id,
      public.derive_friend_code(
        case when f.user_id = auth_user_id then f.friend_id else f.user_id end
      ) as code,
      f.created_at
    from public.friendships f
    where f.status = 'accepted'
      and (f.user_id = auth_user_id or f.friend_id = auth_user_id)
    order by f.created_at asc;
end;
$$;

create or replace function public.remove_friend(p_code text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  user_id uuid := auth.uid();
  normalized_code text := public.normalize_friend_code(p_code);
  other_user_id uuid;
  small uuid;
  large uuid;
  deleted_count integer := 0;
begin
  if user_id is null then
    raise exception 'not authenticated';
  end if;

  if normalized_code is null or length(normalized_code) = 0 then
    raise exception 'Ungültiger Freund.';
  end if;

  select u.id
  into other_user_id
  from public.users u
  where public.derive_friend_code(u.id) = normalized_code
  limit 1;

  if other_user_id is null then
    return 0;
  end if;

  if user_id < other_user_id then
    small := user_id;
    large := other_user_id;
  else
    small := other_user_id;
    large := user_id;
  end if;

  delete from public.friendships
  where user_id = small
    and friend_id = large;
  get diagnostics deleted_count = row_count;

  return deleted_count;
end;
$$;

create table if not exists public.lobby_invites (
  id uuid not null default gen_random_uuid(),
  match_id uuid not null,
  sender_id uuid not null,
  recipient_id uuid not null,
  status text not null default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  responded_at timestamp with time zone
);

alter table public.lobby_invites enable row level security;

alter table public.lobby_invites
  add constraint lobby_invites_pkey primary key (id);

alter table public.lobby_invites
  add constraint lobby_invites_match_id_fkey
  foreign key (match_id) references public.matches(id) on delete cascade;

alter table public.lobby_invites
  add constraint lobby_invites_sender_id_fkey
  foreign key (sender_id) references auth.users(id) on delete cascade;

alter table public.lobby_invites
  add constraint lobby_invites_recipient_id_fkey
  foreign key (recipient_id) references auth.users(id) on delete cascade;

alter table public.lobby_invites
  add constraint lobby_invites_status_check
  check (status in ('pending', 'accepted', 'declined')) not valid;

alter table public.lobby_invites
  validate constraint lobby_invites_status_check;

create unique index if not exists lobby_invites_match_recipient_key
  on public.lobby_invites (match_id, recipient_id);

create index if not exists lobby_invites_recipient_idx
  on public.lobby_invites (recipient_id);

create index if not exists lobby_invites_sender_idx
  on public.lobby_invites (sender_id);

create policy "lobby_invites_select_participant"
  on public.lobby_invites
  for select
  using (sender_id = auth.uid() or recipient_id = auth.uid());

create policy "lobby_invites_insert_sender"
  on public.lobby_invites
  for insert
  with check (sender_id = auth.uid());

create policy "lobby_invites_update_participant"
  on public.lobby_invites
  for update
  using (sender_id = auth.uid() or recipient_id = auth.uid())
  with check (sender_id = auth.uid() or recipient_id = auth.uid());

create or replace function public.send_lobby_invite(p_match_id uuid, p_recipient_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  user_id uuid := auth.uid();
  normalized_code text := public.normalize_friend_code(p_recipient_code);
  recipient_id uuid;
  match_row public.matches;
  invite_id uuid;
begin
  if user_id is null then
    raise exception 'not authenticated';
  end if;
  if p_match_id is null then
    raise exception 'match id missing';
  end if;

  select *
  into match_row
  from public.matches
  where id = p_match_id;

  if match_row.id is null then
    raise exception 'match not found';
  end if;
  if match_row.status <> 'waiting' then
    raise exception 'match not open';
  end if;
  if match_row.host_id <> user_id and match_row.guest_id <> user_id then
    raise exception 'not a match participant';
  end if;

  if normalized_code is null or length(normalized_code) = 0 then
    raise exception 'Bitte gültigen Code angeben.';
  end if;

  select u.id
  into recipient_id
  from public.users u
  where public.derive_friend_code(u.id) = normalized_code
  limit 1;

  if recipient_id is null then
    raise exception 'Empfänger nicht gefunden.';
  end if;
  if recipient_id = user_id then
    raise exception 'cannot invite yourself';
  end if;

  insert into public.lobby_invites(match_id, sender_id, recipient_id, status)
  values (p_match_id, user_id, recipient_id, 'pending')
  on conflict (match_id, recipient_id) do update
    set status = 'pending',
        sender_id = excluded.sender_id,
        created_at = timezone('utc', now()),
        responded_at = null
  returning id into invite_id;

  return invite_id;
end;
$$;

create or replace function public.fetch_lobby_invites()
returns table (
  id uuid,
  match_id uuid,
  match_code text,
  sender_id uuid,
  sender_code text,
  sender_username text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  user_id uuid := auth.uid();
begin
  if user_id is null then
    raise exception 'not authenticated';
  end if;

  return query
    select
      i.id,
      i.match_id,
      m.code,
      i.sender_id,
      public.derive_friend_code(i.sender_id) as sender_code,
      u.username,
      i.created_at
    from public.lobby_invites i
    join public.matches m on m.id = i.match_id
    left join public.users u on u.id = i.sender_id
    where i.recipient_id = user_id
      and i.status = 'pending'
    order by i.created_at desc;
end;
$$;

create or replace function public.respond_lobby_invite(p_invite_id uuid, p_action text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  user_id uuid := auth.uid();
  action text := lower(coalesce(p_action, ''));
  next_status text;
  updated_count integer := 0;
begin
  if user_id is null then
    raise exception 'not authenticated';
  end if;
  if p_invite_id is null then
    raise exception 'invite id missing';
  end if;

  if action in ('accept', 'accepted') then
    next_status := 'accepted';
  elsif action in ('decline', 'declined', 'reject', 'rejected') then
    next_status := 'declined';
  else
    raise exception 'unknown action';
  end if;

  update public.lobby_invites
  set status = next_status,
      responded_at = timezone('utc', now())
  where id = p_invite_id
    and recipient_id = user_id;

  get diagnostics updated_count = row_count;
  if updated_count = 0 then
    raise exception 'invite not found';
  end if;

  return p_invite_id;
end;
$$;

grant execute on function public.send_friend_request(text) to authenticated;
grant execute on function public.fetch_friend_requests() to authenticated;
grant execute on function public.respond_friend_request(uuid, text) to authenticated;
grant execute on function public.send_lobby_invite(uuid, text) to authenticated;
grant execute on function public.fetch_lobby_invites() to authenticated;
grant execute on function public.respond_lobby_invite(uuid, text) to authenticated;
