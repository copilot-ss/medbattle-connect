create table if not exists public.client_logs (
  id uuid not null default extensions.uuid_generate_v4(),
  created_at timestamptz not null default timezone('utc'::text, now()),
  user_id uuid default auth.uid(),
  level text not null default 'error',
  message text not null,
  stack text,
  context jsonb,
  constraint client_logs_pkey primary key (id)
);

alter table public.client_logs enable row level security;

create index if not exists client_logs_created_at_idx on public.client_logs (created_at desc);
create index if not exists client_logs_user_id_idx on public.client_logs (user_id);

create policy "client_logs_insert"
  on public.client_logs
  as permissive
  for insert
  to anon, authenticated
  with check (true);
