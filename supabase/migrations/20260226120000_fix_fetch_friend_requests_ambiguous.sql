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
  auth_user_id uuid := auth.uid();
begin
  if auth_user_id is null then
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
        case when f.user_id = auth_user_id then f.friend_id else f.user_id end
      ) as requester_id
    ) requester
    left join public.users u on u.id = requester.requester_id
    where f.status = 'pending'
      and (f.user_id = auth_user_id or f.friend_id = auth_user_id)
      and (f.requested_by is null or f.requested_by <> auth_user_id)
    order by f.created_at desc;
end;
$$;

grant execute on function public.fetch_friend_requests() to authenticated;
