create or replace function public.resolve_question_categories(
  p_category text default null
)
returns text[]
language sql
immutable
set search_path = public
as $$
  select case lower(trim(coalesce(p_category, '')))
    when '' then null::text[]
    when 'medizin' then array[
      'Anatomie',
      'Physiologie',
      'Pathologie',
      'Pharmakologie',
      'Mikrobiologie',
      'Biochemie',
      'Immunologie',
      'Genetik',
      'Radiologie',
      'Chirurgie'
    ]::text[]
    else array[trim(p_category)]::text[]
  end;
$$;

grant execute on function public.resolve_question_categories(text) to anon, authenticated;

create or replace function public.get_questions(
  p_limit integer default 6,
  p_category text default null,
  p_language text default 'de',
  p_fallback_language text default 'de'
)
returns table (
  id uuid,
  category text,
  question text,
  options jsonb,
  correct_answer text,
  explanation text,
  updated_at timestamptz
)
language sql
stable
set search_path = public
as $$
  with settings as (
    select
      greatest(1, least(coalesce(p_limit, 6), 50)) as limit_count,
      least(
        240,
        greatest(greatest(1, least(coalesce(p_limit, 6), 50)) * 10, 24)
      ) as candidate_limit,
      nullif(trim(p_category), '') as requested_category,
      public.resolve_question_categories(p_category) as resolved_categories,
      coalesce(nullif(trim(p_language), ''), 'de') as normalized_language,
      nullif(trim(p_fallback_language), '') as normalized_fallback_language,
      random() as seed
  ),
  candidate_primary as (
    select
      q.id,
      q.category,
      q.question as base_question,
      q.options as base_options,
      q.correct_answer as base_correct_answer,
      q.explanation as base_explanation,
      q.updated_at,
      q.random_weight,
      0 as segment_order
    from public.questions q
    cross join settings s
    where (
      s.resolved_categories is null
      or q.category = any(s.resolved_categories)
    )
      and q.random_weight >= s.seed
    order by q.random_weight
    limit (select candidate_limit from settings)
  ),
  candidate_secondary as (
    select
      q.id,
      q.category,
      q.question as base_question,
      q.options as base_options,
      q.correct_answer as base_correct_answer,
      q.explanation as base_explanation,
      q.updated_at,
      q.random_weight,
      1 as segment_order
    from public.questions q
    cross join settings s
    where (
      s.resolved_categories is null
      or q.category = any(s.resolved_categories)
    )
      and q.random_weight < s.seed
    order by q.random_weight
    limit (select candidate_limit from settings)
  ),
  candidate_questions as (
    select *
    from candidate_primary
    union all
    select *
    from candidate_secondary
  ),
  normalized as (
    select
      q.id,
      q.category,
      coalesce(t_lang.question, t_fb.question, q.base_question) as question,
      coalesce(t_lang.options, t_fb.options, q.base_options) as options,
      coalesce(t_lang.correct_answer, t_fb.correct_answer, q.base_correct_answer) as correct_answer,
      coalesce(t_lang.explanation, t_fb.explanation, q.base_explanation) as explanation,
      greatest(
        q.updated_at,
        coalesce(t_lang.updated_at, t_fb.updated_at, q.updated_at)
      ) as updated_at,
      q.random_weight,
      q.segment_order,
      s.requested_category
    from candidate_questions q
    cross join settings s
    left join public.question_translations t_lang
      on t_lang.question_id = q.id
      and t_lang.language = s.normalized_language
    left join public.question_translations t_fb
      on t_fb.question_id = q.id
      and s.normalized_fallback_language is not null
      and t_fb.language = s.normalized_fallback_language
  ),
  deduped as (
    select
      id,
      category,
      question,
      options,
      correct_answer,
      explanation,
      updated_at,
      random_weight,
      segment_order
    from (
      select
        normalized.*,
        row_number() over (
          partition by
            lower(trim(question)),
            lower(trim(coalesce(requested_category, category)))
          order by segment_order, random_weight, id
        ) as duplicate_rank
      from normalized
      where question is not null
        and correct_answer is not null
        and jsonb_typeof(options) = 'array'
        and jsonb_array_length(options) >= 2
    ) ranked
    where duplicate_rank = 1
  )
  select
    id,
    category,
    question,
    options,
    correct_answer,
    explanation,
    updated_at
  from deduped
  order by segment_order, random_weight, id
  limit (select limit_count from settings);
$$;

grant execute on function public.get_questions(integer, text, text, text) to anon, authenticated;
