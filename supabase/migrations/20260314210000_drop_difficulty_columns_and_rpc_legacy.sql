-- Remove the remaining difficulty columns and legacy RPC signatures.

drop function if exists public.get_questions(text, integer, text, text, text);
drop function if exists public.get_questions(integer, text, text, text);
drop function if exists public.create_match(text, integer, text, text, text);
drop function if exists public.create_match(integer, text, text, text);
drop function if exists public.update_match_settings(uuid, text, integer, text, text);
drop function if exists public.update_match_settings(uuid, integer, text, text);
drop function if exists public.get_open_matches(text);
drop function if exists public.get_open_matches();
drop function if exists public.submit_score(uuid, integer, text);
drop function if exists public.submit_score(uuid, integer);
drop function if exists public.normalize_difficulty(text);

drop index if exists public.idx_questions_difficulty_category;
drop index if exists public.idx_questions_difficulty;
drop index if exists public.questions_difficulty_idx;
drop index if exists public.matches_waiting_lookup_idx;
drop index if exists public.questions_unique_question_category_difficulty;

alter table public.matches
  drop constraint if exists matches_difficulty_check;

alter table public.questions
  drop constraint if exists questions_difficulty_check;

alter table public.scores
  drop constraint if exists scores_difficulty_check;

alter table public.matches
  drop column if exists difficulty;

alter table public.questions
  drop column if exists difficulty;

alter table public.scores
  drop column if exists difficulty;

create index if not exists matches_waiting_lookup_idx
  on public.matches (status, created_at);

create index if not exists idx_questions_category
  on public.questions (category);

create index if not exists questions_question_category_idx
  on public.questions (lower(trim(question)), lower(trim(category)));

create or replace function public.get_questions(
  p_limit integer default 6,
  p_category text default null,
  p_language text default 'de',
  p_fallback_language text default 'de'
)
returns table (
  id uuid,
  category text,
  question text,
  options jsonb,
  correct_answer text,
  explanation text,
  updated_at timestamptz
)
language sql
stable
set search_path = public
as $$
  with normalized as (
    select
      q.id,
      q.category,
      coalesce(t_lang.question, t_fb.question) as question,
      coalesce(t_lang.options, t_fb.options) as options,
      coalesce(t_lang.correct_answer, t_fb.correct_answer) as correct_answer,
      coalesce(t_lang.explanation, t_fb.explanation) as explanation,
      greatest(
        q.updated_at,
        coalesce(t_lang.updated_at, t_fb.updated_at, q.updated_at)
      ) as updated_at
    from public.questions q
    left join public.question_translations t_lang
      on t_lang.question_id = q.id
      and t_lang.language = coalesce(nullif(trim(p_language), ''), 'de')
    left join public.question_translations t_fb
      on t_fb.question_id = q.id
      and nullif(trim(p_fallback_language), '') is not null
      and t_fb.language = nullif(trim(p_fallback_language), '')
    where (
      p_category is null
      or trim(p_category) = ''
      or q.category = p_category
    )
  ),
  deduped as (
    select id, category, question, options, correct_answer, explanation, updated_at
    from (
      select
        normalized.*,
        row_number() over (
          partition by lower(trim(question)), lower(trim(category))
          order by random()
        ) as duplicate_rank
      from normalized
      where question is not null
        and correct_answer is not null
        and jsonb_typeof(options) = 'array'
        and jsonb_array_length(options) >= 2
    ) ranked
    where duplicate_rank = 1
  )
  select *
  from deduped
  order by random()
  limit greatest(1, least(coalesce(p_limit, 6), 50));
$$;

create or replace function public.create_match(
  p_question_limit integer default 5,
  p_category text default null,
  p_language text default 'de',
  p_fallback_language text default 'de'
)
returns public.matches
language plpgsql
security definer
set search_path = public
as $$
declare
  host_id uuid := auth.uid();
  limit_count integer := greatest(1, least(coalesce(p_question_limit, 5), 50));
  normalized_category text := nullif(trim(p_category), '');
  normalized_language text := coalesce(nullif(trim(p_language), ''), 'de');
  normalized_fallback text := nullif(trim(p_fallback_language), '');
  host_username text;
  questions_json jsonb;
  question_ids uuid[];
  next_state jsonb;
  new_match public.matches;
  join_code text;
  attempts integer := 0;
begin
  if host_id is null then
    raise exception 'not authenticated';
  end if;

  with selected as (
    select id, question, correct_answer, options, explanation
    from public.get_questions(
      limit_count,
      normalized_category,
      normalized_language,
      normalized_fallback
    )
  ),
  normalized as (
    select
      id,
      id::text as id_text,
      question,
      correct_answer,
      explanation,
      public.normalize_question_options(options, correct_answer) as options
    from selected
  )
  select
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', id_text,
          'question', question,
          'correct_answer', correct_answer,
          'explanation', explanation,
          'options', options
        )
      ),
      '[]'::jsonb
    ),
    coalesce(array_agg(id), array[]::uuid[])
  into questions_json, question_ids
  from normalized;

  if jsonb_array_length(questions_json) = 0 then
    raise exception 'No questions available for multiplayer.';
  end if;

  select username into host_username
  from public.users
  where id = host_id;

  next_state := jsonb_build_object(
    'host', jsonb_build_object(
      'userId', host_id,
      'username', host_username,
      'index', 0,
      'score', 0,
      'finished', false,
      'answers', jsonb_build_array(),
      'ready', false
    ),
    'guest', jsonb_build_object(
      'userId', null,
      'username', null,
      'index', 0,
      'score', 0,
      'finished', false,
      'answers', jsonb_build_array(),
      'ready', false
    ),
    'history', jsonb_build_array()
  );

  loop
    attempts := attempts + 1;
    join_code := public.generate_join_code();

    begin
      insert into public.matches (
        code,
        host_id,
        guest_id,
        category,
        question_limit,
        question_ids,
        questions,
        status,
        state,
        started_at,
        finished_at,
        updated_at
      )
      values (
        join_code,
        host_id,
        null,
        normalized_category,
        jsonb_array_length(questions_json),
        question_ids,
        questions_json,
        'waiting',
        next_state,
        null,
        null,
        now()
      )
      returning * into new_match;

      exit;
    exception when unique_violation then
      if attempts >= 5 then
        raise exception 'Unable to generate unique match code.';
      end if;
    end;
  end loop;

  return new_match;
end;
$$;

create or replace function public.update_match_settings(
  p_match_id uuid,
  p_question_limit integer default 5,
  p_language text default 'de',
  p_fallback_language text default 'de'
)
returns public.matches
language plpgsql
security definer
set search_path = public
as $$
declare
  user_id uuid := auth.uid();
  limit_count integer := greatest(1, least(coalesce(p_question_limit, 5), 50));
  normalized_language text := coalesce(nullif(trim(p_language), ''), 'de');
  normalized_fallback text := nullif(trim(p_fallback_language), '');
  match_row public.matches;
  host_username text;
  questions_json jsonb;
  next_question_ids uuid[];
  next_state jsonb;
  resolved_category text;
begin
  if user_id is null then
    raise exception 'not authenticated';
  end if;

  select *
  into match_row
  from public.matches
  where id = p_match_id
  for update;

  if not found then
    raise exception 'Match not found.';
  end if;

  if match_row.host_id <> user_id then
    raise exception 'Only host can update lobby.';
  end if;

  if match_row.status <> 'waiting' then
    raise exception 'Match already started.';
  end if;

  resolved_category := nullif(trim(match_row.category), '');

  with selected as (
    select id, question, correct_answer, options, explanation
    from public.get_questions(
      limit_count,
      resolved_category,
      normalized_language,
      normalized_fallback
    )
  ),
  normalized as (
    select
      id,
      id::text as id_text,
      question,
      correct_answer,
      explanation,
      public.normalize_question_options(options, correct_answer) as options
    from selected
  )
  select
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', id_text,
          'question', question,
          'correct_answer', correct_answer,
          'explanation', explanation,
          'options', options
        )
      ),
      '[]'::jsonb
    ),
    coalesce(array_agg(id), array[]::uuid[])
  into questions_json, next_question_ids
  from normalized;

  if jsonb_array_length(questions_json) = 0 then
    raise exception 'No questions available for selected settings.';
  end if;

  select username into host_username
  from public.users
  where id = user_id;

  next_state := jsonb_build_object(
    'host', jsonb_build_object(
      'userId', user_id,
      'username', host_username,
      'index', 0,
      'score', 0,
      'finished', false,
      'answers', jsonb_build_array(),
      'ready', false
    ),
    'guest', jsonb_build_object(
      'userId', match_row.guest_id,
      'username', match_row.state->'guest'->>'username',
      'index', 0,
      'score', 0,
      'finished', false,
      'answers', jsonb_build_array(),
      'ready', false
    ),
    'history', jsonb_build_array()
  );

  update public.matches
  set question_limit = jsonb_array_length(questions_json),
      question_ids = next_question_ids,
      questions = questions_json,
      state = next_state,
      updated_at = now()
  where id = p_match_id
  returning * into match_row;

  return match_row;
end;
$$;

create or replace function public.get_open_matches()
returns table (
  id uuid,
  code text,
  question_limit integer,
  created_at timestamptz,
  host_username text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
    select
      m.id,
      m.code,
      m.question_limit,
      m.created_at,
      coalesce(m.state -> 'host' ->> 'username', u.username) as host_username
    from public.matches m
    left join public.users u on u.id = m.host_id
    where m.status = 'waiting'
      and m.guest_id is null
    order by m.created_at asc
    limit 24;
end;
$$;

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
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  if p_user_id is null or p_user_id <> auth.uid() then
    raise exception 'invalid user';
  end if;

  insert into public.scores (user_id, points)
  values (
    p_user_id,
    greatest(coalesce(p_points, 0), 0)
  )
  returning * into inserted;

  return inserted;
end;
$$;

grant execute on function public.get_questions(integer, text, text, text) to anon, authenticated;
grant execute on function public.create_match(integer, text, text, text) to authenticated;
grant execute on function public.update_match_settings(uuid, integer, text, text) to authenticated;
grant execute on function public.get_open_matches() to authenticated;
grant execute on function public.submit_score(uuid, integer) to authenticated;
