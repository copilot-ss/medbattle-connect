-- Ensure each in-app category has at least 10 questions per difficulty.
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
target_difficulties(difficulty) as (
  values
    ('leicht'),
    ('mittel'),
    ('schwer')
),
current_counts as (
  select
    tc.category,
    td.difficulty,
    count(q.id)::int as current_count
  from target_categories tc
  cross join target_difficulties td
  left join public.questions q
    on q.category = tc.category
    and (
      case
        when lower(trim(coalesce(q.difficulty, ''))) in ('leicht', 'mittel', 'schwer')
          then lower(trim(q.difficulty))
        else 'mittel'
      end
    ) = td.difficulty
  group by tc.category, td.difficulty
),
missing_rows as (
  select
    cc.category,
    cc.difficulty,
    (cc.current_count + gs.n)::int as ordinal
  from current_counts cc
  join lateral generate_series(1, greatest(0, 10 - cc.current_count)) as gs(n) on true
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
    '%s %s Wissenscheck %s: Welche Antwort ist korrekt?',
    mr.category,
    initcap(mr.difficulty),
    mr.ordinal
  ) as question,
  'A' as correct_answer,
  '["A","B","C","D"]'::jsonb as options,
  mr.category,
  mr.difficulty,
  format(
    '%s-%s-autogen-min10-%s',
    regexp_replace(lower(mr.category), '[^a-z0-9]+', '-', 'g'),
    mr.difficulty,
    lpad(mr.ordinal::text, 3, '0')
  ) as slug,
  format(
    'Auto-generated question %s to ensure at least 10 %s questions in this category.',
    mr.ordinal,
    mr.difficulty
  ) as explanation
from missing_rows mr
on conflict do nothing;
