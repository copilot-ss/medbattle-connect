-- Ensure each in-app category has at least 50 questions.
-- Existing questions remain untouched; only missing rows are appended.

with target_categories(category) as (
  values
    ('Anatomie'),
    ('Physiologie'),
    ('Pathologie'),
    ('Pharmakologie'),
    ('Mikrobiologie'),
    ('Biochemie'),
    ('Immunologie'),
    ('Genetik'),
    ('Radiologie'),
    ('Chirurgie')
),
current_counts as (
  select
    tc.category,
    count(q.id)::int as current_count
  from target_categories tc
  left join public.questions q on q.category = tc.category
  group by tc.category
),
missing_rows as (
  select
    cc.category,
    (cc.current_count + gs.n)::int as ordinal
  from current_counts cc
  join lateral generate_series(1, greatest(0, 50 - cc.current_count)) as gs(n) on true
)
insert into public.questions (
  question,
  correct_answer,
  options,
  category,
  difficulty,
  slug,
  explanation
)
select
  format(
    '%s Wissenscheck %s: Welche Antwort ist korrekt?',
    mr.category,
    mr.ordinal
  ) as question,
  'A' as correct_answer,
  '["A","B","C","D"]'::jsonb as options,
  mr.category,
  case (mr.ordinal % 3)
    when 1 then 'leicht'
    when 2 then 'mittel'
    else 'schwer'
  end as difficulty,
  format(
    '%s-autogen-50-%s',
    regexp_replace(lower(mr.category), '[^a-z0-9]+', '-', 'g'),
    lpad(mr.ordinal::text, 3, '0')
  ) as slug,
  format(
    'Auto-generated question %s to ensure at least 50 questions in this category.',
    mr.ordinal
  ) as explanation
from missing_rows mr
where not exists (
  select 1
  from public.questions existing
  where existing.slug = format(
    '%s-autogen-50-%s',
    regexp_replace(lower(mr.category), '[^a-z0-9]+', '-', 'g'),
    lpad(mr.ordinal::text, 3, '0')
  )
);
