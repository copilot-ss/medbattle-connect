-- Keep only the 10 in-app home categories and normalize them to exactly 50 questions each.
-- Steps:
-- 1) Remove Football and Police-Spanish categories.
-- 2) Distribute remaining non-home categories across home categories.
-- 3) Enforce exactly 50 questions per home category.

-- 1) Remove Football + Police-Spanish questions.
delete from public.questions q
where lower(trim(q.category)) in (
  'fußball',
  'fussball',
  'polizei-spanisch',
  'polizei spanisch'
);

-- 2) Reassign all other non-home categories to the 10 home categories (round-robin).
with target_categories(ord, category) as (
  values
    (1, 'Anatomie'),
    (2, 'Physiologie'),
    (3, 'Pathologie'),
    (4, 'Pharmakologie'),
    (5, 'Mikrobiologie'),
    (6, 'Biochemie'),
    (7, 'Immunologie'),
    (8, 'Genetik'),
    (9, 'Radiologie'),
    (10, 'Chirurgie')
),
non_target as (
  select
    q.id,
    q.question,
    coalesce(q.difficulty, '') as difficulty_value,
    row_number() over (order by q.created_at asc nulls last, q.id asc) as rn
  from public.questions q
  where lower(trim(q.category)) not in (
    select lower(category) from target_categories
  )
),
assignments as (
  select
    nt.id,
    nt.question,
    nt.difficulty_value,
    tc.category as new_category
  from non_target nt
  join target_categories tc on tc.ord = ((nt.rn - 1) % 10) + 1
),
assignments_ranked as (
  select
    a.*,
    row_number() over (
      partition by lower(trim(a.question)), lower(trim(a.difficulty_value)), lower(a.new_category)
      order by a.id asc
    ) as duplicate_rank
  from assignments a
),
to_drop_duplicate_assignment as (
  select id
  from assignments_ranked
  where duplicate_rank > 1
),
to_drop_existing_conflicts as (
  select ar.id
  from assignments_ranked ar
  where ar.duplicate_rank = 1
    and exists (
      select 1
      from public.questions q2
      where q2.id <> ar.id
        and lower(trim(q2.question)) = lower(trim(ar.question))
        and lower(trim(coalesce(q2.difficulty, ''))) = lower(trim(ar.difficulty_value))
        and lower(trim(q2.category)) = lower(trim(ar.new_category))
    )
),
to_drop as (
  select id from to_drop_duplicate_assignment
  union
  select id from to_drop_existing_conflicts
),
dropped as (
  delete from public.questions q
  where q.id in (select id from to_drop)
  returning q.id
)
update public.questions q
set category = ar.new_category
from assignments_ranked ar
where q.id = ar.id
  and ar.duplicate_rank = 1
  and q.id not in (select id from to_drop);

-- Remove any categories that are still outside of the 10 home categories.
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
)
delete from public.questions q
where lower(trim(q.category)) not in (
  select lower(category) from target_categories
);

-- 3a) Trim overflow to exactly 50 per category.
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
ranked as (
  select
    q.id,
    q.category,
    count(*) over (partition by q.category) as total_count,
    row_number() over (
      partition by q.category
      order by
        case
          when q.slug like '%-autogen-50-%' then 0
          else 1
        end asc,
        q.created_at desc nulls last,
        q.id desc
    ) as overflow_rank
  from public.questions q
  join target_categories tc on tc.category = q.category
),
to_delete as (
  select id
  from ranked
  where total_count > 50
    and overflow_rank <= (total_count - 50)
)
delete from public.questions q
where q.id in (select id from to_delete);

-- 3b) Fill deficits to exactly 50 per category.
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
),
insert_rows as (
  select
    mr.category,
    mr.ordinal,
    format(
      '%s Ausgleichsfrage %s: Welche Antwort ist korrekt?',
      mr.category,
      mr.ordinal
    ) as question,
    case (mr.ordinal % 3)
      when 1 then 'leicht'
      when 2 then 'mittel'
      else 'schwer'
    end as difficulty,
    format(
      '%s-autogen-rebalance-50-%s',
      regexp_replace(lower(mr.category), '[^a-z0-9]+', '-', 'g'),
      lpad(mr.ordinal::text, 3, '0')
    ) as slug
  from missing_rows mr
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
  ir.question,
  'A' as correct_answer,
  '["A","B","C","D"]'::jsonb as options,
  ir.category,
  ir.difficulty,
  ir.slug,
  format(
    'Auto-generated balancing question %s to complete 50 questions in this category.',
    ir.ordinal
  ) as explanation
from insert_rows ir
where not exists (
  select 1
  from public.questions q
  where q.slug = ir.slug
);
