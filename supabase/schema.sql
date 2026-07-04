-- BingeBox Supabase schema.
-- Run this in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- Safe to re-run (idempotent): tables use IF NOT EXISTS, policies are dropped first.

-- ---------------------------------------------------------------------------
-- Profiles (one row per auth user)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by owner" on public.profiles;
create policy "Profiles are viewable by owner"
  on public.profiles for select using (auth.uid() = id);

drop policy if exists "Profiles are updatable by owner" on public.profiles;
create policy "Profiles are updatable by owner"
  on public.profiles for update using (auth.uid() = id);

drop policy if exists "Profiles are insertable by owner" on public.profiles;
create policy "Profiles are insertable by owner"
  on public.profiles for insert with check (auth.uid() = id);

-- Auto-create a profile when a user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Watchlist
-- ---------------------------------------------------------------------------
create table if not exists public.watchlist (
  user_id uuid not null references auth.users (id) on delete cascade,
  media_id integer not null,
  media_type text not null check (media_type in ('movie', 'tv')),
  title text not null,
  poster_path text,
  backdrop_path text,
  vote_average numeric,
  release_date text,
  created_at timestamptz not null default now(),
  primary key (user_id, media_id)
);

alter table public.watchlist enable row level security;
drop policy if exists "Watchlist is owned" on public.watchlist;
create policy "Watchlist is owned" on public.watchlist
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Continue watching
-- ---------------------------------------------------------------------------
create table if not exists public.continue_watching (
  user_id uuid not null references auth.users (id) on delete cascade,
  media_id integer not null,
  media_type text not null check (media_type in ('movie', 'tv')),
  title text not null,
  poster_path text,
  backdrop_path text,
  vote_average numeric,
  release_date text,
  current_time_seconds numeric not null default 0,
  duration_seconds numeric not null default 0,
  progress numeric not null default 0,
  season integer,
  episode integer,
  updated_at timestamptz not null default now(),
  primary key (user_id, media_id)
);

alter table public.continue_watching enable row level security;
drop policy if exists "Continue watching is owned" on public.continue_watching;
create policy "Continue watching is owned" on public.continue_watching
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Collections (user-named, e.g. "Horror night")
-- ---------------------------------------------------------------------------
create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

alter table public.collections enable row level security;
drop policy if exists "Collections are owned" on public.collections;
create policy "Collections are owned" on public.collections
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.collection_items (
  collection_id uuid not null references public.collections (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  media_id integer not null,
  media_type text not null check (media_type in ('movie', 'tv')),
  title text not null,
  poster_path text,
  vote_average numeric,
  release_date text,
  created_at timestamptz not null default now(),
  primary key (collection_id, media_id)
);

alter table public.collection_items enable row level security;
drop policy if exists "Collection items are owned" on public.collection_items;
create policy "Collection items are owned" on public.collection_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Subscriptions (one row per user; mirrors a Razorpay recurring subscription)
-- ---------------------------------------------------------------------------
-- The app only reads this table. All writes happen server-side from the
-- Razorpay Edge Functions (service-role key), which bypass RLS — so users get
-- a read-only "owner" policy and cannot forge their own subscription status.
create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  razorpay_subscription_id text,
  plan_id text,
  status text not null default 'created'
    check (status in (
      'created', 'authenticated', 'active', 'pending',
      'halted', 'cancelled', 'completed', 'expired'
    )),
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;
drop policy if exists "Subscriptions are viewable by owner" on public.subscriptions;
create policy "Subscriptions are viewable by owner"
  on public.subscriptions for select using (auth.uid() = user_id);
