alter policy "lobby_invites_select_participant"
on public.lobby_invites
using (
  (sender_id = (select auth.uid()))
  or (recipient_id = (select auth.uid()))
);

alter policy "lobby_invites_insert_sender"
on public.lobby_invites
with check (sender_id = (select auth.uid()));

alter policy "lobby_invites_update_participant"
on public.lobby_invites
using (
  (sender_id = (select auth.uid()))
  or (recipient_id = (select auth.uid()))
)
with check (
  (sender_id = (select auth.uid()))
  or (recipient_id = (select auth.uid()))
);
