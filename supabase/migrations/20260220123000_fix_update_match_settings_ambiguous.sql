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
  set difficulty = normalized_difficulty,
      question_limit = jsonb_array_length(questions_json),
      question_ids = next_question_ids,
      questions = questions_json,
      state = next_state,
      updated_at = now()
  where id = p_match_id
  returning * into match_row;

  return match_row;
end;
$$;
