create or replace function public.get_leaderboard(
  p_limit integer default 20
)
returns table (
  id uuid,
  user_id uuid,
  points integer,
  difficulty text,
  created_at timestamptz,
  username text
)
language sql
security definer
set search_path = public
as $$
  select
    s.id,
    s.user_id,
    s.points,
    s.difficulty,
    s.created_at,
    u.username
  from (
    select distinct on (user_id)
      id,
      user_id,
      points,
      difficulty,
      created_at
    from public.scores
    order by user_id, points desc, created_at asc
  ) s
  left join public.users u on u.id = s.user_id
  order by s.points desc, s.created_at asc
  limit greatest(1, least(coalesce(p_limit, 20), 100));
$$;

grant execute on function public.get_leaderboard(integer) to anon, authenticated;

create or replace function public.set_user_premium(
  p_user_id uuid,
  p_premium boolean
)
returns public.users
language plpgsql
security definer
set search_path = public
as $$
declare
  updated public.users;
  role_claim text;
begin
  role_claim := coalesce(auth.jwt() ->> 'user_role', '');

  if auth.role() not in ('service_role', 'supabase_admin') and role_claim <> 'admin' then
    raise exception 'not authorized';
  end if;

  update public.users
  set premium = coalesce(p_premium, false),
      updated_at = now()
  where id = p_user_id
  returning * into updated;

  if updated.id is null then
    raise exception 'user not found';
  end if;

  return updated;
end;
$$;

grant execute on function public.set_user_premium(uuid, boolean) to authenticated;

create or replace function public.backfill_premium_from_metadata()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_count integer;
  role_claim text;
begin
  role_claim := coalesce(auth.jwt() ->> 'user_role', '');

  if auth.role() not in ('service_role', 'supabase_admin') and role_claim <> 'admin' then
    raise exception 'not authorized';
  end if;

  update public.users u
  set premium = true,
      updated_at = now()
  from auth.users a
  where u.id = a.id
    and u.premium is distinct from true
    and lower(a.raw_user_meta_data->>'premium') = 'true';

  get diagnostics updated_count = row_count;

  return updated_count;
end;
$$;

grant execute on function public.backfill_premium_from_metadata() to authenticated;

drop policy if exists "Users can view/update their own profile" on public.users;
drop policy if exists "users_self_update" on public.users;
drop policy if exists "users_self_upsert" on public.users;

drop policy if exists "users_self_select" on public.users;
create policy "users_self_select"
  on public.users
  as permissive
  for select
  to authenticated
using ((auth.uid() = id));

create policy "users_self_insert"
  on public.users
  as permissive
  for insert
  to authenticated
with check ((auth.uid() = id) and premium = false);

create policy "users_self_update"
  on public.users
  as permissive
  for update
  to authenticated
using ((auth.uid() = id))
with check ((auth.uid() = id));

create or replace function public.prevent_premium_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  role_claim text;
begin
  if new.premium is distinct from old.premium then
    role_claim := coalesce(auth.jwt() ->> 'user_role', '');
    if auth.role() not in ('service_role', 'supabase_admin') and role_claim <> 'admin' then
      raise exception 'not authorized to change premium';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_users_prevent_premium on public.users;
create trigger trg_users_prevent_premium
before update of premium on public.users
for each row execute function public.prevent_premium_update();
