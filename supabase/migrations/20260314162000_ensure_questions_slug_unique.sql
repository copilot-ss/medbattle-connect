-- Ensure slug-based upserts work before the curated question packs run.

update public.questions
set slug = null
where slug is not null
  and trim(slug) = '';

with duplicate_slugs as (
  select
    id,
    slug,
    row_number() over (
      partition by slug
      order by updated_at desc nulls last, created_at desc nulls last, id
    ) as duplicate_rank
  from public.questions
  where slug is not null
)
update public.questions q
set slug = q.slug || '-legacy-' || left(q.id::text, 8)
from duplicate_slugs d
where q.id = d.id
  and d.duplicate_rank > 1;

alter table public.questions
  drop constraint if exists questions_slug_unique;

drop index if exists public.questions_slug_unique;

create unique index if not exists questions_slug_unique
  on public.questions (slug);
