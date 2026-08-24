do $migration$
declare
  v_definition text;
  v_before text;
begin
  v_definition := pg_get_functiondef(
    'public.complete_quiz(text,jsonb,uuid)'::regprocedure
  );
  v_before := v_definition;
  v_definition := replace(
    v_definition,
    '  v_inserted public.quiz_completions;' || chr(10),
    ''
  );
  v_definition := replace(
    v_definition,
    '  )' || chr(10) || '  returning * into v_inserted;',
    '  );'
  );
  if v_definition = v_before then
    raise exception 'complete_quiz lint cleanup did not match expected source';
  end if;
  execute v_definition;

  v_definition := pg_get_functiondef(
    'public.claim_user_achievement(uuid,text,integer,integer)'::regprocedure
  );
  v_before := v_definition;
  v_definition := replace(
    v_definition,
    '  if p_user_id is null or auth.uid() <> p_user_id then' || chr(10) ||
    '    raise exception ''not authorized'';' || chr(10) ||
    '  end if;' || chr(10) || chr(10) ||
    '  select coalesce(u.account_state, ''{}''::jsonb), u.quizzes, u.xp, u.coins',
    '  if p_user_id is null or auth.uid() <> p_user_id then' || chr(10) ||
    '    raise exception ''not authorized'';' || chr(10) ||
    '  end if;' || chr(10) ||
    '  perform p_reward_xp, p_reward_coins;' || chr(10) || chr(10) ||
    '  select coalesce(u.account_state, ''{}''::jsonb), u.quizzes, u.xp, u.coins'
  );
  if v_definition = v_before then
    raise exception 'claim_user_achievement lint cleanup did not match expected source';
  end if;
  execute v_definition;
end
$migration$;
