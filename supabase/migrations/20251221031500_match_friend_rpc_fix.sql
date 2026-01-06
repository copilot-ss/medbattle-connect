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
