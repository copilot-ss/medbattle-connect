create or replace function public.get_client_logs(
  p_limit integer default 50
)
returns table (
  id uuid,
  created_at timestamptz,
  level text,
  message text,
  stack text,
  context jsonb,
  user_id uuid
)
language sql
security definer
set search_path = public
as $$
  select
    id,
    created_at,
    level,
    message,
    stack,
    context,
    user_id
  from public.client_logs
  where created_at >= now() - interval '1 day'
  order by created_at desc
  limit greatest(1, least(coalesce(p_limit, 50), 200));
$$;

grant execute on function public.get_client_logs(integer) to anon, authenticated;
