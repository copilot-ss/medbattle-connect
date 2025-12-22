with ranked as (
  select
    id,
    row_number() over (
      partition by slug
      order by created_at asc, id asc
    ) as rn
  from public.questions
  where slug is not null and btrim(slug) <> ''
)
delete from public.questions
where id in (select id from ranked where rn > 1);

with ranked as (
  select
    id,
    row_number() over (
      partition by lower(trim(question)), lower(trim(category)), lower(trim(difficulty))
      order by created_at asc, id asc
    ) as rn
  from public.questions
)
delete from public.questions
where id in (select id from ranked where rn > 1);

update public.questions
set slug = md5(lower(trim(question)) || '|' || lower(trim(category)) || '|' || lower(trim(difficulty)))
where slug is null or btrim(slug) = '';

create unique index if not exists questions_slug_unique
  on public.questions (slug)
  where slug is not null;

create unique index if not exists questions_unique_question_category_difficulty
  on public.questions (lower(trim(question)), lower(trim(category)), lower(trim(difficulty)));
