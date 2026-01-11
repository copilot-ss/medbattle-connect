drop function if exists public.get_leaderboard(integer);

create or replace function public.get_leaderboard(
  p_limit integer default 20
)
returns table (
  id uuid,
  user_id uuid,
  points integer,
  difficulty text,
  created_at timestamptz,
  username text,
  xp integer
)
language sql
security definer
set search_path = public
as $$
  select
    s.id,
    s.user_id,
    s.points,
    s.difficulty,
    s.created_at,
    u.username,
    u.xp
  from (
    select distinct on (user_id)
      id,
      user_id,
      points,
      difficulty,
      created_at
    from public.scores
    order by user_id, points desc, created_at asc
  ) s
  left join public.users u on u.id = s.user_id
  order by s.points desc, s.created_at asc
  limit greatest(1, least(coalesce(p_limit, 20), 100));
$$;

grant execute on function public.get_leaderboard(integer) to anon, authenticated;
