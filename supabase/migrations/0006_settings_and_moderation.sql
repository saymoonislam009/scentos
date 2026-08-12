-- App-wide settings (API keys managed via admin UI instead of only env vars)
-- No RLS policies at all = default deny for anon/authenticated. Only the
-- service-role client (used server-side in admin API routes) can read/write.
create table if not exists public.app_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);
alter table public.app_settings enable row level security;
-- Intentionally no policies — service role bypasses RLS, everyone else is denied.

-- Moderation: give admin reports real teeth
alter table public.profiles add column if not exists is_suspended boolean not null default false;
alter table public.profiles add column if not exists suspended_reason text;
alter table public.profiles add column if not exists suspended_at timestamptz;

-- Enforce suspension at the database level (not just client-side) so a
-- suspended user cannot create new listings, decants, reviews, or posts
-- even if they bypass the UI.
create or replace function public.is_current_user_suspended() returns boolean
language sql security definer set search_path = public stable as $$
  select coalesce((select is_suspended from public.profiles where id = auth.uid()), false);
$$;

drop policy if exists "sellers create partial listing" on public.partial_bottle_listings;
create policy "sellers create partial listing" on public.partial_bottle_listings
  for insert with check (auth.uid() = seller_id and not public.is_current_user_suspended());

drop policy if exists "sellers create listing" on public.decant_listings;
create policy "sellers create listing" on public.decant_listings
  for insert with check (auth.uid() = seller_id and not public.is_current_user_suspended());

drop policy if exists "users write reviews" on public.reviews;
create policy "users write reviews" on public.reviews
  for insert with check (auth.uid() = user_id and not public.is_current_user_suspended());

drop policy if exists "post as self" on public.posts;
create policy "post as self" on public.posts
  for insert with check (auth.uid() = user_id and not public.is_current_user_suspended());

create index if not exists profiles_suspended_idx on public.profiles(is_suspended) where is_suspended = true;
