-- Ensure every question has an explanation (existing + future rows).

create or replace function public.build_fallback_question_explanation(
  p_correct_answer text,
  p_language text default 'de'
)
returns text
language plpgsql
immutable
set search_path = public
as $$
declare
  normalized_language text := lower(coalesce(trim(p_language), 'de'));
  normalized_answer text := nullif(trim(coalesce(p_correct_answer, '')), '');
begin
  if normalized_answer is null then
    if normalized_language = 'en' then
      return 'Review the options and remember the key point of this question.';
    end if;
    return 'Pruefe die Antwortoptionen und merke dir den Kernpunkt dieser Frage.';
  end if;

  if normalized_language = 'en' then
    return format('Correct answer: %s.', normalized_answer);
  end if;

  return format('Richtige Antwort: %s.', normalized_answer);
end;
$$;

create or replace function public.ensure_questions_explanation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.explanation is null or btrim(new.explanation) = '' then
    new.explanation := public.build_fallback_question_explanation(
      new.correct_answer,
      'de'
    );
  end if;
  return new;
end;
$$;

create or replace function public.ensure_question_translations_explanation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.explanation is null or btrim(new.explanation) = '' then
    new.explanation := public.build_fallback_question_explanation(
      new.correct_answer,
      new.language
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_questions_ensure_explanation on public.questions;
create trigger trg_questions_ensure_explanation
before insert or update of correct_answer, explanation
on public.questions
for each row execute function public.ensure_questions_explanation();

drop trigger if exists trg_question_translations_ensure_explanation on public.question_translations;
create trigger trg_question_translations_ensure_explanation
before insert or update of correct_answer, explanation, language
on public.question_translations
for each row execute function public.ensure_question_translations_explanation();

update public.questions q
set explanation = public.build_fallback_question_explanation(q.correct_answer, 'de')
where q.explanation is null or btrim(q.explanation) = '';

update public.question_translations qt
set explanation = case
  when lower(coalesce(trim(qt.language), 'de')) = 'de'
    then coalesce(
      nullif(btrim(q.explanation), ''),
      public.build_fallback_question_explanation(
        coalesce(nullif(trim(qt.correct_answer), ''), q.correct_answer),
        qt.language
      )
    )
  else public.build_fallback_question_explanation(
    coalesce(nullif(trim(qt.correct_answer), ''), q.correct_answer),
    qt.language
  )
end
from public.questions q
where q.id = qt.question_id
  and (qt.explanation is null or btrim(qt.explanation) = '');
