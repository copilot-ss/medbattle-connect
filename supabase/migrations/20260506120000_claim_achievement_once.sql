alter table public.users
  add column if not exists account_state jsonb not null default '{}'::jsonb;

create or replace function public.claim_user_achievement(
  p_user_id uuid,
  p_achievement_key text,
  p_reward_xp integer default 0,
  p_reward_coins integer default 0
)
returns table (
  claimed boolean,
  xp integer,
  coins integer,
  claimed_achievements jsonb
)
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_key text;
  reward_xp integer;
  reward_coins integer;
  current_state jsonb;
  current_claimed jsonb;
  already_claimed boolean;
  next_claimed jsonb;
begin
  if p_user_id is null or auth.uid() <> p_user_id then
    raise exception 'not authorized';
  end if;

  normalized_key := nullif(btrim(coalesce(p_achievement_key, '')), '');
  if normalized_key is null then
    raise exception 'missing achievement key';
  end if;

  reward_xp := greatest(coalesce(p_reward_xp, 0), 0);
  reward_coins := greatest(coalesce(p_reward_coins, 0), 0);

  select
    coalesce(u.account_state, '{}'::jsonb),
    case
      when jsonb_typeof(coalesce(u.account_state, '{}'::jsonb) -> 'claimedAchievements') = 'array'
        then coalesce(u.account_state, '{}'::jsonb) -> 'claimedAchievements'
      else '[]'::jsonb
    end
  into current_state, current_claimed
  from public.users u
  where u.id = p_user_id
  for update;

  if current_state is null then
    raise exception 'user not found';
  end if;

  select exists(
    select 1
    from jsonb_array_elements_text(current_claimed) as entry(value)
    where entry.value = normalized_key
  )
  into already_claimed;

  if already_claimed then
    return query
    select
      false,
      coalesce(u.xp, 0)::integer,
      coalesce(u.coins, 0)::integer,
      current_claimed
    from public.users u
    where u.id = p_user_id;
    return;
  end if;

  next_claimed := current_claimed || jsonb_build_array(normalized_key);

  return query
  update public.users u
  set
    xp = coalesce(u.xp, 0) + reward_xp,
    coins = coalesce(u.coins, 0) + reward_coins,
    account_state = jsonb_set(
      current_state || jsonb_build_object('updatedAt', timezone('utc', now())),
      '{claimedAchievements}',
      next_claimed,
      true
    )
  where u.id = p_user_id
  returning
    true,
    coalesce(u.xp, 0)::integer,
    coalesce(u.coins, 0)::integer,
    u.account_state -> 'claimedAchievements';
end;
$$;

revoke all on function public.claim_user_achievement(uuid, text, integer, integer) from public;
grant execute on function public.claim_user_achievement(uuid, text, integer, integer)
  to authenticated;
