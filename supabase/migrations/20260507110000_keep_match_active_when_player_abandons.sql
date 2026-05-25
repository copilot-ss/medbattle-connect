create or replace function public.abandon_match(
  p_match_id uuid
)
returns public.matches
language plpgsql
security definer
set search_path = public
as $$
declare
  user_id uuid := auth.uid();
  match_row public.matches;
  role_key text;
  next_state jsonb;
  role_state jsonb;
  all_finished boolean;
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
    raise exception 'Match nicht gefunden.';
  end if;

  role_key := public.match_user_role(match_row.state, match_row.host_id, match_row.guest_id, user_id);
  if role_key is null then
    raise exception 'Ungueltige Spielerrolle.';
  end if;

  if match_row.status not in ('waiting', 'active') then
    return match_row;
  end if;

  next_state := coalesce(match_row.state, '{}'::jsonb);
  role_state := coalesce(next_state -> role_key, '{}'::jsonb);
  role_state := jsonb_set(role_state, '{score}', '0'::jsonb, true);
  role_state := jsonb_set(role_state, '{finished}', 'true'::jsonb, true);
  role_state := jsonb_set(role_state, '{gaveUp}', 'true'::jsonb, true);
  role_state := jsonb_set(role_state, '{leftAt}', to_jsonb(now()), true);
  next_state := jsonb_set(next_state, array[role_key], role_state, true);

  if match_row.status = 'waiting' then
    update public.matches
    set state = next_state,
        status = 'cancelled',
        finished_at = now(),
        updated_at = now()
    where id = match_row.id
    returning * into match_row;

    return match_row;
  end if;

  all_finished := public.match_all_players_finished(next_state);

  update public.matches
  set state = next_state,
      status = case when all_finished then 'completed' else match_row.status end,
      finished_at = case when all_finished then now() else match_row.finished_at end,
      updated_at = now()
  where id = match_row.id
  returning * into match_row;

  return match_row;
end;
$$;

create or replace function public.match_compact_player_state(
  p_state jsonb,
  p_removed_role text default null
)
returns jsonb
language plpgsql
stable
set search_path = public
as $$
declare
  rec record;
  next_state jsonb := jsonb_build_object(
    'history',
    coalesce(p_state->'history', jsonb_build_array())
  );
  next_index integer := 0;
  next_key text;
begin
  for rec in
    select *
    from public.match_participant_rows(p_state)
    where (p_removed_role is null or role_key <> p_removed_role)
      and not coalesce((player_state->>'gaveUp')::boolean, false)
    order by sort_order, role_key
  loop
    next_index := next_index + 1;
    next_key := public.match_player_key_for_index(next_index);
    next_state := jsonb_set(next_state, array[next_key], rec.player_state, true);
  end loop;

  if next_index < 2 then
    next_state := jsonb_set(
      next_state,
      '{guest}',
      public.match_empty_player_state(),
      true
    );
  end if;

  return next_state;
end;
$$;

create or replace function public.match_reset_active_players(p_state jsonb)
returns jsonb
language plpgsql
stable
set search_path = public
as $$
declare
  rec record;
  next_state jsonb := jsonb_build_object('history', jsonb_build_array());
  player_username text;
  next_index integer := 0;
  next_key text;
begin
  for rec in
    select *
    from public.match_participant_rows(p_state)
    where not coalesce((player_state->>'gaveUp')::boolean, false)
    order by sort_order, role_key
  loop
    select u.username
    into player_username
    from public.users u
    where u.id::text = rec.player_state->>'userId';

    next_index := next_index + 1;
    next_key := public.match_player_key_for_index(next_index);
    next_state := jsonb_set(
      next_state,
      array[next_key],
      public.match_reset_player_state(
        rec.player_state,
        null,
        coalesce(player_username, rec.player_state->>'username')
      ),
      true
    );
  end loop;

  if not (next_state ? 'guest') then
    next_state := jsonb_set(
      next_state,
      '{guest}',
      public.match_empty_player_state(),
      true
    );
  end if;

  return next_state;
end;
$$;

create or replace function public.match_effective_lobby_host_id(
  p_state jsonb,
  p_host_id uuid default null
)
returns uuid
language sql
stable
set search_path = public
as $$
  with host_state as (
    select
      nullif(coalesce(p_state->'host'->>'userId', ''), '')::uuid as user_id,
      coalesce((p_state->'host'->>'gaveUp')::boolean, false) as gave_up
  ),
  first_active as (
    select nullif(player_state->>'userId', '')::uuid as user_id
    from public.match_participant_rows(p_state)
    where not coalesce((player_state->>'gaveUp')::boolean, false)
    order by sort_order, role_key
    limit 1
  )
  select coalesce(
    (select user_id from host_state where user_id is not null and not gave_up),
    (select user_id from first_active where user_id is not null),
    p_host_id
  );
$$;

create or replace function public.start_match(p_match_id uuid)
returns public.matches
language plpgsql
security definer
set search_path = public
as $$
declare
  user_id uuid := auth.uid();
  match_row public.matches;
  next_state jsonb;
  effective_host_id uuid;
  rec record;
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
    raise exception 'Match nicht gefunden.';
  end if;

  effective_host_id := public.match_effective_lobby_host_id(match_row.state, match_row.host_id);
  if effective_host_id is distinct from user_id then
    raise exception 'Nur der Host kann das Match starten.';
  end if;

  if match_row.status <> 'waiting' then
    raise exception 'Match laeuft bereits oder ist beendet.';
  end if;

  next_state := public.match_reset_active_players(match_row.state);

  if public.match_participant_count(next_state, null, null) < 2 then
    raise exception 'Zum Starten braucht die Lobby mindestens 2 Spieler.';
  end if;

  for rec in
    select *
    from public.match_participant_rows(next_state)
  loop
    next_state := jsonb_set(next_state, array[rec.role_key, 'ready'], 'true'::jsonb, true);
  end loop;

  update public.matches
  set host_id = public.match_host_id_from_state(next_state),
      guest_id = public.match_first_guest_id_from_state(next_state),
      status = 'active',
      started_at = coalesce(match_row.started_at, now()),
      state = next_state,
      updated_at = now()
  where id = match_row.id
  returning * into match_row;

  return match_row;
end;
$$;

create or replace function public.restart_match_lobby(
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
  questions_json jsonb;
  next_question_ids uuid[];
  next_state jsonb;
  resolved_category text;
  effective_host_id uuid;
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

  effective_host_id := public.match_effective_lobby_host_id(match_row.state, match_row.host_id);
  if effective_host_id is distinct from user_id then
    raise exception 'Only host can restart lobby.';
  end if;

  if match_row.status not in ('waiting', 'completed') then
    raise exception 'Match is not ready for a rematch.';
  end if;

  resolved_category := nullif(trim(match_row.category), '');

  with selected as (
    select id, question, correct_answer, options, explanation, image_url, image_alt
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
      image_url,
      image_alt,
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
          'image_url', image_url,
          'image_alt', image_alt,
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

  next_state := public.match_reset_active_players(match_row.state);

  if public.match_participant_count(next_state, null, null) < 2 then
    raise exception 'Zum Starten braucht die Lobby mindestens 2 Spieler.';
  end if;

  update public.matches
  set host_id = public.match_host_id_from_state(next_state),
      guest_id = public.match_first_guest_id_from_state(next_state),
      question_limit = jsonb_array_length(questions_json),
      question_ids = next_question_ids,
      questions = questions_json,
      state = next_state,
      status = 'waiting',
      started_at = null,
      finished_at = null,
      updated_at = now()
  where id = p_match_id
  returning * into match_row;

  return match_row;
end;
$$;
