do $migration$
declare
  v_definition text;
  v_before text;
begin
  v_definition := pg_get_functiondef(
    'public.complete_quiz(text,jsonb,uuid)'::regprocedure
  );
  v_before := v_definition;
  v_definition := replace(v_definition,
    'update public.users' || chr(10) ||
    '  set quizzes = coalesce(quizzes, 0) + 1,' || chr(10) ||
    '      correct = coalesce(correct, 0) + v_correct,' || chr(10) ||
    '      questions = coalesce(questions, 0) + v_total,' || chr(10) ||
    '      xp = coalesce(xp, 0) + v_xp,' || chr(10) ||
    '      coins = coalesce(coins, 0) + v_coins,' || chr(10) ||
    '      leaderboard_points = coalesce(leaderboard_points, 0) + v_points,',
    'update public.users as u' || chr(10) ||
    '  set quizzes = coalesce(u.quizzes, 0) + 1,' || chr(10) ||
    '      correct = coalesce(u.correct, 0) + v_correct,' || chr(10) ||
    '      questions = coalesce(u.questions, 0) + v_total,' || chr(10) ||
    '      xp = coalesce(u.xp, 0) + v_xp,' || chr(10) ||
    '      coins = coalesce(u.coins, 0) + v_coins,' || chr(10) ||
    '      leaderboard_points = coalesce(u.leaderboard_points, 0) + v_points,'
  );
  if v_definition = v_before then
    raise exception 'complete_quiz definition did not match expected source';
  end if;
  execute v_definition;

  v_definition := pg_get_functiondef(
    'public.claim_user_achievement(uuid,text,integer,integer)'::regprocedure
  );
  v_before := v_definition;
  v_definition := replace(v_definition,
    'select coalesce(account_state, ''{}''::jsonb), quizzes, xp, coins' || chr(10) ||
    '  into v_state, v_current, xp, coins' || chr(10) ||
    '  from public.users where id = p_user_id for update;',
    'select coalesce(u.account_state, ''{}''::jsonb), u.quizzes, u.xp, u.coins' || chr(10) ||
    '  into v_state, v_current, xp, coins' || chr(10) ||
    '  from public.users u where u.id = p_user_id for update;'
  );
  if v_definition = v_before then
    raise exception 'claim_user_achievement definition did not match expected source';
  end if;
  execute v_definition;

  v_definition := pg_get_functiondef(
    'public.spend_shop_coins(text,text)'::regprocedure
  );
  v_before := v_definition;
  v_definition := replace(v_definition,
    'update public.users' || chr(10) ||
    '  set coins = coins - v_cost, account_state = v_state' || chr(10) ||
    '  where id = v_user_id returning users.coins into v_coins;',
    'update public.users as u' || chr(10) ||
    '  set coins = u.coins - v_cost, account_state = v_state' || chr(10) ||
    '  where u.id = v_user_id returning u.coins into v_coins;'
  );
  if v_definition = v_before then
    raise exception 'spend_shop_coins definition did not match expected source';
  end if;
  execute v_definition;
end
$migration$;
