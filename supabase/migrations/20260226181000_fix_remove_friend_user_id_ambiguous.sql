create or replace function public.remove_friend(p_code text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_auth_user_id uuid := auth.uid();
  v_normalized_code text := public.normalize_friend_code(p_code);
  v_deleted_count integer := 0;
begin
  if v_auth_user_id is null then
    raise exception 'not authenticated';
  end if;

  if v_normalized_code is null or length(v_normalized_code) = 0 then
    raise exception 'Ungueltiger Freund.';
  end if;

  delete from public.friendships f
  where (f.user_id = v_auth_user_id or f.friend_id = v_auth_user_id)
    and public.normalize_friend_code(
      public.derive_friend_code(
        case
          when f.user_id = v_auth_user_id then f.friend_id
          else f.user_id
        end
      )
    ) = v_normalized_code;

  get diagnostics v_deleted_count = row_count;
  return v_deleted_count;
end;
$$;

grant execute on function public.remove_friend(text) to authenticated;
