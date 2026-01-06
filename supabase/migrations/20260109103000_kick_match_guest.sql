create or replace function public.kick_match_guest(
  p_match_id uuid
)
returns public.matches
language plpgsql
security definer
set search_path = public
as $$
declare
  user_id uuid := auth.uid();
  match_row public.matches;
  next_state jsonb;
begin
  if user_id is null then
    raise exception 'not authenticated';
  end if;

  select *
  into match_row
  from public.matches
  where id = p_match_id
  for update;

  if not found then
    raise exception 'Match nicht gefunden.';
  end if;

  if match_row.host_id <> user_id then
    raise exception 'Nur der Host kann Spieler entfernen.';
  end if;

  if match_row.status <> 'waiting' then
    raise exception 'Die Lobby laeuft bereits.';
  end if;

  if match_row.guest_id is null then
    return match_row;
  end if;

  next_state := coalesce(match_row.state, '{}'::jsonb);
  next_state := jsonb_set(
    next_state,
    '{guest}',
    jsonb_build_object(
      'userId', null,
      'username', null,
      'index', 0,
      'score', 0,
      'finished', false,
      'answers', jsonb_build_array(),
      'ready', false
    ),
    true
  );

  update public.matches
  set guest_id = null,
      state = next_state,
      updated_at = now()
  where id = match_row.id
  returning * into match_row;

  return match_row;
end;
$$;

grant execute on function public.kick_match_guest(uuid) to authenticated;
