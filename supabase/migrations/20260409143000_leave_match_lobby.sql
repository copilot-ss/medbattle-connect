create or replace function public.leave_match_lobby(
  p_match_id uuid,
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
  match_row public.matches;
  remaining_user_id uuid := null;
  remaining_role_key text := null;
  remaining_state jsonb := '{}'::jsonb;
  remaining_username text := null;
  normalized_language text := coalesce(nullif(trim(p_language), ''), 'de');
  normalized_fallback text := nullif(trim(p_fallback_language), '');
  resolved_category text := null;
  questions_json jsonb := '[]'::jsonb;
  next_question_ids uuid[] := array[]::uuid[];
  next_question_limit integer := 0;
  next_state jsonb;
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

  if match_row.host_id <> user_id and match_row.guest_id <> user_id then
    raise exception 'Match not found.';
  end if;

  if match_row.status not in ('waiting', 'completed') then
    raise exception 'Match lobby cannot be left right now.';
  end if;

  if match_row.host_id = user_id then
    if match_row.guest_id is not null then
      remaining_user_id := match_row.guest_id;
      remaining_role_key := 'guest';
    end if;
  else
    if match_row.host_id is not null then
      remaining_user_id := match_row.host_id;
      remaining_role_key := 'host';
    end if;
  end if;

  if remaining_user_id is null then
    update public.matches
    set status = 'cancelled',
        finished_at = now(),
        updated_at = now()
    where id = match_row.id
    returning * into match_row;

    return match_row;
  end if;

  remaining_state := coalesce(match_row.state -> remaining_role_key, '{}'::jsonb);

  select username into remaining_username
  from public.users
  where id = remaining_user_id;

  remaining_username := coalesce(
    remaining_username,
    nullif(trim(remaining_state->>'username'), '')
  );

  if match_row.status = 'completed' then
    resolved_category := nullif(trim(match_row.category), '');

    with selected as (
      select id, question, correct_answer, options, explanation
      from public.get_questions(
        greatest(1, least(coalesce(match_row.question_limit, 5), 50)),
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
      coalesce(array_agg(id), array[]::uuid[]),
      coalesce(count(*), 0)::integer
    into questions_json, next_question_ids, next_question_limit
    from normalized;

    if jsonb_array_length(questions_json) = 0 then
      raise exception 'No questions available for multiplayer.';
    end if;
  else
    questions_json := coalesce(match_row.questions, '[]'::jsonb);
    next_question_ids := coalesce(match_row.question_ids, array[]::uuid[]);
    next_question_limit := greatest(1, least(coalesce(match_row.question_limit, 5), 50));
  end if;

  next_state := jsonb_build_object(
    'host', jsonb_build_object(
      'userId', remaining_user_id,
      'username', remaining_username,
      'title', remaining_state->>'title',
      'avatarUrl', remaining_state->>'avatarUrl',
      'avatarIcon', remaining_state->>'avatarIcon',
      'avatarColor', remaining_state->>'avatarColor',
      'index', 0,
      'score', 0,
      'finished', false,
      'answers', jsonb_build_array(),
      'ready', false
    ),
    'guest', jsonb_build_object(
      'userId', null,
      'username', null,
      'title', null,
      'avatarUrl', null,
      'avatarIcon', null,
      'avatarColor', null,
      'index', 0,
      'score', 0,
      'finished', false,
      'answers', jsonb_build_array(),
      'ready', false
    ),
    'history', jsonb_build_array()
  );

  update public.matches
  set host_id = remaining_user_id,
      guest_id = null,
      question_limit = next_question_limit,
      question_ids = next_question_ids,
      questions = questions_json,
      state = next_state,
      status = 'waiting',
      started_at = null,
      finished_at = null,
      updated_at = now()
  where id = match_row.id
  returning * into match_row;

  return match_row;
end;
$$;

grant execute on function public.leave_match_lobby(uuid, text, text) to authenticated;
