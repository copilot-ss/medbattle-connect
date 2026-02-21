create or replace function public.remove_friend(p_code text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  user_id uuid := auth.uid();
  normalized_code text := public.normalize_friend_code(p_code);
  deleted_count integer := 0;
begin
  if user_id is null then
    raise exception 'not authenticated';
  end if;

  if normalized_code is null or length(normalized_code) = 0 then
    raise exception 'Ungueltiger Freund.';
  end if;

  delete from public.friendships f
  where (f.user_id = user_id or f.friend_id = user_id)
    and public.normalize_friend_code(
      public.derive_friend_code(
        case
          when f.user_id = user_id then f.friend_id
          else f.user_id
        end
      )
    ) = normalized_code;

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

grant execute on function public.remove_friend(text) to authenticated;
