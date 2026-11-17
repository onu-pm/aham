-- Aham: database setup. Run once in Supabase → SQL Editor → New query → paste → Run.

-- One row per person holding their Aham data (habits, plans, lists, settings)
create table if not exists public.user_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- Row-level security: people can only ever read and write their own row
alter table public.user_state enable row level security;

drop policy if exists "read own state" on public.user_state;
create policy "read own state" on public.user_state
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "insert own state" on public.user_state;
create policy "insert own state" on public.user_state
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "update own state" on public.user_state;
create policy "update own state" on public.user_state
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- In-app "Delete account": removes the signed-in person's account; their data goes with it (on delete cascade)
create or replace function public.delete_account()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from auth.users where id = (select auth.uid());
$$;

revoke all on function public.delete_account() from public, anon;
grant execute on function public.delete_account() to authenticated;
