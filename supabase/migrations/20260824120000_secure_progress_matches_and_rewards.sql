create table if not exists public.quiz_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  completion_key text not null,
  match_id uuid null references public.matches(id) on delete set null,
  correct_count integer not null,
  question_count integer not null,
  points integer not null,
  xp integer not null,
  coins integer not null,
  answers jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, completion_key)
);

alter table public.quiz_completions enable row level security;

drop policy if exists "quiz_completions_select_own" on public.quiz_completions;
create policy "quiz_completions_select_own"
  on public.quiz_completions
  for select
  to authenticated
  using (auth.uid() = user_id);

revoke all on table public.quiz_completions from anon, authenticated;
grant select on table public.quiz_completions to authenticated;

create or replace function public.complete_quiz(
  p_completion_key text,
  p_answers jsonb default '[]'::jsonb,
  p_match_id uuid default null
)
returns table (
  already_processed boolean,
  correct_count integer,
  question_count integer,
  points integer,
  xp integer,
  coins integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_key text := nullif(btrim(coalesce(p_completion_key, '')), '');
  v_answers jsonb := coalesce(p_answers, '[]'::jsonb);
  v_answer jsonb;
  v_question public.questions;
  v_question_id uuid;
  v_question_ids uuid[] := array[]::uuid[];
  v_selected_option text;
  v_timed_out boolean;
  v_correct integer := 0;
  v_total integer := 0;
  v_points integer := 0;
  v_xp integer := 0;
  v_coins integer := 0;
  v_penalty integer := 0;
  v_match public.matches;
  v_role text;
  v_role_state jsonb;
  v_existing public.quiz_completions;
  v_account_state jsonb;
  v_user_stats jsonb;
  v_streak integer := 0;
  v_best_streak integer := 0;
  v_multiplayer_games integer := 0;
  v_inventory jsonb;
  v_boost text;
  v_inventory_count integer;
  v_now_ms bigint := floor(extract(epoch from timezone('utc', now())) * 1000)::bigint;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  if v_key is null or length(v_key) > 160 then
    raise exception 'invalid completion key';
  end if;

  if p_match_id is not null then
    v_key := 'match:' || p_match_id::text;

    select * into v_match
    from public.matches
    where id = p_match_id
    for update;

    if not found then
      raise exception 'match not found';
    end if;

    v_role := public.match_user_role(v_match.state, v_match.host_id, v_match.guest_id, v_user_id);
    if v_role is null then
      raise exception 'not a match participant';
    end if;

    v_role_state := coalesce(v_match.state -> v_role, '{}'::jsonb);
    if coalesce((v_role_state ->> 'gaveUp')::boolean, false) then
      raise exception 'surrendered matches do not earn rewards';
    end if;
    if not coalesce((v_role_state ->> 'finished')::boolean, false) then
      raise exception 'match is not finished';
    end if;

    v_answers := coalesce(v_role_state -> 'answers', '[]'::jsonb);
    v_total := jsonb_array_length(v_answers);
    if v_total < 1 or v_total <> jsonb_array_length(coalesce(v_match.questions, '[]'::jsonb)) then
      raise exception 'incomplete match answers';
    end if;

    select count(*)::integer
    into v_correct
    from jsonb_array_elements(v_answers) as answer
    where coalesce((answer ->> 'correct')::boolean, false);

    v_points := greatest(coalesce((v_role_state ->> 'score')::integer, 0), 0);
  else
    if jsonb_typeof(v_answers) <> 'array' then
      raise exception 'answers must be an array';
    end if;

    v_total := jsonb_array_length(v_answers);
    if v_total < 1 or v_total > 50 then
      raise exception 'invalid answer count';
    end if;

    for v_answer in select value from jsonb_array_elements(v_answers)
    loop
      if jsonb_typeof(v_answer) <> 'object'
        or coalesce(v_answer ->> 'questionId', '') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
      then
        raise exception 'unverifiable question id';
      end if;

      v_question_id := (v_answer ->> 'questionId')::uuid;
      if v_question_id = any(v_question_ids) then
        raise exception 'duplicate question';
      end if;
      v_question_ids := array_append(v_question_ids, v_question_id);

      select * into v_question
      from public.questions
      where id = v_question_id;

      if not found then
        raise exception 'question not found';
      end if;

      v_timed_out := lower(coalesce(v_answer ->> 'timedOut', 'false')) in ('true', 't', '1');
      v_selected_option := nullif(btrim(v_answer ->> 'selectedOption'), '');

      if v_timed_out then
        v_selected_option := null;
      elsif v_selected_option is null or not exists (
        select 1
        from jsonb_array_elements_text(v_question.options) as option(value)
        where option.value = v_selected_option
      ) then
        raise exception 'invalid selected option';
      end if;

      if not v_timed_out and v_selected_option = v_question.correct_answer then
        v_correct := v_correct + 1;
      end if;
    end loop;

    select count(distinct boost.value)::integer
    into v_penalty
    from jsonb_array_elements(v_answers) as answer,
      lateral jsonb_array_elements_text(
        case
          when jsonb_typeof(answer -> 'boostsUsed') = 'array' then answer -> 'boostsUsed'
          else '[]'::jsonb
        end
      ) as boost(value)
    where boost.value in ('joker_5050', 'freeze_time');

    if exists (
      select 1
      from jsonb_array_elements(v_answers) as answer,
        lateral jsonb_array_elements_text(
          case when jsonb_typeof(answer -> 'boostsUsed') = 'array'
            then answer -> 'boostsUsed' else '[]'::jsonb end
        ) as boost(value)
      where boost.value in ('joker_5050', 'freeze_time')
      group by boost.value
      having count(*) > 1
    ) then
      raise exception 'boost used more than once';
    end if;

    v_points := greatest(v_correct * 3 - coalesce(v_penalty, 0), 0);
  end if;

  select * into v_existing
  from public.quiz_completions
  where user_id = v_user_id and completion_key = v_key;

  if found then
    return query select true, v_existing.correct_count, v_existing.question_count,
      v_existing.points, v_existing.xp, v_existing.coins;
    return;
  end if;

  v_xp := v_correct * 10 + 20
    + case when v_correct = v_total then 30 else 0 end
    + case when p_match_id is not null then 15 else 0 end;
  v_coins := greatest(
    1,
    v_correct + 1
      + case when v_correct = v_total then 2 else 0 end
      + case when p_match_id is not null then 1 else 0 end
  );

  insert into public.quiz_completions (
    user_id, completion_key, match_id, correct_count, question_count, points, xp, coins, answers
  ) values (
    v_user_id, v_key, p_match_id, v_correct, v_total, v_points, v_xp, v_coins, v_answers
  );

  select coalesce(account_state, '{}'::jsonb)
  into v_account_state
  from public.users
  where id = v_user_id
  for update;

  if v_account_state is null then
    raise exception 'user not found';
  end if;

  if greatest(coalesce((v_account_state ->> 'doubleXpExpiresAt')::bigint, 0), 0) > v_now_ms then
    v_xp := v_xp * 2;
  end if;

  if p_match_id is null and v_penalty > 0 then
    v_inventory := case when jsonb_typeof(v_account_state -> 'boosts') = 'object'
      then v_account_state -> 'boosts' else '{}'::jsonb end;
    for v_boost in
      select distinct boost.value
      from jsonb_array_elements(v_answers) as answer,
        lateral jsonb_array_elements_text(
          case when jsonb_typeof(answer -> 'boostsUsed') = 'array'
            then answer -> 'boostsUsed' else '[]'::jsonb end
        ) as boost(value)
      where boost.value in ('joker_5050', 'freeze_time')
    loop
      v_inventory_count := greatest(coalesce((v_inventory ->> v_boost)::integer, 0), 0);
      if v_inventory_count < 1 then raise exception 'boost is not owned'; end if;
      v_inventory := jsonb_set(v_inventory, array[v_boost], to_jsonb(v_inventory_count - 1), true);
    end loop;
    v_account_state := jsonb_set(v_account_state, '{boosts}', v_inventory, true);
  end if;

  v_user_stats := case
    when jsonb_typeof(v_account_state -> 'userStats') = 'object'
      then v_account_state -> 'userStats'
    else '{}'::jsonb
  end;
  v_streak := greatest(coalesce((v_user_stats ->> 'standardStreak')::integer, 0), 0);
  v_best_streak := greatest(coalesce((v_user_stats ->> 'bestStreak')::integer, 0), 0);
  v_multiplayer_games := greatest(coalesce((v_user_stats ->> 'multiplayerGames')::integer, 0), 0);

  if p_match_id is null then
    v_streak := case when v_correct >= v_total - 1 then v_streak + 1 else 0 end;
    v_best_streak := greatest(v_best_streak, v_streak);
  else
    v_multiplayer_games := v_multiplayer_games + 1;
  end if;

  v_user_stats := v_user_stats || jsonb_build_object(
    'standardStreak', v_streak,
    'bestStreak', v_best_streak,
    'multiplayerGames', v_multiplayer_games
  );

  update public.users as u
  set quizzes = coalesce(u.quizzes, 0) + 1,
      correct = coalesce(u.correct, 0) + v_correct,
      questions = coalesce(u.questions, 0) + v_total,
      xp = coalesce(u.xp, 0) + v_xp,
      coins = coalesce(u.coins, 0) + v_coins,
      leaderboard_points = coalesce(u.leaderboard_points, 0) + v_points,
      account_state = jsonb_set(
        v_account_state || jsonb_build_object('updatedAt', timezone('utc', now())),
        '{userStats}',
        v_user_stats,
        true
      )
  where id = v_user_id;

  insert into public.scores (user_id, points)
  values (v_user_id, v_points);

  return query select false, v_correct, v_total, v_points, v_xp, v_coins;
end;
$$;

revoke all on function public.complete_quiz(text, jsonb, uuid) from public, anon;
grant execute on function public.complete_quiz(text, jsonb, uuid) to authenticated;

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
  v_user_id uuid := auth.uid();
  v_match public.matches;
  v_role text;
  v_state jsonb;
  v_role_state jsonb;
  v_answers jsonb;
  v_history jsonb;
  v_question jsonb;
  v_answer jsonb;
  v_question_id text;
  v_selected_option text;
  v_current_index integer;
  v_current_score integer;
  v_next_index integer;
  v_next_score integer;
  v_question_count integer;
  v_duration integer;
  v_timed_out boolean;
  v_correct boolean;
  v_boosts jsonb := '[]'::jsonb;
  v_penalty integer := 0;
  v_finished boolean;
  v_all_finished boolean;
  v_account_state jsonb;
  v_inventory jsonb;
  v_boost text;
  v_inventory_count integer;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  select * into v_match from public.matches where id = p_match_id for update;
  if not found then
    raise exception 'match not found';
  end if;
  if v_match.status <> 'active' then
    raise exception 'match is not active';
  end if;

  v_role := public.match_user_role(v_match.state, v_match.host_id, v_match.guest_id, v_user_id);
  if v_role is null then
    raise exception 'invalid player role';
  end if;

  v_state := coalesce(v_match.state, '{}'::jsonb);
  v_role_state := coalesce(v_state -> v_role, '{}'::jsonb);
  v_answers := coalesce(v_role_state -> 'answers', '[]'::jsonb);
  v_current_index := greatest(coalesce((v_role_state ->> 'index')::integer, 0), 0);
  v_current_score := greatest(coalesce((v_role_state ->> 'score')::integer, 0), 0);
  v_question_count := jsonb_array_length(coalesce(v_match.questions, '[]'::jsonb));

  if p_answer is null or jsonb_typeof(p_answer) <> 'object' then
    raise exception 'answer is required';
  end if;
  v_question_id := nullif(btrim(p_answer ->> 'questionId'), '');

  if exists (
    select 1 from jsonb_array_elements(v_answers) as prior
    where prior ->> 'questionId' = v_question_id
  ) then
    return v_match;
  end if;

  if v_current_index >= v_question_count then
    raise exception 'all questions already answered';
  end if;

  v_question := v_match.questions -> v_current_index;
  if v_question_id is null or v_question_id <> v_question ->> 'id' then
    raise exception 'answer does not match current question';
  end if;

  v_timed_out := lower(coalesce(p_answer ->> 'timedOut', 'false')) in ('true', 't', '1');
  v_selected_option := nullif(btrim(p_answer ->> 'selectedOption'), '');
  if v_timed_out then
    v_selected_option := null;
  elsif v_selected_option is null or not exists (
    select 1 from jsonb_array_elements_text(v_question -> 'options') as option(value)
    where option.value = v_selected_option
  ) then
    raise exception 'invalid selected option';
  end if;

  begin
    v_duration := greatest(0, least(coalesce((p_answer ->> 'durationMs')::integer, 0), 60000));
  exception when others then
    v_duration := 0;
  end;

  if jsonb_typeof(p_answer -> 'boostsUsed') = 'array' then
    select coalesce(jsonb_agg(value order by value), '[]'::jsonb), count(*)::integer
    into v_boosts, v_penalty
    from (
      select distinct value
      from jsonb_array_elements_text(p_answer -> 'boostsUsed') as boost(value)
      where value in ('joker_5050', 'freeze_time')
    ) allowed;
  end if;

  if v_penalty > 0 then
    select coalesce(account_state, '{}'::jsonb)
    into v_account_state
    from public.users where id = v_user_id for update;
    v_inventory := case when jsonb_typeof(v_account_state -> 'boosts') = 'object'
      then v_account_state -> 'boosts' else '{}'::jsonb end;

    for v_boost in select value from jsonb_array_elements_text(v_boosts) as item(value)
    loop
      v_inventory_count := greatest(coalesce((v_inventory ->> v_boost)::integer, 0), 0);
      if v_inventory_count < 1 then raise exception 'boost is not owned'; end if;
      v_inventory := jsonb_set(
        v_inventory, array[v_boost], to_jsonb(v_inventory_count - 1), true
      );
    end loop;

    update public.users
    set account_state = jsonb_set(v_account_state, '{boosts}', v_inventory, true)
      || jsonb_build_object('updatedAt', timezone('utc', now()))
    where id = v_user_id;
  end if;

  v_correct := not v_timed_out and v_selected_option = v_question ->> 'correct_answer';
  v_next_index := v_current_index + 1;
  v_next_score := greatest(v_current_score + case when v_correct then 3 else 0 end - v_penalty, 0);
  v_finished := v_next_index >= v_question_count;

  if p_next_index is not null and p_next_index <> v_next_index then
    raise exception 'invalid next index';
  end if;
  if p_next_score is not null and p_next_score <> v_next_score then
    raise exception 'invalid next score';
  end if;
  if coalesce(p_finished, false) and not v_finished then
    raise exception 'match cannot be finished early';
  end if;

  v_answer := jsonb_build_object(
    'questionId', v_question_id,
    'selectedOption', v_selected_option,
    'correct', v_correct,
    'durationMs', v_duration,
    'timedOut', v_timed_out,
    'boostsUsed', v_boosts,
    'answeredAt', timezone('utc', now())
  );
  v_answers := public.jsonb_array_tail(v_answers || jsonb_build_array(v_answer), 50);
  v_role_state := jsonb_set(v_role_state, '{index}', to_jsonb(v_next_index), true);
  v_role_state := jsonb_set(v_role_state, '{score}', to_jsonb(v_next_score), true);
  v_role_state := jsonb_set(v_role_state, '{finished}', to_jsonb(v_finished), true);
  v_role_state := jsonb_set(v_role_state, '{answers}', v_answers, true);
  v_role_state := jsonb_set(v_role_state, '{lastAnswerAt}', to_jsonb(timezone('utc', now())), true);

  v_history := public.jsonb_array_tail(
    coalesce(v_state -> 'history', '[]'::jsonb)
      || jsonb_build_array(v_answer || jsonb_build_object('player', v_role, 'userId', v_user_id)),
    100
  );
  v_state := jsonb_set(v_state, array[v_role], v_role_state, true);
  v_state := jsonb_set(v_state, '{history}', v_history, true);
  v_all_finished := public.match_all_players_finished(v_state);

  update public.matches
  set state = v_state,
      status = case when v_all_finished then 'completed' else status end,
      finished_at = case when v_all_finished then now() else finished_at end,
      updated_at = now()
  where id = v_match.id
    and (p_expected_updated_at is null or updated_at = p_expected_updated_at)
  returning * into v_match;

  if v_match.id is null then
    raise exception 'match changed concurrently';
  end if;
  return v_match;
end;
$$;

revoke all on function public.update_match_progress(uuid, integer, integer, jsonb, boolean, timestamptz) from public, anon;
grant execute on function public.update_match_progress(uuid, integer, integer, jsonb, boolean, timestamptz) to authenticated;

create or replace function public.merge_user_account_state(p_user_id uuid, p_state jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_patch jsonb := '{}'::jsonb;
  v_next jsonb;
  v_value text;
begin
  if p_user_id is null or auth.uid() <> p_user_id then
    raise exception 'not authorized';
  end if;
  if p_state is null or jsonb_typeof(p_state) <> 'object' then
    raise exception 'invalid state patch';
  end if;

  if p_state ? 'avatarId' then
    v_value := nullif(btrim(p_state ->> 'avatarId'), '');
    v_patch := v_patch || jsonb_build_object('avatarId', case when length(v_value) <= 100 then v_value else null end);
  end if;
  if p_state ? 'avatarUri' then
    v_value := nullif(btrim(p_state ->> 'avatarUri'), '');
    if v_value is not null and (length(v_value) > 2048 or v_value !~* '^(https?|file)://') then
      raise exception 'invalid avatar uri';
    end if;
    v_patch := v_patch || jsonb_build_object('avatarUri', v_value);
  end if;
  if p_state ? 'avatarFrameId' then
    v_value := nullif(btrim(p_state ->> 'avatarFrameId'), '');
    v_patch := v_patch || jsonb_build_object('avatarFrameId', case when length(v_value) <= 100 then v_value else null end);
  end if;

  if v_patch = '{}'::jsonb then
    raise exception 'state field is server managed';
  end if;

  update public.users
  set account_state = coalesce(account_state, '{}'::jsonb)
      || v_patch
      || jsonb_build_object('updatedAt', timezone('utc', now()))
  where id = p_user_id
  returning account_state into v_next;

  if v_next is null then
    raise exception 'user not found';
  end if;
  return v_next;
end;
$$;

revoke all on function public.merge_user_account_state(uuid, jsonb) from public, anon;
grant execute on function public.merge_user_account_state(uuid, jsonb) to authenticated;

create or replace function public.claim_user_achievement(
  p_user_id uuid,
  p_achievement_key text,
  p_reward_xp integer default 0,
  p_reward_coins integer default 0
)
returns table (claimed boolean, xp integer, coins integer, claimed_achievements jsonb)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_key text := nullif(btrim(coalesce(p_achievement_key, '')), '');
  v_reward_xp integer;
  v_reward_coins integer;
  v_threshold integer;
  v_current integer := 0;
  v_state jsonb;
  v_claimed jsonb;
  v_stats jsonb;
begin
  if p_user_id is null or auth.uid() <> p_user_id then
    raise exception 'not authorized';
  end if;
  perform p_reward_xp, p_reward_coins;

  select coalesce(u.account_state, '{}'::jsonb), u.quizzes, u.xp, u.coins
  into v_state, v_current, xp, coins
  from public.users u where u.id = p_user_id for update;
  if not found then raise exception 'user not found'; end if;

  v_stats := case when jsonb_typeof(v_state -> 'userStats') = 'object'
    then v_state -> 'userStats' else '{}'::jsonb end;

  case v_key
    when 'quiz_100' then v_threshold := 100; v_reward_xp := 250; v_reward_coins := 100;
    when 'quiz_500' then v_threshold := 500; v_reward_xp := 1500; v_reward_coins := 600;
    when 'streak_7' then v_current := coalesce((v_stats ->> 'bestStreak')::integer, 0); v_threshold := 7; v_reward_xp := 200; v_reward_coins := 80;
    when 'streak_20' then v_current := coalesce((v_stats ->> 'bestStreak')::integer, 0); v_threshold := 20; v_reward_xp := 700; v_reward_coins := 300;
    when 'multiplayer_10' then v_current := coalesce((v_stats ->> 'multiplayerGames')::integer, 0); v_threshold := 10; v_reward_xp := 350; v_reward_coins := 130;
    when 'multiplayer_50' then v_current := coalesce((v_stats ->> 'multiplayerGames')::integer, 0); v_threshold := 50; v_reward_xp := 1300; v_reward_coins := 550;
    when 'friends_3' then select count(*)::integer into v_current from public.friendships where status = 'accepted' and p_user_id in (user_id, friend_id); v_threshold := 3; v_reward_xp := 250; v_reward_coins := 110;
    when 'friends_10' then select count(*)::integer into v_current from public.friendships where status = 'accepted' and p_user_id in (user_id, friend_id); v_threshold := 10; v_reward_xp := 750; v_reward_coins := 325;
    when 'xpboost_5' then v_current := coalesce((v_stats ->> 'xpBoostsUsed')::integer, 0); v_threshold := 5; v_reward_xp := 450; v_reward_coins := 175;
    when 'xpboost_20' then v_current := coalesce((v_stats ->> 'xpBoostsUsed')::integer, 0); v_threshold := 20; v_reward_xp := 1400; v_reward_coins := 600;
    else raise exception 'unknown achievement';
  end case;

  if v_current < v_threshold then
    raise exception 'achievement is locked';
  end if;

  v_claimed := case when jsonb_typeof(v_state -> 'claimedAchievements') = 'array'
    then v_state -> 'claimedAchievements' else '[]'::jsonb end;
  if exists (select 1 from jsonb_array_elements_text(v_claimed) as item(value) where item.value = v_key) then
    return query select false, u.xp, u.coins, v_claimed from public.users u where u.id = p_user_id;
    return;
  end if;

  v_claimed := v_claimed || jsonb_build_array(v_key);
  return query
  update public.users u
  set xp = coalesce(u.xp, 0) + v_reward_xp,
      coins = coalesce(u.coins, 0) + v_reward_coins,
      account_state = jsonb_set(
        v_state || jsonb_build_object('updatedAt', timezone('utc', now())),
        '{claimedAchievements}', v_claimed, true
      )
  where u.id = p_user_id
  returning true, u.xp, u.coins, u.account_state -> 'claimedAchievements';
end;
$$;

revoke all on function public.claim_user_achievement(uuid, text, integer, integer) from public, anon;
grant execute on function public.claim_user_achievement(uuid, text, integer, integer) to authenticated;

create table if not exists public.coin_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  operation_key text not null,
  item_id text not null,
  coin_delta integer not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, operation_key)
);

alter table public.coin_transactions enable row level security;
revoke all on table public.coin_transactions from anon, authenticated;
grant select on table public.coin_transactions to authenticated;

drop policy if exists "coin_transactions_select_own" on public.coin_transactions;
create policy "coin_transactions_select_own"
  on public.coin_transactions for select to authenticated
  using (auth.uid() = user_id);

create or replace function public.spend_shop_coins(
  p_operation_key text,
  p_item_id text
)
returns table (already_processed boolean, coins integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_key text := nullif(btrim(coalesce(p_operation_key, '')), '');
  v_item text := nullif(btrim(coalesce(p_item_id, '')), '');
  v_cost integer;
  v_coins integer;
  v_state jsonb;
  v_stats jsonb;
  v_boosts jsonb;
  v_amount integer := 0;
  v_current integer := 0;
  v_now_ms bigint := floor(extract(epoch from timezone('utc', now())) * 1000)::bigint;
begin
  if v_user_id is null then raise exception 'not authenticated'; end if;
  if v_key is null or length(v_key) > 160 then raise exception 'invalid operation key'; end if;

  v_cost := case v_item
    when 'energy-1' then 24
    when 'energy-10' then 230
    when 'energy-20' then 420
    when 'energy-cap-5' then 5000
    when 'energy-cap-10' then 9000
    when 'streak_shield' then 180
    when 'freeze_time' then 140
    when 'double_xp' then 290
    when 'joker_5050' then 165
    else null
  end;
  if v_cost is null then raise exception 'unknown shop item'; end if;

  select u.coins, coalesce(u.account_state, '{}'::jsonb)
  into v_coins, v_state
  from public.users u where u.id = v_user_id for update;
  if not found then raise exception 'user not found'; end if;

  if exists (
    select 1 from public.coin_transactions
    where user_id = v_user_id and operation_key = v_key
  ) then
    return query select true, greatest(coalesce(v_coins, 0), 0);
    return;
  end if;

  if coalesce(v_coins, 0) < v_cost then raise exception 'not enough coins'; end if;

  v_stats := case when jsonb_typeof(v_state -> 'userStats') = 'object'
    then v_state -> 'userStats' else '{}'::jsonb end;
  v_boosts := case when jsonb_typeof(v_state -> 'boosts') = 'object'
    then v_state -> 'boosts' else '{}'::jsonb end;

  if v_item in ('energy-1', 'energy-10', 'energy-20') then
    v_amount := case v_item when 'energy-1' then 1 when 'energy-10' then 10 else 20 end;
    v_current := greatest(coalesce((v_state ->> 'energy')::integer, 3), 0);
    v_state := v_state || jsonb_build_object(
      'energy', least(
        v_current + v_amount,
        3 + least(greatest(coalesce((v_stats ->> 'energyCapBonus')::integer, 0), 0), 20)
      ),
      'energyBase', 3,
      'energyTimestamp', v_now_ms
    );
  elsif v_item in ('energy-cap-5', 'energy-cap-10') then
    v_amount := case v_item when 'energy-cap-5' then 5 else 10 end;
    v_current := least(greatest(coalesce((v_stats ->> 'energyCapBonus')::integer, 0), 0), 20);
    if v_current + v_amount > 20 then raise exception 'maximum energy reached'; end if;
    v_stats := v_stats || jsonb_build_object('energyCapBonus', v_current + v_amount);
  elsif v_item = 'double_xp' then
    v_current := greatest(coalesce((v_stats ->> 'xpBoostsUsed')::integer, 0), 0);
    v_stats := v_stats || jsonb_build_object('xpBoostsUsed', v_current + 1);
    v_state := v_state || jsonb_build_object(
      'doubleXpExpiresAt', greatest(coalesce((v_state ->> 'doubleXpExpiresAt')::bigint, 0), v_now_ms) + 21600000
    );
  else
    v_current := greatest(coalesce((v_boosts ->> v_item)::integer, 0), 0);
    v_boosts := jsonb_set(v_boosts, array[v_item], to_jsonb(v_current + 1), true);
    v_state := jsonb_set(v_state, '{boosts}', v_boosts, true);
  end if;

  v_state := jsonb_set(v_state, '{userStats}', v_stats, true)
    || jsonb_build_object('updatedAt', timezone('utc', now()));

  update public.users as u
  set coins = u.coins - v_cost, account_state = v_state
  where u.id = v_user_id returning u.coins into v_coins;
  insert into public.coin_transactions(user_id, operation_key, item_id, coin_delta)
  values (v_user_id, v_key, v_item, -v_cost);

  return query select false, v_coins;
end;
$$;

revoke all on function public.spend_shop_coins(text, text) from public, anon;
grant execute on function public.spend_shop_coins(text, text) to authenticated;

create or replace function public.claim_daily_coins()
returns table (claimed_at timestamptz, coins integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_last_claim timestamptz;
  v_now timestamptz := timezone('utc', now());
  v_coins integer;
begin
  if v_user_id is null then raise exception 'not authenticated'; end if;

  select max(created_at) into v_last_claim
  from public.coin_transactions
  where user_id = v_user_id and item_id = 'daily-coins';

  if v_last_claim is not null and v_last_claim > v_now - interval '24 hours' then
    raise exception 'daily reward already claimed';
  end if;

  perform 1 from public.users where id = v_user_id for update;
  insert into public.coin_transactions(user_id, operation_key, item_id, coin_delta, created_at)
  values (v_user_id, 'daily:' || floor(extract(epoch from v_now) / 86400)::bigint::text, 'daily-coins', 5, v_now);
  update public.users
  set coins = coalesce(users.coins, 0) + 5,
      account_state = coalesce(users.account_state, '{}'::jsonb)
        || jsonb_build_object(
          'dailyFreeCoinsClaim', floor(extract(epoch from v_now) * 1000)::bigint::text,
          'updatedAt', v_now
        )
  where id = v_user_id returning users.coins into v_coins;

  return query select v_now, v_coins;
end;
$$;

revoke all on function public.claim_daily_coins() from public, anon;
grant execute on function public.claim_daily_coins() to authenticated;

revoke execute on function public.increment_user_progress(uuid, integer, integer, integer, integer, integer)
  from public, anon, authenticated;
revoke execute on function public.submit_score(uuid, integer)
  from public, anon, authenticated;
revoke execute on function public.mark_player_finished(uuid, timestamptz)
  from public, anon, authenticated;

revoke insert, update, delete, truncate, references, trigger on public.matches from anon, authenticated;
revoke insert, update, delete, truncate, references, trigger on public.scores from anon, authenticated;
revoke update on public.users from anon, authenticated;
grant update (username, email) on public.users to authenticated;

drop policy if exists "Users can insert their own scores" on public.scores;
drop policy if exists "matches_guest_join" on public.matches;
drop policy if exists "matches_guest_update" on public.matches;
drop policy if exists "matches_host_delete" on public.matches;
drop policy if exists "matches_host_insert" on public.matches;
drop policy if exists "matches_host_update" on public.matches;
drop policy if exists "matches_insert_by_participant" on public.matches;
drop policy if exists "matches_owner_delete" on public.matches;
drop policy if exists "matches_owner_insert" on public.matches;
drop policy if exists "matches_owner_update" on public.matches;
