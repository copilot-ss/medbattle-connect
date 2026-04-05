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
  boosts_used jsonb := '[]'::jsonb;
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

  if p_answer ? 'boostsUsed' and jsonb_typeof(p_answer->'boostsUsed') = 'array' then
    select coalesce(jsonb_agg(value order by first_idx), '[]'::jsonb)
    into boosts_used
    from (
      select value, min(idx) as first_idx
      from jsonb_array_elements_text(p_answer->'boostsUsed')
        with ordinality as t(value, idx)
      where value in ('joker_5050', 'freeze_time')
      group by value
    ) filtered;
  end if;

  return jsonb_build_object(
    'questionId', question_id,
    'selectedOption', selected_option,
    'correct', correct,
    'durationMs', duration_ms,
    'timedOut', timed_out,
    'boostsUsed', boosts_used,
    'answeredAt', coalesce(answered_at, now()::text)
  );
end;
$$;
