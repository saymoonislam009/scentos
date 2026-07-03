-- ScentOS — core schema
-- Run via `supabase db push` or paste into the Supabase SQL editor in order.

create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "vector";     -- pgvector, powers the Fragrance Genome
create extension if not exists "pg_trgm";    -- trigram fuzzy search for the catalog

-- ───────────────────────── Identity ─────────────────────────
-- Supabase Auth owns auth.users; this mirrors the public-facing fields into
-- a table our own foreign keys and RLS policies can reference directly.

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  name text,
  avatar_url text,
  country text,
  bio text,
  created_at timestamptz not null default now()
);

create table public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (follower_id, following_id),
  check (follower_id <> following_id)
);

-- ───────────────────────── Fragrance Catalog ─────────────────────────

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  country text,
  tier text, -- niche | designer | indie | clone-house
  logo_url text
);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  name text unique not null
);

create table public.accords (
  id uuid primary key default gen_random_uuid(),
  name text unique not null
);

create table public.fragrances (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  brand_id uuid not null references public.brands(id),
  release_year int,
  concentration text,
  description text,
  hero_image_url text,
  longevity_hrs numeric,
  projection text, -- intimate | moderate | strong | beast-mode
  seasons text[] not null default '{}',
  occasions text[] not null default '{}',
  price_tier_usd int,
  discontinued boolean not null default false,
  -- OpenAI text-embedding-3-small output — powers the Genome similarity
  -- engine directly in Postgres instead of a separate vector DB.
  embedding vector(1536),
  created_at timestamptz not null default now()
);

create index fragrances_brand_idx on public.fragrances(brand_id);
create index fragrances_name_trgm_idx on public.fragrances using gin (name gin_trgm_ops);
-- ivfflat needs an analyzed table to pick good list counts; fine to add once
-- there's real catalog volume. HNSW works well from the start:
create index fragrances_embedding_idx on public.fragrances using hnsw (embedding vector_cosine_ops);

create table public.fragrance_notes (
  fragrance_id uuid not null references public.fragrances(id) on delete cascade,
  note_id uuid not null references public.notes(id) on delete cascade,
  position text not null, -- top | mid | base
  primary key (fragrance_id, note_id)
);

create table public.fragrance_accords (
  fragrance_id uuid not null references public.fragrances(id) on delete cascade,
  accord_id uuid not null references public.accords(id) on delete cascade,
  strength numeric not null default 1,
  primary key (fragrance_id, accord_id)
);

create table public.dna_scores (
  id uuid primary key default gen_random_uuid(),
  fragrance_id uuid not null unique references public.fragrances(id) on delete cascade,
  sweetness numeric not null,
  freshness numeric not null,
  masculine_feminine numeric not null,
  projection numeric not null,
  longevity numeric not null,
  versatility numeric not null,
  sample_size int not null default 0
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  fragrance_id uuid not null references public.fragrances(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  body text,
  longevity_hrs numeric,
  projection text,
  created_at timestamptz not null default now()
);

create index reviews_fragrance_idx on public.reviews(fragrance_id);

-- ───────────────────────── Collection Manager ─────────────────────────

create table public.collection_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  fragrance_id uuid not null references public.fragrances(id) on delete cascade,
  type text not null check (type in ('bottle', 'decant', 'wishlist', 'empty')),
  bottle_size_ml int,
  ml_remaining numeric,
  purchase_price numeric,
  purchased_at timestamptz,
  created_at timestamptz not null default now()
);

create index collection_items_user_idx on public.collection_items(user_id);

-- ───────────────────────── Decant Marketplace ─────────────────────────

create table public.decant_listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  fragrance_id uuid not null references public.fragrances(id) on delete cascade,
  ml_amount numeric not null,
  price numeric not null,
  currency text not null default 'USD',
  condition text not null, -- new | used-decant | tester
  status text not null default 'active', -- active | sold | removed
  photos text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.decant_listings(id),
  buyer_id uuid not null references public.profiles(id),
  seller_id uuid not null references public.profiles(id),
  amount numeric not null,
  -- pending -> escrow-held -> shipped -> delivered -> released
  -- (disputed/refunded are exits available any time before release)
  status text not null default 'pending',
  tracking_number text,
  escrow_release_at timestamptz,
  created_at timestamptz not null default now()
);

-- ───────────────────────── Price Intelligence ─────────────────────────

create table public.price_points (
  id uuid primary key default gen_random_uuid(),
  fragrance_id uuid not null references public.fragrances(id) on delete cascade,
  retailer text not null,
  price numeric not null,
  currency text not null default 'USD',
  url text not null,
  in_stock boolean not null default true,
  captured_at timestamptz not null default now()
);

create index price_points_fragrance_idx on public.price_points(fragrance_id, captured_at);

create table public.price_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  fragrance_id uuid not null references public.fragrances(id) on delete cascade,
  target_price numeric not null,
  triggered_at timestamptz,
  created_at timestamptz not null default now()
);

-- ───────────────────────── Social Platform ─────────────────────────

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null, -- sotd | collection-photo
  fragrance_id uuid references public.fragrances(id),
  image_url text,
  caption text,
  created_at timestamptz not null default now()
);

create table public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, post_id)
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

-- ───────────────────────── AI Advisor / ScentGPT / Layering ─────────────────────────
-- These are only ever written by server-side route handlers (using the
-- service role key), since they're populated mid-AI-call — see RLS policy
-- file for why their client-facing policies are read-only.

create table public.advisor_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  inputs jsonb not null,
  result_json jsonb not null,
  created_at timestamptz not null default now()
);

create table public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  title text,
  created_at timestamptz not null default now()
);

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.chat_sessions(id) on delete cascade,
  role text not null, -- user | assistant
  content text not null,
  created_at timestamptz not null default now()
);

create table public.layering_suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  fragrance_ids uuid[] not null,
  combination jsonb not null,
  created_at timestamptz not null default now()
);
