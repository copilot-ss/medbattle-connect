create or replace function public.send_lobby_invite(p_match_id uuid, p_recipient_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_normalized_code text := public.normalize_friend_code(p_recipient_code);
  v_recipient_id uuid;
  v_match_row public.matches;
  v_invite_id uuid;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;
  if p_match_id is null then
    raise exception 'match id missing';
  end if;

  select *
  into v_match_row
  from public.matches m
  where m.id = p_match_id;

  if v_match_row.id is null then
    raise exception 'match not found';
  end if;
  if v_match_row.status <> 'waiting' then
    raise exception 'match not open';
  end if;
  if v_match_row.host_id <> v_user_id and v_match_row.guest_id <> v_user_id then
    raise exception 'not a match participant';
  end if;

  if v_normalized_code is null or length(v_normalized_code) = 0 then
    raise exception 'Bitte gültigen Code angeben.';
  end if;

  select u.id
  into v_recipient_id
  from public.users u
  where public.derive_friend_code(u.id) = v_normalized_code
  limit 1;

  if v_recipient_id is null then
    raise exception 'Empfänger nicht gefunden.';
  end if;
  if v_recipient_id = v_user_id then
    raise exception 'cannot invite yourself';
  end if;

  insert into public.lobby_invites(match_id, sender_id, recipient_id, status)
  values (p_match_id, v_user_id, v_recipient_id, 'pending')
  on conflict (match_id, recipient_id) do update
    set status = 'pending',
        sender_id = excluded.sender_id,
        created_at = timezone('utc', now()),
        responded_at = null
  returning public.lobby_invites.id into v_invite_id;

  return v_invite_id;
end;
$$;

grant execute on function public.send_lobby_invite(uuid, text) to authenticated;
