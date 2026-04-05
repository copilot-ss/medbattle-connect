create or replace function public.normalize_friend_code(p_code text)
returns text
language sql
immutable
as $$
  select right(
    upper(regexp_replace(coalesce(p_code, ''), '[^a-zA-Z0-9_]', '', 'g')),
    7
  );
$$;

create or replace function public.derive_friend_code(p_user_id uuid)
returns text
language plpgsql
immutable
as $$
declare
  compact text;
  slice text;
begin
  if p_user_id is null then
    return '';
  end if;

  compact := regexp_replace(p_user_id::text, '[^a-zA-Z0-9]', '', 'g');

  if compact is null or length(compact) = 0 then
    return '';
  end if;

  slice := upper(right(compact, 7));
  return lpad(slice, 7, '0');
end;
$$;

create or replace function public.generate_friend_code()
returns trigger
language plpgsql
as $$
begin
  new.friend_code := public.derive_friend_code(new.id);
  return new;
end;
$$;

do $$
declare
  duplicate_code text;
begin
  select derived_code
  into duplicate_code
  from (
    select public.derive_friend_code(p.id) as derived_code
    from public.profiles p
    group by public.derive_friend_code(p.id)
    having count(*) > 1
    limit 1
  ) duplicates;

  if duplicate_code is not null then
    raise exception 'friend code collision after shortening to 7 characters: %', duplicate_code;
  end if;
end $$;

update public.profiles p
set friend_code = public.derive_friend_code(p.id)
where coalesce(p.friend_code, '') is distinct from public.derive_friend_code(p.id);

do $$
begin
  if to_regclass('public.friends') is not null
    and exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'friends'
        and column_name = 'id'
    )
    and exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'friends'
        and column_name = 'owner_id'
    )
    and exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'friends'
        and column_name = 'friend_code'
    )
  then
    execute $sql$
      delete from public.friends f
      using public.friends duplicate
      where f.id < duplicate.id
        and f.owner_id = duplicate.owner_id
        and public.normalize_friend_code(f.friend_code)
          = public.normalize_friend_code(duplicate.friend_code)
    $sql$;

    execute $sql$
      update public.friends
      set friend_code = public.normalize_friend_code(friend_code)
      where coalesce(friend_code, '') is distinct from public.normalize_friend_code(friend_code)
    $sql$;
  end if;
end $$;

do $$
begin
  if to_regclass('public.friends') is not null
    and exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'friends'
        and column_name = 'owner_id'
    )
    and exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'friends'
        and column_name = 'friend_code'
    )
    and exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = 'friends'
        and policyname = 'Friends delete owner or code'
    )
  then
    drop policy "Friends delete owner or code" on public.friends;

    create policy "Friends delete owner or code" on public.friends
      for delete
      using (
        auth.uid() = owner_id
        or public.normalize_friend_code(friend_code) = public.derive_friend_code(auth.uid())
      );
  end if;
end $$;

drop function if exists public.fetch_public_profile(uuid, text);

create or replace function public.fetch_public_profile(
  p_user_id uuid default null,
  p_friend_code text default null
)
returns table (
  user_id uuid,
  friend_code text,
  username text,
  display_name text,
  avatar_url text,
  avatar_icon text,
  avatar_color text,
  bio text,
  xp integer,
  coins integer,
  quizzes integer,
  correct integer,
  questions integer,
  points integer,
  rank integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  auth_user_id uuid := auth.uid();
  target_user_id uuid := null;
  normalized_code text := null;
begin
  if auth_user_id is null then
    raise exception 'not authenticated';
  end if;

  if p_user_id is not null then
    target_user_id := p_user_id;
  else
    normalized_code := public.normalize_friend_code(coalesce(p_friend_code, ''));
    if normalized_code is not null and normalized_code <> '' then
      select p.id
      into target_user_id
      from public.profiles p
      where public.normalize_friend_code(p.friend_code) = normalized_code
      limit 1;

      if target_user_id is null then
        select u.id
        into target_user_id
        from public.users u
        where public.normalize_friend_code(public.derive_friend_code(u.id)) = normalized_code
        limit 1;
      end if;
    end if;
  end if;

  if target_user_id is null then
    return;
  end if;

  return query
    with latest_scores as (
      select
        s.user_id,
        max(s.created_at) as last_scored_at
      from public.scores s
      group by s.user_id
    ),
    ranked_users as (
      select
        u.id as ranked_user_id,
        u.leaderboard_points::integer as points,
        row_number() over (
          order by
            u.leaderboard_points desc,
            coalesce(ls.last_scored_at, u.created_at) asc,
            u.id asc
        )::integer as rank
      from public.users u
      left join latest_scores ls on ls.user_id = u.id
      where coalesce(u.leaderboard_points, 0) > 0
    )
    select
      u.id::uuid as user_id,
      public.derive_friend_code(u.id)::text as friend_code,
      u.username::text as username,
      p.display_name::text as display_name,
      p.avatar_url::text as avatar_url,
      p.avatar_icon::text as avatar_icon,
      p.avatar_color::text as avatar_color,
      p.bio::text as bio,
      u.xp::integer as xp,
      u.coins::integer as coins,
      u.quizzes::integer as quizzes,
      u.correct::integer as correct,
      u.questions::integer as questions,
      ru.points::integer as points,
      ru.rank::integer as rank
    from public.users u
    left join public.profiles p on p.id = u.id
    left join ranked_users ru on ru.ranked_user_id = u.id
    where u.id = target_user_id
    limit 1;
end;
$$;

alter function public.normalize_friend_code(text) set search_path = public;
alter function public.derive_friend_code(uuid) set search_path = public;
alter function public.generate_friend_code() set search_path = public;

grant execute on function public.normalize_friend_code(text) to anon, authenticated;
grant execute on function public.derive_friend_code(uuid) to anon, authenticated;
grant execute on function public.fetch_public_profile(uuid, text) to authenticated;
