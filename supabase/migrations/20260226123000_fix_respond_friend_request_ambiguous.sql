create or replace function public.respond_friend_request(p_request_id uuid, p_action text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  auth_user_id uuid := auth.uid();
  action text := lower(coalesce(p_action, ''));
  u uuid;
  v uuid;
  st text;
  requester uuid;
  updated_count integer := 0;
begin
  if auth_user_id is null then
    raise exception 'not authenticated';
  end if;
  if p_request_id is null then
    raise exception 'request id missing';
  end if;

  select f.user_id, f.friend_id, f.status, f.requested_by
  into u, v, st, requester
  from public.friendships f
  where f.id = p_request_id
  for update;

  if not found then
    raise exception 'friendship not found';
  end if;

  if st <> 'pending' then
    raise exception 'friendship is not pending';
  end if;

  if auth_user_id <> u and auth_user_id <> v then
    raise exception 'not authorized to respond';
  end if;

  if action in ('accept', 'accepted') then
    if requester is not null and auth_user_id = requester then
      raise exception 'requester cannot accept this request';
    end if;
    update public.friendships f
    set status = 'accepted',
        updated_at = timezone('utc', now())
    where f.id = p_request_id;
  elsif action in ('decline', 'declined', 'reject', 'rejected') then
    delete from public.friendships f
    where f.id = p_request_id;
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

grant execute on function public.respond_friend_request(uuid, text) to authenticated;
