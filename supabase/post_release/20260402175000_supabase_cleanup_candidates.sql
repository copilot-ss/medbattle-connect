-- Post-release Supabase cleanup plan.
-- Intentionally stored outside supabase/migrations so it does not auto-apply before release.
--
-- Basis:
-- - supabase inspect db index-stats --linked
-- - supabase inspect db table-stats --linked
-- - supabase inspect db calls --linked
-- - targeted code search in src/services and supabase/migrations
--
-- Current high-confidence findings:
-- 1. public.friends_table is legacy. Runtime uses public.friendships instead.
-- 2. public.matches still carries redundant code uniqueness/index history.
-- 3. public.client_logs has write-only runtime traffic; current app code does not read by user_id/created_at.
-- 4. Realtime traffic is the dominant Supabase load, so app-side subscription cleanup has higher impact than more DB indexes.

begin;

-- 1) Legacy table cleanup.
-- Verify row count before running in production if you want to archive historical data first.
drop table if exists public.friends_table cascade;

-- 2) Match-code uniqueness cleanup.
-- The app normalizes join codes to uppercase before lookup/submit.
-- Keep the plain code index for runtime lookups and remove the extra lower(code) uniqueness layer.
do $$
declare
  mixed_case_count bigint;
begin
  select count(*)
  into mixed_case_count
  from public.matches
  where code is not null
    and code <> upper(code);

  if mixed_case_count > 0 then
    raise exception
      'Post-release cleanup aborted: % match codes are not uppercase yet.',
      mixed_case_count;
  end if;
end;
$$;

alter table public.matches
  drop constraint if exists matches_code_uppercase_check;

alter table public.matches
  add constraint matches_code_uppercase_check
  check (code is null or code = upper(code));

drop index if exists public.matches_code_key;

-- 3) Optional low-value indexes.
-- Leave these commented until you confirm no admin/reporting workflow depends on them.
-- drop index if exists public.client_logs_created_at_idx;
-- drop index if exists public.client_logs_user_id_idx;
-- drop index if exists public.lobby_invites_sender_idx;
-- drop index if exists public.idx_match_results_match;

commit;
