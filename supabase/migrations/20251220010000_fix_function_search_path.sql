do $$
begin
  if to_regprocedure('public.accept_friend_request(uuid, uuid)') is not null then
    execute 'alter function public.accept_friend_request(uuid, uuid) set search_path = public';
  end if;

  if to_regprocedure('public.create_friend_request(uuid, uuid)') is not null then
    execute 'alter function public.create_friend_request(uuid, uuid) set search_path = public';
  end if;

  if to_regprocedure('public.generate_friend_code()') is not null then
    execute 'alter function public.generate_friend_code() set search_path = public';
  end if;

  if to_regprocedure('public.generate_match_code(integer)') is not null then
    execute 'alter function public.generate_match_code(integer) set search_path = public';
  end if;

  if to_regprocedure('public.set_updated_at()') is not null then
    execute 'alter function public.set_updated_at() set search_path = public';
  end if;

  if to_regprocedure('public.touch_matches_updated_at()') is not null then
    execute 'alter function public.touch_matches_updated_at() set search_path = public';
  end if;

  if to_regprocedure('public.derive_username(text, jsonb, uuid)') is not null then
    execute 'alter function public.derive_username(text, jsonb, uuid) set search_path = public';
  end if;
end $$;
