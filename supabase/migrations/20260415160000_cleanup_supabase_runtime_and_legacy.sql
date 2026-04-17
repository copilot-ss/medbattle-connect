-- Clean up unused Supabase runtime paths and legacy database objects.

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
  display_name text,
  xp integer,
  avatar_url text,
  avatar_icon text,
  avatar_color text
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
    p.display_name::text as display_name,
    u.xp::integer as xp,
    p.avatar_url::text as avatar_url,
    p.avatar_icon::text as avatar_icon,
    p.avatar_color::text as avatar_color
  from public.users u
  left join latest_scores ls on ls.user_id = u.id
  left join public.profiles p on p.id = u.id
  where coalesce(u.leaderboard_points, 0) > 0
  order by
    u.leaderboard_points desc,
    coalesce(ls.last_scored_at, u.created_at) asc,
    u.id asc
  limit greatest(1, least(coalesce(p_limit, 20), 100));
$$;

drop function if exists public.sync_profile_avatar(text, text, text);

create or replace function public.sync_profile_avatar(
  p_avatar_url text default null,
  p_avatar_icon text default null,
  p_avatar_color text default null
)
returns table (
  user_id uuid,
  avatar_url text,
  avatar_icon text,
  avatar_color text
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
    insert into public.profiles as p (
      id,
      avatar_url,
      avatar_icon,
      avatar_color
    )
    values (
      auth_user_id,
      nullif(trim(p_avatar_url), ''),
      nullif(trim(p_avatar_icon), ''),
      nullif(trim(p_avatar_color), '')
    )
    on conflict (id) do update
      set avatar_url = excluded.avatar_url,
          avatar_icon = excluded.avatar_icon,
          avatar_color = excluded.avatar_color
    returning
      p.id::uuid as user_id,
      p.avatar_url::text as avatar_url,
      p.avatar_icon::text as avatar_icon,
      p.avatar_color::text as avatar_color;
end;
$$;

-- Verified dead or redundant objects from linked DB inspection:
-- - legacy tables no longer referenced by the app
-- - duplicate or never-used indexes on retired access paths
-- Join codes are generated and matched in uppercase, so `matches_code_key`
-- duplicates `matches_code_unique_idx`.
drop index if exists public.matches_questions_gin;
drop index if exists public.questions_question_category_idx;
drop index if exists public.matches_code_key;
drop index if exists public.lobby_invites_sender_idx;
drop index if exists public.idx_matches_category;

drop table if exists public.match_results cascade;
drop table if exists public.friends_table cascade;

analyze public.users;
analyze public.profiles;
analyze public.matches;
analyze public.lobby_invites;
analyze public.questions;
analyze public.scores;

grant execute on function public.get_leaderboard(integer) to anon, authenticated;
grant execute on function public.sync_profile_avatar(text, text, text) to authenticated;
