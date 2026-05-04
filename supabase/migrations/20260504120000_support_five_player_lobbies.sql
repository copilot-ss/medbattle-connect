create or replace function public.is_match_player_key(p_role_key text)
returns boolean
language sql
immutable
set search_path = public
as $$
  select p_role_key = 'host' or p_role_key ~ '^guest[0-9]*$';
$$;

create or replace function public.match_player_sort_order(p_role_key text)
returns integer
language sql
immutable
set search_path = public
as $$
  select case
    when p_role_key = 'host' then 0
    when p_role_key = 'guest' then 1
    when p_role_key ~ '^guest[0-9]+$' then substring(p_role_key from 6)::integer
    else 999
  end;
$$;

create or replace function public.match_player_key_for_index(p_index integer)
returns text
language sql
immutable
set search_path = public
as $$
  select case
    when coalesce(p_index, 1) <= 1 then 'host'
    when p_index = 2 then 'guest'
    else 'guest' || (p_index - 1)::text
  end;
$$;

create or replace function public.match_empty_player_state()
returns jsonb
language sql
stable
set search_path = public
as $$
  select jsonb_build_object(
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
  );
$$;

create or replace function public.match_reset_player_state(
  p_player jsonb,
  p_user_id uuid default null,
  p_username text default null
)
returns jsonb
language sql
stable
set search_path = public
as $$
  select jsonb_build_object(
    'userId', coalesce(p_user_id::text, nullif(p_player->>'userId', '')),
    'username', coalesce(nullif(trim(p_username), ''), nullif(trim(p_player->>'username'), '')),
    'title', nullif(trim(p_player->>'title'), ''),
    'avatarUrl', nullif(trim(coalesce(p_player->>'avatarUrl', p_player->>'avatar_url')), ''),
    'avatarIcon', nullif(trim(coalesce(p_player->>'avatarIcon', p_player->>'avatar_icon')), ''),
    'avatarColor', nullif(trim(coalesce(p_player->>'avatarColor', p_player->>'avatar_color')), ''),
    'index', 0,
    'score', 0,
    'finished', false,
    'answers', jsonb_build_array(),
    'ready', false
  );
$$;

create or replace function public.match_participant_rows(p_state jsonb)
returns table (
  role_key text,
  player_state jsonb,
  sort_order integer
)
language sql
stable
set search_path = public
as $$
  select
    entry.key as role_key,
    entry.value as player_state,
    public.match_player_sort_order(entry.key) as sort_order
  from jsonb_each(coalesce(p_state, '{}'::jsonb)) as entry(key, value)
  where public.is_match_player_key(entry.key)
    and nullif(entry.value->>'userId', '') is not null
  order by public.match_player_sort_order(entry.key), entry.key;
$$;

create or replace function public.match_participant_count(
  p_state jsonb,
  p_host_id uuid default null,
  p_guest_id uuid default null
)
returns integer
language sql
stable
set search_path = public
as $$
  with state_count as (
    select count(*)::integer as value
    from public.match_participant_rows(p_state)
  ),
  fallback_count as (
    select (
      case when p_host_id is not null then 1 else 0 end
      + case when p_guest_id is not null then 1 else 0 end
    )::integer as value
  )
  select greatest(
    coalesce((select value from state_count), 0),
    coalesce((select value from fallback_count), 0),
    1
  );
$$;

create or replace function public.match_user_role(
  p_state jsonb,
  p_host_id uuid,
  p_guest_id uuid,
  p_user_id uuid
)
returns text
language plpgsql
stable
set search_path = public
as $$
declare
  role_key text;
begin
  if p_user_id is null then
    return null;
  end if;

  select r.role_key
  into role_key
  from public.match_participant_rows(p_state) r
  where r.player_state->>'userId' = p_user_id::text
  order by r.sort_order
  limit 1;

  if role_key is not null then
    return role_key;
  end if;

  if p_host_id = p_user_id then
    return 'host';
  end if;

  if p_guest_id = p_user_id then
    return 'guest';
  end if;

  return null;
end;
$$;

create or replace function public.match_state_has_player(
  p_state jsonb,
  p_host_id uuid,
  p_guest_id uuid,
  p_user_id uuid
)
returns boolean
language sql
stable
set search_path = public
as $$
  select public.match_user_role(p_state, p_host_id, p_guest_id, p_user_id) is not null;
$$;

create or replace function public.match_all_players_finished(p_state jsonb)
returns boolean
language sql
stable
set search_path = public
as $$
  with players as (
    select player_state
    from public.match_participant_rows(p_state)
  )
  select coalesce(count(*) > 0 and bool_and(coalesce((player_state->>'finished')::boolean, false)), false)
  from players;
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
    where p_removed_role is null or role_key <> p_removed_role
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
begin
  for rec in
    select *
    from public.match_participant_rows(p_state)
    order by sort_order, role_key
  loop
    select u.username
    into player_username
    from public.users u
    where u.id::text = rec.player_state->>'userId';

    next_state := jsonb_set(
      next_state,
      array[rec.role_key],
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

create or replace function public.match_host_id_from_state(p_state jsonb)
returns uuid
language sql
stable
set search_path = public
as $$
  select nullif(p_state->'host'->>'userId', '')::uuid;
$$;

create or replace function public.match_first_guest_id_from_state(p_state jsonb)
returns uuid
language sql
stable
set search_path = public
as $$
  select nullif(r.player_state->>'userId', '')::uuid
  from public.match_participant_rows(p_state) r
  where r.role_key <> 'host'
  order by r.sort_order, r.role_key
  limit 1;
$$;

drop policy if exists "matches_owner_select" on public.matches;
create policy "matches_owner_select"
  on public.matches
  as permissive
  for select
  to authenticated
  using (
    public.match_state_has_player(state, host_id, guest_id, (select auth.uid()))
    or ((select auth.uid()) = player1_id)
    or ((select auth.uid()) = player2_id)
    or (((select auth.uid()) is not null) and (status = 'waiting'::text))
  );

drop policy if exists "matches_owner_update" on public.matches;
create policy "matches_owner_update"
  on public.matches
  as permissive
  for update
  to authenticated
  using (
    public.match_state_has_player(state, host_id, guest_id, (select auth.uid()))
    or ((select auth.uid()) = player1_id)
    or ((select auth.uid()) = player2_id)
    or (
      (status = 'waiting'::text)
      and public.match_participant_count(state, host_id, guest_id) < 5
      and ((select auth.uid()) is not null)
    )
  )
  with check (
    public.match_state_has_player(state, host_id, guest_id, (select auth.uid()))
    or ((select auth.uid()) = player1_id)
    or ((select auth.uid()) = player2_id)
  );

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
  host_user_id uuid := auth.uid();
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
  if host_user_id is null then
    raise exception 'not authenticated';
  end if;

  with selected as (
    select id, question, correct_answer, options, explanation, image_url, image_alt
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
  into questions_json, question_ids
  from normalized;

  if jsonb_array_length(questions_json) = 0 then
    raise exception 'No questions available for multiplayer.';
  end if;

  select username into host_username
  from public.users
  where id = host_user_id;

  next_state := jsonb_build_object(
    'host',
    public.match_reset_player_state(
      jsonb_build_object('userId', host_user_id, 'username', host_username),
      host_user_id,
      host_username
    ),
    'guest',
    public.match_empty_player_state(),
    'history',
    jsonb_build_array()
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
        host_user_id,
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

create or replace function public.join_match(p_code text)
returns public.matches
language plpgsql
security definer
set search_path = public
as $$
declare
  joining_user_id uuid := auth.uid();
  sanitized_code text := upper(trim(p_code));
  match_row public.matches;
  guest_username text;
  next_state jsonb;
  next_role text;
  candidate_index integer;
  candidate_role text;
  role_state jsonb;
begin
  if joining_user_id is null then
    raise exception 'not authenticated';
  end if;

  if sanitized_code is null or length(sanitized_code) = 0 then
    raise exception 'Match-Code fehlt.';
  end if;

  select *
  into match_row
  from public.matches
  where code = sanitized_code
  for update;

  if not found then
    raise exception 'Match nicht gefunden.';
  end if;

  if public.match_user_role(
    match_row.state,
    match_row.host_id,
    match_row.guest_id,
    joining_user_id
  ) is not null then
    return match_row;
  end if;

  if match_row.status <> 'waiting' then
    raise exception 'Dieses Match läuft bereits oder ist beendet.';
  end if;

  if public.match_participant_count(match_row.state, match_row.host_id, match_row.guest_id) >= 5 then
    raise exception 'Diese Lobby ist bereits voll.';
  end if;

  next_state := coalesce(match_row.state, '{}'::jsonb);

  for candidate_index in 2..5 loop
    candidate_role := public.match_player_key_for_index(candidate_index);
    role_state := coalesce(next_state -> candidate_role, '{}'::jsonb);
    if nullif(role_state->>'userId', '') is null
      and not (candidate_role = 'guest' and match_row.guest_id is not null)
    then
      next_role := candidate_role;
      exit;
    end if;
  end loop;

  if next_role is null then
    raise exception 'Diese Lobby ist bereits voll.';
  end if;

  select username into guest_username
  from public.users
  where id = joining_user_id;

  next_state := jsonb_set(
    next_state,
    array[next_role],
    public.match_reset_player_state(
      jsonb_build_object('userId', joining_user_id, 'username', guest_username),
      joining_user_id,
      guest_username
    ),
    true
  );

  update public.matches
  set guest_id = case
        when guest_id is null then joining_user_id
        else guest_id
      end,
      state = next_state,
      updated_at = now()
  where id = match_row.id
  returning * into match_row;

  return match_row;
end;
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

  if match_row.host_id <> user_id then
    raise exception 'Nur der Host kann das Match starten.';
  end if;

  if match_row.status <> 'waiting' then
    raise exception 'Match läuft bereits oder ist beendet.';
  end if;

  if public.match_participant_count(match_row.state, match_row.host_id, match_row.guest_id) < 2 then
    raise exception 'Zum Starten braucht die Lobby mindestens 2 Spieler.';
  end if;

  next_state := coalesce(match_row.state, '{}'::jsonb);
  for rec in
    select *
    from public.match_participant_rows(next_state)
  loop
    next_state := jsonb_set(next_state, array[rec.role_key, 'ready'], 'true'::jsonb, true);
  end loop;

  update public.matches
  set status = 'active',
      started_at = coalesce(match_row.started_at, now()),
      state = next_state,
      updated_at = now()
  where id = match_row.id
  returning * into match_row;

  return match_row;
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

  update public.matches
  set question_limit = jsonb_array_length(questions_json),
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

create or replace function public.update_match_progress(
  p_match_id uuid,
  p_next_index integer default null,
  p_next_score integer default null,
  p_answer jsonb default null,
  p_finished boolean default false,
  p_expected_updated_at timestamptz default null
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
  next_answer jsonb;
  answers jsonb;
  history jsonb;
  next_finished boolean;
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
    raise exception 'Ungültige Spielerrolle.';
  end if;

  next_state := coalesce(match_row.state, '{}'::jsonb);
  role_state := coalesce(next_state -> role_key, '{}'::jsonb);

  next_answer := public.sanitize_match_answer(p_answer);
  answers := coalesce(role_state -> 'answers', '[]'::jsonb);

  if next_answer is not null then
    answers := public.jsonb_array_tail(
      answers || jsonb_build_array(next_answer),
      50
    );
  end if;

  next_finished :=
    coalesce((role_state ->> 'finished')::boolean, false) or coalesce(p_finished, false);

  role_state := jsonb_set(
    role_state,
    '{index}',
    to_jsonb(
      coalesce(p_next_index, (role_state ->> 'index')::integer, 0)
    ),
    true
  );
  role_state := jsonb_set(
    role_state,
    '{score}',
    to_jsonb(
      coalesce(p_next_score, (role_state ->> 'score')::integer, 0)
    ),
    true
  );
  role_state := jsonb_set(role_state, '{finished}', to_jsonb(next_finished), true);
  role_state := jsonb_set(role_state, '{answers}', answers, true);

  if next_answer is not null then
    role_state := jsonb_set(
      role_state,
      '{lastAnswerAt}',
      to_jsonb(coalesce(next_answer ->> 'answeredAt', now()::text)),
      true
    );
  end if;

  history := coalesce(next_state -> 'history', '[]'::jsonb);
  if next_answer is not null then
    history := public.jsonb_array_tail(
      history || jsonb_build_array(
        next_answer || jsonb_build_object('player', role_key, 'userId', user_id)
      ),
      100
    );
  end if;

  next_state := jsonb_set(next_state, array[role_key], role_state, true);
  next_state := jsonb_set(next_state, '{history}', history, true);
  all_finished := public.match_all_players_finished(next_state);

  update public.matches
  set state = next_state,
      status = case
        when all_finished then 'completed'
        when match_row.status = 'waiting' then 'active'
        else match_row.status
      end,
      started_at = case
        when match_row.status = 'waiting' then coalesce(match_row.started_at, now())
        else match_row.started_at
      end,
      finished_at = case when all_finished then now() else match_row.finished_at end,
      updated_at = now()
  where id = match_row.id
    and (p_expected_updated_at is null or updated_at = p_expected_updated_at)
  returning * into match_row;

  if match_row.id is null then
    raise exception 'Match wurde parallel aktualisiert. Bitte neu laden.';
  end if;

  return match_row;
end;
$$;

create or replace function public.mark_player_finished(
  p_match_id uuid,
  p_expected_updated_at timestamptz default null
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
    raise exception 'Ungültige Spielerrolle.';
  end if;

  next_state := coalesce(match_row.state, '{}'::jsonb);
  role_state := coalesce(next_state -> role_key, '{}'::jsonb);
  role_state := jsonb_set(role_state, '{finished}', 'true'::jsonb, true);
  next_state := jsonb_set(next_state, array[role_key], role_state, true);
  all_finished := public.match_all_players_finished(next_state);

  update public.matches
  set state = next_state,
      finished_at = case when all_finished then now() else match_row.finished_at end,
      status = case when all_finished then 'completed' else match_row.status end,
      updated_at = now()
  where id = match_row.id
    and (p_expected_updated_at is null or updated_at = p_expected_updated_at)
  returning * into match_row;

  if match_row.id is null then
    raise exception 'Match wurde parallel aktualisiert. Bitte neu laden.';
  end if;

  return match_row;
end;
$$;

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
    raise exception 'Ungültige Spielerrolle.';
  end if;

  next_state := coalesce(match_row.state, '{}'::jsonb);
  role_state := coalesce(next_state -> role_key, '{}'::jsonb);
  role_state := jsonb_set(role_state, '{finished}', 'true'::jsonb, true);
  role_state := jsonb_set(role_state, '{gaveUp}', 'true'::jsonb, true);
  next_state := jsonb_set(next_state, array[role_key], role_state, true);

  update public.matches
  set state = next_state,
      status = 'cancelled',
      finished_at = now(),
      updated_at = now()
  where id = match_row.id
  returning * into match_row;

  return match_row;
end;
$$;

drop function if exists public.kick_match_guest(uuid);
create or replace function public.kick_match_guest(
  p_match_id uuid,
  p_player_key text default 'guest'
)
returns public.matches
language plpgsql
security definer
set search_path = public
as $$
declare
  user_id uuid := auth.uid();
  match_row public.matches;
  target_key text := nullif(trim(p_player_key), '');
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
    raise exception 'Match nicht gefunden.';
  end if;

  if match_row.host_id <> user_id then
    raise exception 'Nur der Host kann Spieler entfernen.';
  end if;

  if match_row.status <> 'waiting' then
    raise exception 'Die Lobby läuft bereits.';
  end if;

  if target_key is null or target_key = 'host' or not public.is_match_player_key(target_key) then
    raise exception 'Spieler konnte nicht entfernt werden.';
  end if;

  if nullif(match_row.state -> target_key ->> 'userId', '') is null then
    return match_row;
  end if;

  next_state := public.match_compact_player_state(match_row.state, target_key);

  update public.matches
  set guest_id = public.match_first_guest_id_from_state(next_state),
      state = next_state,
      updated_at = now()
  where id = match_row.id
  returning * into match_row;

  return match_row;
end;
$$;

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
  role_key text;
  compacted_state jsonb;
  remaining_count integer;
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

  role_key := public.match_user_role(match_row.state, match_row.host_id, match_row.guest_id, user_id);
  if role_key is null then
    raise exception 'Match not found.';
  end if;

  if match_row.status not in ('waiting', 'completed') then
    raise exception 'Match lobby cannot be left right now.';
  end if;

  compacted_state := public.match_compact_player_state(match_row.state, role_key);

  select count(*)
  into remaining_count
  from public.match_participant_rows(compacted_state);

  if remaining_count = 0 then
    update public.matches
    set status = 'cancelled',
        finished_at = now(),
        updated_at = now()
    where id = match_row.id
    returning * into match_row;

    return match_row;
  end if;

  if match_row.status = 'completed' then
    resolved_category := nullif(trim(match_row.category), '');

    with selected as (
      select id, question, correct_answer, options, explanation, image_url, image_alt
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

  next_state := public.match_reset_active_players(compacted_state);

  update public.matches
  set host_id = public.match_host_id_from_state(next_state),
      guest_id = public.match_first_guest_id_from_state(next_state),
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

drop function if exists public.get_open_matches();
create or replace function public.get_open_matches()
returns table (
  id uuid,
  code text,
  question_limit integer,
  created_at timestamptz,
  host_username text,
  host_id uuid,
  category text,
  players integer,
  capacity integer
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
      coalesce(m.state -> 'host' ->> 'username', u.username) as host_username,
      m.host_id,
      m.category,
      public.match_participant_count(m.state, m.host_id, m.guest_id) as players,
      5 as capacity
    from public.matches m
    left join public.users u on u.id = m.host_id
    where m.status = 'waiting'
      and public.match_participant_count(m.state, m.host_id, m.guest_id) < 5
    order by m.created_at asc
    limit 24;
end;
$$;

create or replace function public.get_match_by_id(p_match_id uuid)
returns public.matches
language plpgsql
security definer
set search_path = public
as $$
declare
  user_id uuid := auth.uid();
  match_row public.matches;
begin
  if user_id is null then
    raise exception 'not authenticated';
  end if;

  select *
  into match_row
  from public.matches
  where id = p_match_id;

  if match_row.id is null then
    raise exception 'Match nicht gefunden.';
  end if;

  if not public.match_state_has_player(match_row.state, match_row.host_id, match_row.guest_id, user_id) then
    raise exception 'Match nicht gefunden.';
  end if;

  return match_row;
end;
$$;

grant execute on function public.create_match(integer, text, text, text) to authenticated;
grant execute on function public.join_match(text) to authenticated;
grant execute on function public.start_match(uuid) to authenticated;
grant execute on function public.update_match_settings(uuid, integer, text, text) to authenticated;
grant execute on function public.restart_match_lobby(uuid, integer, text, text) to authenticated;
grant execute on function public.update_match_progress(uuid, integer, integer, jsonb, boolean, timestamptz) to authenticated;
grant execute on function public.mark_player_finished(uuid, timestamptz) to authenticated;
grant execute on function public.abandon_match(uuid) to authenticated;
grant execute on function public.kick_match_guest(uuid, text) to authenticated;
grant execute on function public.leave_match_lobby(uuid, text, text) to authenticated;
grant execute on function public.get_open_matches() to authenticated;
grant execute on function public.get_match_by_id(uuid) to authenticated;
