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
    with best_scores as (
      select distinct on (s.user_id)
        s.user_id,
        s.points,
        s.created_at
      from public.scores s
      order by s.user_id, s.points desc, s.created_at asc
    ),
    ranked_scores as (
      select
        bs.user_id,
        bs.points,
        row_number() over (order by bs.points desc, bs.created_at asc)::integer as rank
      from best_scores bs
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
      rs.points::integer as points,
      rs.rank::integer as rank
    from public.users u
    left join public.profiles p on p.id = u.id
    left join ranked_scores rs on rs.user_id = u.id
    where u.id = target_user_id
    limit 1;
end;
$$;

grant execute on function public.fetch_public_profile(uuid, text) to authenticated;
