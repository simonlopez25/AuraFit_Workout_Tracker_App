-- AuraFit Pro: run this once in Supabase Dashboard > SQL Editor.
-- The anon/publishable key in the web app is safe for this setup; never use
-- a service_role or secret key in client-side files.

create table if not exists public.routines (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create index if not exists routines_user_updated_at_idx
  on public.routines (user_id, updated_at desc);

create table if not exists public.workout_logs (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  data jsonb not null,
  logged_at timestamptz not null default now()
);

create index if not exists workout_logs_user_logged_at_idx
  on public.workout_logs (user_id, logged_at desc);

alter table public.routines enable row level security;
alter table public.workout_logs enable row level security;

drop policy if exists "Users manage their routines" on public.routines;
create policy "Users manage their routines"
  on public.routines
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users manage their workout logs" on public.workout_logs;
create policy "Users manage their workout logs"
  on public.workout_logs
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
