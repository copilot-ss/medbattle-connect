drop policy if exists "questions_read_all" on public.questions;
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "Players can view their own scores" on public.scores;
drop policy if exists "scores_read_all" on public.scores;
drop policy if exists "scores_self_insert" on public.scores;

drop policy if exists "matches_guest_select" on public.matches;
drop policy if exists "matches_host_select" on public.matches;
drop policy if exists "matches_participant_select" on public.matches;
drop policy if exists "matches_waiting_select" on public.matches;
drop policy if exists "matches_owner_select" on public.matches;

create policy "matches_owner_select"
  on public.matches
  as permissive
  for select
  to authenticated
  using (
    ((select auth.uid()) = host_id)
    or ((select auth.uid()) = guest_id)
    or ((select auth.uid()) = player1_id)
    or ((select auth.uid()) = player2_id)
    or (((select auth.uid()) is not null) and (status = 'waiting'::text))
  );

drop policy if exists "matches_guest_join" on public.matches;
drop policy if exists "matches_guest_update" on public.matches;
drop policy if exists "matches_host_update" on public.matches;
drop policy if exists "matches_owner_update" on public.matches;

create policy "matches_owner_update"
  on public.matches
  as permissive
  for update
  to authenticated
  using (
    ((select auth.uid()) = host_id)
    or ((select auth.uid()) = guest_id)
    or ((select auth.uid()) = player1_id)
    or ((select auth.uid()) = player2_id)
    or (
      (status = 'waiting'::text)
      and (guest_id is null)
      and ((select auth.uid()) is not null)
    )
  )
  with check (
    ((select auth.uid()) = host_id)
    or ((select auth.uid()) = guest_id)
    or ((select auth.uid()) = player1_id)
    or ((select auth.uid()) = player2_id)
  );

drop policy if exists "matches_host_insert" on public.matches;
drop policy if exists "matches_insert_by_participant" on public.matches;
drop policy if exists "matches_owner_insert" on public.matches;

create policy "matches_owner_insert"
  on public.matches
  as permissive
  for insert
  to authenticated
  with check (
    ((select auth.uid()) = host_id)
    or ((select auth.uid()) = guest_id)
    or ((select auth.uid()) = player1_id)
    or ((select auth.uid()) = player2_id)
  );

drop policy if exists "matches_host_delete" on public.matches;
drop policy if exists "matches_owner_delete" on public.matches;

create policy "matches_owner_delete"
  on public.matches
  as permissive
  for delete
  to authenticated
  using (
    ((select auth.uid()) = host_id)
    or ((select auth.uid()) = player1_id)
    or ((select auth.uid()) = player2_id)
  );

drop index if exists public.idx_matches_status;
drop index if exists public.idx_matches_code;
drop index if exists public.scores_points_idx;
drop index if exists public.scores_user_id_idx;
