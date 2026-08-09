create table if not exists public.price_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  fragrance_id uuid not null references public.fragrances(id) on delete cascade,
  target_price numeric not null check(target_price >= 0),
  triggered boolean not null default false,
  triggered_at timestamptz,
  created_at timestamptz not null default now(),
  unique(user_id, fragrance_id)
);
alter table public.price_alerts enable row level security;
create policy "own alerts only" on public.price_alerts for select using(auth.uid() = user_id);
create policy "create own alert" on public.price_alerts for insert with check(auth.uid() = user_id);
create policy "delete own alert" on public.price_alerts for delete using(auth.uid() = user_id);

-- Recently viewed (local storage is fine too, but server-side is better for cross-device)
create table if not exists public.recently_viewed (
  user_id uuid not null references public.profiles(id) on delete cascade,
  fragrance_id uuid not null references public.fragrances(id) on delete cascade,
  viewed_at timestamptz not null default now(),
  primary key(user_id, fragrance_id)
);
alter table public.recently_viewed enable row level security;
create policy "own viewed" on public.recently_viewed for select using(auth.uid() = user_id);
create policy "insert own viewed" on public.recently_viewed for insert with check(auth.uid() = user_id);
create policy "update own viewed" on public.recently_viewed for update using(auth.uid() = user_id);

-- Index for performance
create index if not exists price_alerts_user_idx on public.price_alerts(user_id);
create index if not exists recently_viewed_user_idx on public.recently_viewed(user_id, viewed_at desc);
