create or replace function public.normalize_german_sharp_s_text(input text)
returns text
language sql
immutable
as $$
  select case
    when input is null then null
    else replace(
      replace(
        replace(
          replace(input, 'Heisst', 'Heißt'),
        'heisst', 'heißt'),
      'Gross', 'Groß'),
    'gross', 'groß')
  end;
$$;

create or replace function public.normalize_german_sharp_s_options(input jsonb)
returns jsonb
language sql
immutable
as $$
  select case
    when input is null then null
    when jsonb_typeof(input) <> 'array' then input
    else (
      select jsonb_agg(
        to_jsonb(public.normalize_german_sharp_s_text(value))
        order by ordinality
      )
      from jsonb_array_elements_text(input) with ordinality as opt(value, ordinality)
    )
  end;
$$;

update public.questions
set
  question = public.normalize_german_sharp_s_text(question),
  correct_answer = public.normalize_german_sharp_s_text(correct_answer),
  explanation = public.normalize_german_sharp_s_text(explanation),
  options = public.normalize_german_sharp_s_options(options)
where
  coalesce(question, '') ~ '(?:heisst|Heisst|gross|Gross)'
  or coalesce(correct_answer, '') ~ '(?:heisst|Heisst|gross|Gross)'
  or coalesce(explanation, '') ~ '(?:heisst|Heisst|gross|Gross)'
  or (
    options is not null
    and jsonb_typeof(options) = 'array'
    and exists (
      select 1
      from jsonb_array_elements_text(options) as opt(value)
      where value ~ '(?:heisst|Heisst|gross|Gross)'
    )
  );

update public.question_translations
set
  question = public.normalize_german_sharp_s_text(question),
  correct_answer = public.normalize_german_sharp_s_text(correct_answer),
  explanation = public.normalize_german_sharp_s_text(explanation),
  options = public.normalize_german_sharp_s_options(options)
where
  language = 'de'
  and (
    coalesce(question, '') ~ '(?:heisst|Heisst|gross|Gross)'
    or coalesce(correct_answer, '') ~ '(?:heisst|Heisst|gross|Gross)'
    or coalesce(explanation, '') ~ '(?:heisst|Heisst|gross|Gross)'
    or (
      options is not null
      and jsonb_typeof(options) = 'array'
      and exists (
        select 1
        from jsonb_array_elements_text(options) as opt(value)
        where value ~ '(?:heisst|Heisst|gross|Gross)'
      )
    )
  );
