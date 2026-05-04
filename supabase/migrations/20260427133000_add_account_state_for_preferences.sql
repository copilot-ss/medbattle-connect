alter table public.users
  add column if not exists account_state jsonb not null default '{}'::jsonb;

create or replace function public.merge_user_account_state(
  p_user_id uuid,
  p_state jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  next_state jsonb;
begin
  if p_user_id is null then
    raise exception 'missing user id';
  end if;

  if auth.uid() <> p_user_id then
    raise exception 'not authorized';
  end if;

  update public.users
  set account_state = coalesce(account_state, '{}'::jsonb) || coalesce(p_state, '{}'::jsonb)
  where id = p_user_id
  returning account_state into next_state;

  if next_state is null then
    raise exception 'user not found';
  end if;

  return next_state;
end;
$$;

revoke all on function public.merge_user_account_state(uuid, jsonb) from public;
grant execute on function public.merge_user_account_state(uuid, jsonb) to authenticated;
