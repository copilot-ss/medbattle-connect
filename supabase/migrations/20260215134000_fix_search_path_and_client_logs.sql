do $$
begin
  if to_regprocedure('public.touch_updated_at()') is not null then
    execute 'alter function public.touch_updated_at() set search_path = public';
  end if;

  if to_regprocedure('public.normalize_difficulty(text)') is not null then
    execute 'alter function public.normalize_difficulty(text) set search_path = public';
  end if;

  if to_regprocedure('public.normalize_friend_code(text)') is not null then
    execute 'alter function public.normalize_friend_code(text) set search_path = public';
  end if;

  if to_regprocedure('public.derive_friend_code(uuid)') is not null then
    execute 'alter function public.derive_friend_code(uuid) set search_path = public';
  end if;

  if to_regprocedure('public.generate_join_code()') is not null then
    execute 'alter function public.generate_join_code() set search_path = public';
  end if;

  if to_regprocedure('public.jsonb_array_tail(jsonb, integer)') is not null then
    execute 'alter function public.jsonb_array_tail(jsonb, integer) set search_path = public';
  end if;

  if to_regprocedure('public.normalize_question_options(jsonb, text)') is not null then
    execute 'alter function public.normalize_question_options(jsonb, text) set search_path = public';
  end if;

  if to_regprocedure('public.sanitize_match_answer(jsonb)') is not null then
    execute 'alter function public.sanitize_match_answer(jsonb) set search_path = public';
  end if;
end $$;

drop policy if exists "client_logs_insert" on public.client_logs;
create policy "client_logs_insert"
  on public.client_logs
  as permissive
  for insert
  to anon, authenticated
  with check (
    ((select auth.uid()) is null and user_id is null)
    or (user_id = (select auth.uid()))
  );
