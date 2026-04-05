create or replace function public.close_waiting_matches(
  p_include_all boolean default false
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_count integer;
begin
  update public.matches
  set status = 'cancelled',
      finished_at = now(),
      updated_at = now()
  where status = 'waiting'
    and (
      p_include_all
      or coalesce(updated_at, created_at) <= now() - interval '2 minutes'
    );

  get diagnostics updated_count = row_count;
  return updated_count;
end;
$$;

grant execute on function public.close_waiting_matches(boolean) to authenticated;
