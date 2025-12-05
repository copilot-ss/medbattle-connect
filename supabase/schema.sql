-- Supabase schema for MedBattle
-- Generated manually to align with the mobile app expectations.

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Tables
create table if not exists public.users (
  id uuid primary key references auth.users on delete cascade,
  email text not null,
  username text not null,
  premium boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint users_username_unique unique (username)
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  correct_answer text not null,
  options jsonb not null default '[]'::jsonb,
  category text not null,
  difficulty text not null default 'mittel',
  slug text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint questions_slug_unique unique (slug)
);

create table if not exists public.scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  points integer not null default 0,
  difficulty text not null default 'mittel',
  duration_seconds integer,
  created_at timestamptz not null default now()
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  code text unique,
  host_id uuid references public.users(id) on delete set null,
  guest_id uuid references public.users(id) on delete set null,
  difficulty text not null default 'mittel',
  question_limit integer not null default 5,
  question_ids text[] not null default array[]::text[],
  questions jsonb not null default '[]'::jsonb,
  state jsonb not null default '{}'::jsonb,
  status text not null default 'waiting',
  created_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.friends (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id) on delete cascade,
  friend_code text not null,
  created_at timestamptz not null default now(),
  constraint friends_owner_code_unique unique (owner_id, friend_code)
);

-- Indexes
create index if not exists idx_friends_friend_code on public.friends (friend_code);
create index if not exists idx_matches_status on public.matches (status);
create index if not exists idx_scores_user_id_created_at on public.scores (user_id, created_at desc);

-- Row Level Security
alter table public.users enable row level security;
alter table public.questions enable row level security;
alter table public.scores enable row level security;
alter table public.matches enable row level security;
alter table public.friends enable row level security;

-- Policies: users
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'users' and policyname = 'Users select'
  ) then
    create policy "Users select" on public.users
      for select
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'users' and policyname = 'Users insert self'
  ) then
    create policy "Users insert self" on public.users
      for insert
      with check (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'users' and policyname = 'Users update self'
  ) then
    create policy "Users update self" on public.users
      for update
      using (auth.uid() = id)
      with check (auth.uid() = id);
  end if;
end $$;

-- Policies: questions
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'questions' and policyname = 'Questions read all'
  ) then
    create policy "Questions read all" on public.questions
      for select using (true);
  end if;
end $$;

-- Policies: scores
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'scores' and policyname = 'Scores select'
  ) then
    create policy "Scores select" on public.scores
      for select using (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'scores' and policyname = 'Scores insert self'
  ) then
    create policy "Scores insert self" on public.scores
      for insert
      with check (auth.uid() = user_id);
  end if;
end $$;

-- Policies: matches
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'matches' and policyname = 'Matches select'
  ) then
    create policy "Matches select" on public.matches
      for select using (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'matches' and policyname = 'Matches insert host'
  ) then
    create policy "Matches insert host" on public.matches
      for insert
      with check (auth.uid() = host_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'matches' and policyname = 'Matches update players'
  ) then
    create policy "Matches update players" on public.matches
      for update
      using (auth.uid() = host_id or auth.uid() = guest_id)
      with check (auth.uid() = host_id or auth.uid() = guest_id);
  end if;
end $$;

-- Policies: friends
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'friends' and policyname = 'Friends select'
  ) then
    create policy "Friends select" on public.friends
      for select using (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'friends' and policyname = 'Friends insert owner'
  ) then
    create policy "Friends insert owner" on public.friends
      for insert
      with check (auth.uid() = owner_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'friends' and policyname = 'Friends delete owner or code'
  ) then
    create policy "Friends delete owner or code" on public.friends
      for delete
      using (
        auth.uid() = owner_id
        or friend_code = upper(lpad(right(replace(auth.uid()::text, '-', ''), 8), 8, '0'))
      );
  end if;
end $$;

-- Update trigger for matches.updated_at
create or replace function public.touch_matches_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_matches_updated_at on public.matches;
create trigger trg_matches_updated_at
before update on public.matches
for each row
execute procedure public.touch_matches_updated_at();
