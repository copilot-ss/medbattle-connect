drop function if exists public.fetch_friends();

create or replace function public.fetch_friends()
returns table (
  id uuid,
  owner_id uuid,
  code text,
  friend_username text,
  friend_xp integer,
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
      public.derive_friend_code(other_user.other_user_id) as code,
      u.username as friend_username,
      u.xp as friend_xp,
      f.created_at
    from public.friendships f
    cross join lateral (
      select
        case
          when f.user_id = auth_user_id then f.friend_id
          else f.user_id
        end as other_user_id
    ) other_user
    left join public.users u on u.id = other_user.other_user_id
    where f.status = 'accepted'
      and (f.user_id = auth_user_id or f.friend_id = auth_user_id)
    order by f.created_at asc;
end;
$$;

grant execute on function public.fetch_friends() to authenticated;
