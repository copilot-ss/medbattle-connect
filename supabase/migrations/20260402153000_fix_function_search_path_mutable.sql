do $$
begin
  if to_regprocedure('public.fix_german_mojibake_text(text)') is not null then
    execute 'alter function public.fix_german_mojibake_text(text) set search_path = public';
  end if;

  if to_regprocedure('public.fix_german_mojibake_options(jsonb)') is not null then
    execute 'alter function public.fix_german_mojibake_options(jsonb) set search_path = public';
  end if;

  if to_regprocedure('public.normalize_german_sharp_s_text(text)') is not null then
    execute 'alter function public.normalize_german_sharp_s_text(text) set search_path = public';
  end if;

  if to_regprocedure('public.normalize_german_sharp_s_options(jsonb)') is not null then
    execute 'alter function public.normalize_german_sharp_s_options(jsonb) set search_path = public';
  end if;

  if to_regprocedure('public.sanitize_match_answer(jsonb)') is not null then
    execute 'alter function public.sanitize_match_answer(jsonb) set search_path = public';
  end if;
end $$;
