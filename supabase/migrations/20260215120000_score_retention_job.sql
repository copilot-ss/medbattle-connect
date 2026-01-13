create extension if not exists pg_cron;

create or replace function public.maintain_score_retention(
  p_max_scores integer default 50
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_limit integer := greatest(1, least(coalesce(p_max_scores, 50), 200));
  deleted_count integer;
begin
  with ranked as (
    select
      id,
      row_number() over (
        partition by user_id
        order by points desc, created_at desc, id desc
      ) as rn
    from public.scores
  )
  delete from public.scores s
  using ranked r
  where s.id = r.id
    and r.rn > normalized_limit;

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

do $$
declare
  job_id integer;
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    select jobid
      into job_id
      from cron.job
     where jobname = 'score_retention';

    if job_id is not null then
      perform cron.unschedule(job_id);
    end if;

    perform cron.schedule(
      'score_retention',
      '15 3 * * *',
      $cron$select public.maintain_score_retention(50);$cron$
    );
  end if;
end $$;
