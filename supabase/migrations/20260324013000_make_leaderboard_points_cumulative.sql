alter table public.users
  add column if not exists leaderboard_points integer not null default 0;

create index if not exists idx_users_leaderboard_points_created_at
  on public.users (leaderboard_points desc, created_at asc, id);

update public.users u
set leaderboard_points = coalesce(score_totals.total_points, 0)
from (
  select
    s.user_id,
    coalesce(sum(s.points), 0)::integer as total_points
  from public.scores s
  group by s.user_id
) score_totals
where u.id = score_totals.user_id;

create or replace function public.submit_score(
  p_user_id uuid,
  p_points integer
)
returns public.scores
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted public.scores;
  safe_points integer := greatest(coalesce(p_points, 0), 0);
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  if p_user_id is null or p_user_id <> auth.uid() then
    raise exception 'invalid user';
  end if;

  insert into public.scores (user_id, points)
  values (p_user_id, safe_points)
  returning * into inserted;

  update public.users
  set leaderboard_points = coalesce(leaderboard_points, 0) + safe_points
  where id = p_user_id;

  return inserted;
end;
$$;

drop function if exists public.get_leaderboard(integer);

create or replace function public.get_leaderboard(
  p_limit integer default 20
)
returns table (
  id uuid,
  user_id uuid,
  points integer,
  created_at timestamptz,
  username text,
  xp integer
)
language sql
security definer
set search_path = public
as $$
  with latest_scores as (
    select
      s.user_id,
      max(s.created_at) as last_scored_at
    from public.scores s
    group by s.user_id
  )
  select
    u.id,
    u.id as user_id,
    u.leaderboard_points::integer as points,
    coalesce(ls.last_scored_at, u.created_at) as created_at,
    u.username::text as username,
    u.xp::integer as xp
  from public.users u
  left join latest_scores ls on ls.user_id = u.id
  where coalesce(u.leaderboard_points, 0) > 0
  order by
    u.leaderboard_points desc,
    coalesce(ls.last_scored_at, u.created_at) asc,
    u.id asc
  limit greatest(1, least(coalesce(p_limit, 20), 100));
$$;

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
      p.friend_code::text as friend_code,
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

grant execute on function public.submit_score(uuid, integer) to authenticated;
grant execute on function public.get_leaderboard(integer) to anon, authenticated;
grant execute on function public.fetch_public_profile(uuid, text) to authenticated;
