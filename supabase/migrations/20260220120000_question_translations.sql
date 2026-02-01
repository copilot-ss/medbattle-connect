create table if not exists public.question_translations (
  id uuid primary key default extensions.uuid_generate_v4(),
  question_id uuid not null references public.questions(id) on delete cascade,
  language text not null,
  question text not null,
  options jsonb not null,
  correct_answer text not null,
  explanation text,
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now()),
  constraint question_translations_unique unique (question_id, language),
  constraint question_translations_options_array check (jsonb_typeof(options) = 'array'::text)
);

alter table public.question_translations enable row level security;

create policy "question_translations_select_public"
  on public.question_translations
  for select
  using (true);

grant select on table public.question_translations to anon, authenticated;
grant insert, update, delete on table public.question_translations to service_role;

create index if not exists idx_question_translations_language
  on public.question_translations (language);

create index if not exists idx_question_translations_question
  on public.question_translations (question_id);

drop trigger if exists trg_question_translations_set_updated_at on public.question_translations;
create trigger trg_question_translations_set_updated_at
before update on public.question_translations
for each row execute function public.set_updated_at();

insert into public.question_translations (
  question_id,
  language,
  question,
  options,
  correct_answer,
  explanation,
  created_at,
  updated_at
)
select
  id,
  'de',
  question,
  options,
  correct_answer,
  explanation,
  created_at,
  updated_at
from public.questions
on conflict (question_id, language) do nothing;

create or replace function public.sync_question_translation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.question_translations (
    question_id,
    language,
    question,
    options,
    correct_answer,
    explanation,
    created_at,
    updated_at
  )
  values (
    new.id,
    'de',
    new.question,
    new.options,
    new.correct_answer,
    new.explanation,
    new.created_at,
    new.updated_at
  )
  on conflict (question_id, language) do update
    set question = excluded.question,
        options = excluded.options,
        correct_answer = excluded.correct_answer,
        explanation = excluded.explanation,
        updated_at = excluded.updated_at;
  return new;
end;
$$;

drop trigger if exists trg_questions_sync_translation on public.questions;
create trigger trg_questions_sync_translation
after insert or update of question, options, correct_answer, explanation on public.questions
for each row execute function public.sync_question_translation();

drop function if exists public.create_match(text, integer, text);
drop function if exists public.create_match(text, integer);
drop function if exists public.update_match_settings(uuid, text, integer);
drop function if exists public.get_questions(text, integer, text);

create or replace function public.get_questions(
  p_difficulty text default null,
  p_limit integer default 6,
  p_category text default null,
  p_language text default 'de',
  p_fallback_language text default 'de'
)
returns table (
  id uuid,
  category text,
  difficulty text,
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
      q.difficulty,
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
    where q.difficulty = case
      when p_difficulty in ('leicht', 'mittel', 'schwer') then p_difficulty
      else 'mittel'
    end
      and (
        p_category is null
        or trim(p_category) = ''
        or q.category = p_category
      )
  )
  select *
  from normalized
  where question is not null
    and correct_answer is not null
    and jsonb_typeof(options) = 'array'
    and jsonb_array_length(options) >= 2
  order by random()
  limit greatest(1, least(coalesce(p_limit, 6), 50));
$$;

create or replace function public.create_match(
  p_difficulty text default 'mittel',
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
  normalized_difficulty text := public.normalize_difficulty(p_difficulty);
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
      normalized_difficulty,
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
        difficulty,
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
        normalized_difficulty,
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
  p_difficulty text default 'mittel',
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
  normalized_difficulty text := public.normalize_difficulty(p_difficulty);
  limit_count integer := greatest(1, least(coalesce(p_question_limit, 5), 50));
  normalized_language text := coalesce(nullif(trim(p_language), ''), 'de');
  normalized_fallback text := nullif(trim(p_fallback_language), '');
  match_row public.matches;
  host_username text;
  questions_json jsonb;
  question_ids uuid[];
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
      normalized_difficulty,
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
  into questions_json, question_ids
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
  set difficulty = normalized_difficulty,
      question_limit = jsonb_array_length(questions_json),
      question_ids = question_ids,
      questions = questions_json,
      state = next_state,
      updated_at = now()
  where id = p_match_id
  returning * into match_row;

  return match_row;
end;
$$;

grant execute on function public.get_questions(text, integer, text, text, text) to anon, authenticated;
grant execute on function public.create_match(text, integer, text, text, text) to authenticated;
grant execute on function public.update_match_settings(uuid, text, integer, text, text) to authenticated;
