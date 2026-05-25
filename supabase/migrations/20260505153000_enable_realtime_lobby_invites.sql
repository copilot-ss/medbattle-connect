do $$
begin
  if exists (
    select 1
    from pg_publication
    where pubname = 'supabase_realtime'
  )
  and not exists (
    select 1
    from pg_publication_rel pr
    join pg_publication p on p.oid = pr.prpubid
    where p.pubname = 'supabase_realtime'
      and pr.prrelid = 'public.lobby_invites'::regclass
  ) then
    alter publication supabase_realtime add table public.lobby_invites;
  end if;
end $$;
