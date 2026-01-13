alter policy "Players can view their own scores"
on public.scores
using ((select auth.uid()) = user_id);

alter policy "Users can insert their own scores"
on public.scores
with check ((select auth.uid()) = user_id);

alter policy "scores_read_all"
on public.scores
using ((select auth.uid()) is not null);

alter policy "scores_self_insert"
on public.scores
with check ((select auth.uid()) = user_id);

alter policy "scores_self_update"
on public.scores
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

alter policy "questions_admin_delete"
on public.questions
using (((select auth.jwt()) ->> 'user_role') = 'admin');

alter policy "questions_admin_insert"
on public.questions
with check (((select auth.jwt()) ->> 'user_role') = 'admin');

alter policy "questions_admin_update"
on public.questions
using (((select auth.jwt()) ->> 'user_role') = 'admin')
with check (((select auth.jwt()) ->> 'user_role') = 'admin');

alter policy "questions_read_all"
on public.questions
using ((select auth.uid()) is not null);

alter policy "matches_host_select"
on public.matches
using (((host_id is not null) and ((host_id)::text = (select auth.uid())::text)));

alter policy "matches_guest_select"
on public.matches
using (((guest_id is not null) and ((guest_id)::text = (select auth.uid())::text)));

alter policy "matches_insert_by_participant"
on public.matches
with check (
  (((host_id is not null) and ((host_id)::text = (select auth.uid())::text))
    or ((guest_id is not null) and ((guest_id)::text = (select auth.uid())::text)))
);

alter policy "matches_waiting_select"
on public.matches
using (((select auth.uid()) is not null) and (status = 'waiting'::text));

alter policy "matches_participant_select"
on public.matches
using (((select auth.uid()) = host_id) or ((select auth.uid()) = guest_id));

alter policy "matches_host_insert"
on public.matches
with check ((select auth.uid()) = host_id);

alter policy "matches_host_update"
on public.matches
using ((select auth.uid()) = host_id)
with check ((select auth.uid()) = host_id);

alter policy "matches_guest_join"
on public.matches
using (
  ((status = 'waiting'::text) and (guest_id is null) and ((select auth.uid()) is not null))
)
with check ((guest_id = (select auth.uid())));

alter policy "matches_guest_update"
on public.matches
using ((select auth.uid()) = guest_id)
with check ((select auth.uid()) = guest_id);

alter policy "matches_host_delete"
on public.matches
using ((select auth.uid()) = host_id);

alter policy "users_self_select"
on public.users
using ((select auth.uid()) = id);

alter policy "users_self_insert"
on public.users
with check (((select auth.uid()) = id) and premium = false);

alter policy "users_self_update"
on public.users
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);
