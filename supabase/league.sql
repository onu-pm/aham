-- Aham: weekly league (friendly competition). Run once in Supabase → SQL Editor → New query → paste → Run.
-- Only people who choose "Join the league" in the app appear here, with their first name, avatar and this week's points.

create table if not exists public.league (
  user_id uuid primary key references auth.users (id) on delete cascade,
  name text not null default 'Grower',
  avatar text not null default '🌱',
  week text not null,
  xp integer not null default 0 check (xp >= 0 and xp < 100000),
  updated_at timestamptz not null default now()
);

alter table public.league enable row level security;

-- Signed-in people can see the league
drop policy if exists "league is visible to members" on public.league;
create policy "league is visible to members" on public.league
  for select to authenticated using (true);

-- Everyone can only add or change their own row
drop policy if exists "join league" on public.league;
create policy "join league" on public.league
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "update own league row" on public.league;
create policy "update own league row" on public.league
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "leave league" on public.league;
create policy "leave league" on public.league
  for delete to authenticated using ((select auth.uid()) = user_id);
