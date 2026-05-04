create or replace function public.join_match(p_code text)
returns public.matches
language plpgsql
security definer
set search_path = public
as $$
declare
  joining_user_id uuid := auth.uid();
  sanitized_code text := upper(trim(p_code));
  match_row public.matches;
  guest_username text;
  next_state jsonb;
  next_role text;
  candidate_role text;
  role_state jsonb;
begin
  if joining_user_id is null then
    raise exception 'not authenticated';
  end if;

  if sanitized_code is null or length(sanitized_code) = 0 then
    raise exception 'Match-Code fehlt.';
  end if;

  select *
  into match_row
  from public.matches
  where code = sanitized_code
  for update;

  if not found then
    raise exception 'Match nicht gefunden.';
  end if;

  if public.match_user_role(
    match_row.state,
    match_row.host_id,
    match_row.guest_id,
    joining_user_id
  ) is not null then
    return match_row;
  end if;

  if match_row.status <> 'waiting' then
    raise exception 'Dieses Match läuft bereits oder ist beendet.';
  end if;

  if public.match_participant_count(match_row.state, match_row.host_id, match_row.guest_id) >= 5 then
    raise exception 'Diese Lobby ist bereits voll.';
  end if;

  next_state := coalesce(match_row.state, '{}'::jsonb);

  for slot_index in 2..5 loop
    candidate_role := public.match_player_key_for_index(slot_index);
    role_state := coalesce(next_state -> candidate_role, '{}'::jsonb);
    if nullif(role_state->>'userId', '') is null
      and not (candidate_role = 'guest' and match_row.guest_id is not null)
    then
      next_role := candidate_role;
      exit;
    end if;
  end loop;

  if next_role is null then
    raise exception 'Diese Lobby ist bereits voll.';
  end if;

  select username into guest_username
  from public.users
  where id = joining_user_id;

  next_state := jsonb_set(
    next_state,
    array[next_role],
    public.match_reset_player_state(
      jsonb_build_object('userId', joining_user_id, 'username', guest_username),
      joining_user_id,
      guest_username
    ),
    true
  );

  update public.matches
  set guest_id = case
        when guest_id is null then joining_user_id
        else guest_id
      end,
      state = next_state,
      updated_at = now()
  where id = match_row.id
  returning * into match_row;

  return match_row;
end;
$$;

grant execute on function public.join_match(text) to authenticated;
