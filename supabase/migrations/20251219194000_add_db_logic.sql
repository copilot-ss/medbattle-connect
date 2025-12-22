create or replace function public.derive_username(
  p_email text,
  p_metadata jsonb,
  p_user_id uuid
)
returns text
language plpgsql
immutable
as $$
declare
  base_username text;
  sanitized text;
begin
  base_username := null;

  if p_metadata is not null and p_metadata ? 'username' then
    base_username := p_metadata->>'username';
  end if;

  if base_username is null or length(trim(base_username)) = 0 then
    if p_email is not null and length(trim(p_email)) > 0 then
      base_username := split_part(p_email, '@', 1);
    else
      base_username := 'medbattle_user';
    end if;
  end if;

  sanitized := lower(regexp_replace(base_username, '[^a-z0-9_]', '', 'g'));

  if sanitized is null or length(sanitized) = 0 then
    sanitized := 'medbattle_' || substr(md5(p_user_id::text), 1, 8);
  end if;

  return sanitized;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, username, email, premium)
  values (
    new.id,
    public.derive_username(new.email, new.raw_user_meta_data, new.id),
    coalesce(new.email, concat('no-email-', new.id::text)),
    false
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

insert into public.users (id, username, email, premium)
select
  u.id,
  public.derive_username(u.email, u.raw_user_meta_data, u.id),
  coalesce(u.email, concat('no-email-', u.id::text)),
  false
from auth.users u
where not exists (
  select 1
  from public.users p
  where p.id = u.id
);

create or replace function public.get_questions(
  p_difficulty text default null,
  p_limit integer default 6,
  p_category text default null
)
returns setof public.questions
language sql
stable
set search_path = public
as $$
  select *
  from public.questions
  where difficulty = case
    when p_difficulty in ('leicht', 'mittel', 'schwer') then p_difficulty
    else 'mittel'
  end
    and (
      p_category is null
      or trim(p_category) = ''
      or category = p_category
    )
    and question is not null
    and correct_answer is not null
    and jsonb_typeof(options) = 'array'
    and jsonb_array_length(options) >= 2
  order by random()
  limit greatest(1, least(coalesce(p_limit, 6), 50));
$$;

create or replace function public.submit_score(
  p_user_id uuid,
  p_points integer,
  p_difficulty text
)
returns public.scores
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted public.scores;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  if p_user_id is null or p_user_id <> auth.uid() then
    raise exception 'invalid user';
  end if;

  insert into public.scores (user_id, points, difficulty)
  values (
    p_user_id,
    greatest(coalesce(p_points, 0), 0),
    nullif(trim(p_difficulty), '')
  )
  returning * into inserted;

  return inserted;
end;
$$;

create or replace function public.get_leaderboard(
  p_limit integer default 20
)
returns table (
  id uuid,
  user_id uuid,
  points integer,
  difficulty text,
  created_at timestamptz,
  username text
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
    u.username
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
  where auth.uid() is not null
  order by s.points desc, s.created_at asc
  limit greatest(1, least(coalesce(p_limit, 20), 100));
$$;

grant execute on function public.get_questions(text, integer, text) to anon, authenticated;
grant execute on function public.submit_score(uuid, integer, text) to authenticated;
grant execute on function public.get_leaderboard(integer) to authenticated;
