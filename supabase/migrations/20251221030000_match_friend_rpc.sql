create or replace function public.normalize_difficulty(p_difficulty text)
returns text
language sql
immutable
as $$
  select case
    when lower(coalesce(p_difficulty, '')) in ('leicht', 'mittel', 'schwer')
      then lower(p_difficulty)
    else 'mittel'
  end;
$$;

create or replace function public.normalize_friend_code(p_code text)
returns text
language sql
immutable
as $$
  select upper(regexp_replace(coalesce(p_code, ''), '[^a-zA-Z0-9_]', '', 'g'));
$$;

create or replace function public.derive_friend_code(p_user_id uuid)
returns text
language plpgsql
immutable
as $$
declare
  compact text;
  slice text;
begin
  if p_user_id is null then
    return '';
  end if;

  compact := regexp_replace(p_user_id::text, '[^a-zA-Z0-9]', '', 'g');

  if compact is null or length(compact) = 0 then
    return '';
  end if;

  slice := upper(right(compact, 8));
  return lpad(slice, 8, '0');
end;
$$;

create or replace function public.generate_join_code()
returns text
language plpgsql
stable
as $$
declare
  letters text := 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  digits text := '23456789';
  code text := '';
  idx integer;
begin
  for idx in 1..3 loop
    code := code || substr(letters, floor(random() * length(letters))::int + 1, 1);
  end loop;

  for idx in 1..2 loop
    code := code || substr(digits, floor(random() * length(digits))::int + 1, 1);
  end loop;

  return code;
end;
$$;

create or replace function public.normalize_question_options(
  p_options jsonb,
  p_correct text
)
returns jsonb
language plpgsql
volatile
as $$
declare
  normalized text[];
  next_options text[];
begin
  select array_agg(value order by random())
  into normalized
  from (
    select distinct value
    from jsonb_array_elements_text(coalesce(p_options, '[]'::jsonb)) as t(value)
    where value is not null and length(trim(value)) > 0
  ) deduped;

  next_options := coalesce(normalized, array[]::text[]);

  if p_correct is not null and length(trim(p_correct)) > 0
    and not (p_correct = any(next_options))
  then
    next_options := array_append(next_options, p_correct);
  end if;

  if array_length(next_options, 1) is null then
    return '[]'::jsonb;
  end if;

  return (
    select to_jsonb(array_agg(option order by random()))
    from unnest(next_options) as option
  );
end;
$$;

create or replace function public.jsonb_array_tail(p_array jsonb, p_limit integer)
returns jsonb
language sql
stable
as $$
  select coalesce(
    (
      select jsonb_agg(value order by idx)
      from (
        select value, idx
        from jsonb_array_elements(coalesce(p_array, '[]'::jsonb))
          with ordinality as t(value, idx)
        order by idx desc
        limit greatest(coalesce(p_limit, 0), 0)
      ) sliced
    ),
    '[]'::jsonb
  );
$$;

create or replace function public.sanitize_match_answer(p_answer jsonb)
returns jsonb
language plpgsql
stable
as $$
declare
  selected_option text;
  question_id text;
  duration_ms integer;
  answered_at text;
  correct boolean;
  timed_out boolean;
begin
  if p_answer is null or jsonb_typeof(p_answer) <> 'object' then
    return null;
  end if;

  selected_option := nullif(trim(p_answer->>'selectedOption'), '');
  question_id := nullif(trim(p_answer->>'questionId'), '');
  answered_at := nullif(trim(p_answer->>'answeredAt'), '');

  correct :=
    lower(coalesce(p_answer->>'correct', '')) in ('true', 't', '1', 'yes');
  timed_out :=
    lower(coalesce(p_answer->>'timedOut', '')) in ('true', 't', '1', 'yes');

  duration_ms := null;
  if p_answer ? 'durationMs' then
    begin
      duration_ms := (p_answer->>'durationMs')::integer;
      if duration_ms < 0 then
        duration_ms := 0;
      end if;
    exception when others then
      duration_ms := null;
    end;
  end if;

  return jsonb_build_object(
    'questionId', question_id,
    'selectedOption', selected_option,
    'correct', correct,
    'durationMs', duration_ms,
    'timedOut', timed_out,
    'answeredAt', coalesce(answered_at, now()::text)
  );
end;
$$;

create or replace function public.close_waiting_matches(
  p_include_all boolean default false
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_count integer;
begin
  update public.matches
  set status = 'cancelled',
      finished_at = now(),
      updated_at = now()
  where status = 'waiting'
    and (
      p_include_all
      or created_at <= now() - interval '10 minutes'
    );

  get diagnostics updated_count = row_count;
  return updated_count;
end;
$$;

create or replace function public.create_match(
  p_difficulty text default 'mittel',
  p_question_limit integer default 5
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
    select id, question, correct_answer, options
    from public.get_questions(normalized_difficulty, limit_count, null)
  ),
  normalized as (
    select
      id,
      id::text as id_text,
      question,
      correct_answer,
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
          'options', options
        )
      ),
      '[]'::jsonb
    ),
    coalesce(array_agg(id), array[]::uuid[])
  into questions_json, question_ids
  from normalized;

  if jsonb_array_length(questions_json) = 0 then
    raise exception 'Keine Fragen fuer Multiplayer verfuegbar.';
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
        raise exception 'Konnte keinen eindeutigen Match-Code erzeugen.';
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
  guest_user_id uuid := auth.uid();
  sanitized_code text := upper(trim(p_code));
  match_row public.matches;
  guest_username text;
  next_state jsonb;
begin
  if guest_user_id is null then
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

  if match_row.host_id = guest_user_id or match_row.guest_id = guest_user_id then
    return match_row;
  end if;

  if match_row.status <> 'waiting' then
    raise exception 'Dieses Match laeuft bereits oder ist beendet.';
  end if;

  if match_row.guest_id is not null then
    raise exception 'Dieses Match ist bereits voll.';
  end if;

  select username into guest_username
  from public.users
  where id = guest_user_id;

  next_state := jsonb_set(
    coalesce(match_row.state, '{}'::jsonb),
    '{guest}',
    jsonb_build_object(
      'userId', guest_user_id,
      'username', guest_username,
      'index', 0,
      'score', 0,
      'finished', false,
      'answers', jsonb_build_array(),
      'ready', false
    ),
    true
  );

  update public.matches
  set guest_id = guest_user_id,
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
    raise exception 'Match laeuft bereits oder ist beendet.';
  end if;

  next_state := coalesce(match_row.state, '{}'::jsonb);
  next_state := jsonb_set(next_state, '{host,ready}', 'true'::jsonb, true);
  next_state := jsonb_set(next_state, '{guest,ready}', 'true'::jsonb, true);

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
  p_difficulty text default 'mittel',
  p_question_limit integer default 5
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
  match_row public.matches;
  host_username text;
  questions_json jsonb;
  question_ids uuid[];
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
    raise exception 'Nur der Host kann die Lobby anpassen.';
  end if;

  if match_row.status <> 'waiting' then
    raise exception 'Die Lobby laeuft bereits.';
  end if;

  with selected as (
    select id, question, correct_answer, options
    from public.get_questions(normalized_difficulty, limit_count, null)
  ),
  normalized as (
    select
      id,
      id::text as id_text,
      question,
      correct_answer,
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
          'options', options
        )
      ),
      '[]'::jsonb
    ),
    coalesce(array_agg(id), array[]::uuid[])
  into questions_json, question_ids
  from normalized;

  if jsonb_array_length(questions_json) = 0 then
    raise exception 'Keine Fragen fuer die gewaehlte Einstellung verfuegbar.';
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

  update public.matches
  set difficulty = normalized_difficulty,
      question_limit = jsonb_array_length(questions_json),
      question_ids = question_ids,
      questions = questions_json,
      state = next_state,
      status = 'waiting',
      started_at = null,
      updated_at = now()
  where id = match_row.id
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
  other_role text;
  next_state jsonb;
  role_state jsonb;
  other_state jsonb;
  next_answer jsonb;
  answers jsonb;
  history jsonb;
  next_finished boolean;
  other_finished boolean;
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

  if match_row.host_id = user_id then
    role_key := 'host';
    other_role := 'guest';
  elsif match_row.guest_id = user_id then
    role_key := 'guest';
    other_role := 'host';
  else
    raise exception 'Ungueltige Spielerrolle.';
  end if;

  next_state := coalesce(match_row.state, '{}'::jsonb);
  role_state := coalesce(next_state -> role_key, '{}'::jsonb);
  other_state := coalesce(next_state -> other_role, '{}'::jsonb);

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
  other_finished := coalesce((other_state ->> 'finished')::boolean, false);

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
      history || jsonb_build_array(next_answer || jsonb_build_object('player', role_key)),
      100
    );
  end if;

  next_state := jsonb_set(next_state, array[role_key], role_state, true);
  next_state := jsonb_set(next_state, '{history}', history, true);

  update public.matches
  set state = next_state,
      status = case when match_row.status = 'waiting' then 'active' else match_row.status end,
      started_at = case
        when match_row.status = 'waiting' then coalesce(match_row.started_at, now())
        else match_row.started_at
      end,
      finished_at = case when next_finished and other_finished then now() else match_row.finished_at end,
      updated_at = now()
  where id = match_row.id
    and (p_expected_updated_at is null or updated_at = p_expected_updated_at)
  returning * into match_row;

  if match_row.id is null then
    raise exception 'Match wurde parallel aktualisiert. Bitte neu laden.';
  end if;

  if next_finished and other_finished then
    update public.matches
    set status = 'completed',
        updated_at = now()
    where id = match_row.id
    returning * into match_row;
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
  other_role text;
  next_state jsonb;
  role_state jsonb;
  other_state jsonb;
  other_finished boolean;
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

  if match_row.host_id = user_id then
    role_key := 'host';
    other_role := 'guest';
  elsif match_row.guest_id = user_id then
    role_key := 'guest';
    other_role := 'host';
  else
    raise exception 'Ungueltige Spielerrolle.';
  end if;

  next_state := coalesce(match_row.state, '{}'::jsonb);
  role_state := coalesce(next_state -> role_key, '{}'::jsonb);
  other_state := coalesce(next_state -> other_role, '{}'::jsonb);
  other_finished := coalesce((other_state ->> 'finished')::boolean, false);

  role_state := jsonb_set(role_state, '{finished}', 'true'::jsonb, true);
  next_state := jsonb_set(next_state, array[role_key], role_state, true);

  update public.matches
  set state = next_state,
      finished_at = case when other_finished then now() else match_row.finished_at end,
      status = case when other_finished then 'completed' else match_row.status end,
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

  if match_row.host_id = user_id then
    role_key := 'host';
  elsif match_row.guest_id = user_id then
    role_key := 'guest';
  else
    raise exception 'Ungueltige Spielerrolle.';
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

create or replace function public.get_open_matches(
  p_difficulty text default null
)
returns table (
  id uuid,
  code text,
  difficulty text,
  question_limit integer,
  created_at timestamptz,
  host_username text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_difficulty text := null;
begin
  if p_difficulty is not null and length(trim(p_difficulty)) > 0 then
    normalized_difficulty := public.normalize_difficulty(p_difficulty);
  end if;

  return query
    select
      m.id,
      m.code,
      m.difficulty,
      m.question_limit,
      m.created_at,
      coalesce(m.state -> 'host' ->> 'username', u.username) as host_username
    from public.matches m
    left join public.users u on u.id = m.host_id
    where m.status = 'waiting'
      and m.guest_id is null
      and (
        normalized_difficulty is null
        or normalized_difficulty = ''
        or m.difficulty = normalized_difficulty
      )
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

  if match_row.host_id <> user_id and match_row.guest_id <> user_id then
    raise exception 'Match nicht gefunden.';
  end if;

  return match_row;
end;
$$;

create or replace function public.fetch_friends()
returns table (
  id uuid,
  owner_id uuid,
  code text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  user_id uuid := auth.uid();
  my_code text;
begin
  if user_id is null then
    raise exception 'not authenticated';
  end if;

  my_code := public.derive_friend_code(user_id);

  return query
    select distinct on (code)
      id,
      owner_id,
      code,
      created_at
    from (
      select
        f.id,
        f.owner_id,
        f.friend_code as code,
        f.created_at
      from public.friends f
      where f.owner_id = user_id

      union all

      select
        f.id,
        f.owner_id,
        public.derive_friend_code(f.owner_id) as code,
        f.created_at
      from public.friends f
      where f.friend_code = my_code
        and f.owner_id <> user_id
    ) merged
    order by code, created_at asc;
end;
$$;

create or replace function public.add_friend(p_code text)
returns public.friends
language plpgsql
security definer
set search_path = public
as $$
declare
  user_id uuid := auth.uid();
  normalized_code text := public.normalize_friend_code(p_code);
  friend_row public.friends;
begin
  if user_id is null then
    raise exception 'not authenticated';
  end if;

  if normalized_code is null or length(normalized_code) = 0 then
    raise exception 'Bitte gueltigen Code angeben.';
  end if;

  insert into public.friends (owner_id, friend_code)
  values (user_id, normalized_code)
  on conflict (owner_id, friend_code) do update
    set friend_code = excluded.friend_code
  returning * into friend_row;

  return friend_row;
end;
$$;

create or replace function public.remove_friend(p_code text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  user_id uuid := auth.uid();
  normalized_code text := public.normalize_friend_code(p_code);
  my_code text;
  other_user_id uuid;
  deleted_count integer := 0;
begin
  if user_id is null then
    raise exception 'not authenticated';
  end if;

  if normalized_code is null or length(normalized_code) = 0 then
    raise exception 'Ungueltiger Freund.';
  end if;

  delete from public.friends
  where owner_id = user_id
    and friend_code = normalized_code;
  get diagnostics deleted_count = row_count;

  my_code := public.derive_friend_code(user_id);

  if my_code is not null and length(my_code) > 0 then
    select u.id
    into other_user_id
    from public.users u
    where public.derive_friend_code(u.id) = normalized_code
    limit 1;

    if other_user_id is not null then
      delete from public.friends
      where owner_id = other_user_id
        and friend_code = my_code;
    end if;
  end if;

  return deleted_count;
end;
$$;

grant execute on function public.normalize_difficulty(text) to anon, authenticated;
grant execute on function public.normalize_friend_code(text) to anon, authenticated;
grant execute on function public.derive_friend_code(uuid) to anon, authenticated;
grant execute on function public.generate_join_code() to authenticated;
grant execute on function public.normalize_question_options(jsonb, text) to authenticated;
grant execute on function public.jsonb_array_tail(jsonb, integer) to authenticated;
grant execute on function public.sanitize_match_answer(jsonb) to authenticated;
grant execute on function public.close_waiting_matches(boolean) to authenticated;
grant execute on function public.create_match(text, integer) to authenticated;
grant execute on function public.join_match(text) to authenticated;
grant execute on function public.start_match(uuid) to authenticated;
grant execute on function public.update_match_settings(uuid, text, integer) to authenticated;
grant execute on function public.update_match_progress(uuid, integer, integer, jsonb, boolean, timestamptz) to authenticated;
grant execute on function public.mark_player_finished(uuid, timestamptz) to authenticated;
grant execute on function public.abandon_match(uuid) to authenticated;
grant execute on function public.get_open_matches(text) to authenticated;
grant execute on function public.get_match_by_id(uuid) to authenticated;
grant execute on function public.fetch_friends() to authenticated;
grant execute on function public.add_friend(text) to authenticated;
grant execute on function public.remove_friend(text) to authenticated;
