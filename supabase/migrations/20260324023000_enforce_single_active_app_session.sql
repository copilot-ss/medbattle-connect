alter table public.users
  add column if not exists active_session_token text,
  add column if not exists active_session_claimed_at timestamptz;

create or replace function public.claim_active_session(
  p_session_token text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_session_token text := nullif(btrim(coalesce(p_session_token, '')), '');
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  if v_session_token is null then
    raise exception 'invalid session token';
  end if;

  update public.users
  set
    active_session_token = v_session_token,
    active_session_claimed_at = timezone('utc', now())
  where id = v_user_id;

  return found;
end;
$$;

create or replace function public.is_active_session(
  p_session_token text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_session_token text := nullif(btrim(coalesce(p_session_token, '')), '');
  v_is_active boolean := false;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  if v_session_token is null then
    return false;
  end if;

  select coalesce(u.active_session_token = v_session_token, false)
  into v_is_active
  from public.users u
  where u.id = v_user_id
  limit 1;

  return coalesce(v_is_active, false);
end;
$$;

create or replace function public.release_active_session(
  p_session_token text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_session_token text := nullif(btrim(coalesce(p_session_token, '')), '');
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  if v_session_token is null then
    return false;
  end if;

  update public.users
  set
    active_session_token = null,
    active_session_claimed_at = timezone('utc', now())
  where id = v_user_id
    and active_session_token = v_session_token;

  return found;
end;
$$;

grant execute on function public.claim_active_session(text) to authenticated;
grant execute on function public.is_active_session(text) to authenticated;
grant execute on function public.release_active_session(text) to authenticated;
