create or replace function public.fix_german_mojibake_text(input text)
returns text
language sql
immutable
as $$
  select case
    when input is null then null
    else replace(
      replace(
        replace(
          replace(
            replace(
              replace(
                replace(
                  replace(input, 'Ã„', 'Ä'),
                'Ã–', 'Ö'),
              'Ãœ', 'Ü'),
            'Ã¤', 'ä'),
          'Ã¶', 'ö'),
        'Ã¼', 'ü'),
      'ÃŸ', 'ß'),
    'Ã©', 'é')
  end;
$$;

create or replace function public.fix_german_mojibake_options(input jsonb)
returns jsonb
language sql
immutable
as $$
  select case
    when input is null then null
    when jsonb_typeof(input) <> 'array' then input
    else (
      select jsonb_agg(
        to_jsonb(public.fix_german_mojibake_text(value))
        order by ordinality
      )
      from jsonb_array_elements_text(input) with ordinality as opt(value, ordinality)
    )
  end;
$$;

update public.questions
set
  question = public.fix_german_mojibake_text(question),
  correct_answer = public.fix_german_mojibake_text(correct_answer),
  explanation = public.fix_german_mojibake_text(explanation),
  options = public.fix_german_mojibake_options(options)
where
  coalesce(question, '') ~ 'Ã|Â|�'
  or coalesce(correct_answer, '') ~ 'Ã|Â|�'
  or coalesce(explanation, '') ~ 'Ã|Â|�'
  or (
    options is not null
    and jsonb_typeof(options) = 'array'
    and exists (
      select 1
      from jsonb_array_elements_text(options) as opt(value)
      where value ~ 'Ã|Â|�'
    )
  );

update public.question_translations
set
  question = public.fix_german_mojibake_text(question),
  correct_answer = public.fix_german_mojibake_text(correct_answer),
  explanation = public.fix_german_mojibake_text(explanation),
  options = public.fix_german_mojibake_options(options)
where
  language = 'de'
  and (
    coalesce(question, '') ~ 'Ã|Â|�'
    or coalesce(correct_answer, '') ~ 'Ã|Â|�'
    or coalesce(explanation, '') ~ 'Ã|Â|�'
    or (
      options is not null
      and jsonb_typeof(options) = 'array'
      and exists (
        select 1
        from jsonb_array_elements_text(options) as opt(value)
        where value ~ 'Ã|Â|�'
      )
    )
  );
