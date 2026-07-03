-- ScentOS — Partial Bottle Marketplace
-- A more casual listing type than decant_listings: sellers post a
-- partially-used bottle with condition details and their own contact info,
-- buyers arrange payment/handoff directly (online payment or face-to-face).
-- Visible to everyone, including signed-out visitors — buying/ordering and
-- listing both require an account.

create table public.partial_bottle_listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  -- Optional link to the catalog if the seller's bottle matches a known
  -- fragrance — not required, since sellers often won't bother searching
  -- the catalog for a single casual listing.
  fragrance_id uuid references public.fragrances(id),
  perfume_name text not null,
  brand_name text,
  days_used int check (days_used >= 0),
  percent_left int not null check (percent_left between 1 and 100),
  has_box boolean not null default false,
  price numeric not null check (price >= 0),
  currency text not null default 'BDT',
  payment_method text not null check (payment_method in ('online', 'face-to-face', 'both')),
  location text,
  contact_info text not null, -- phone/WhatsApp/etc — shown publicly, same as a classifieds post
  photos text[] not null default '{}',
  description text,
  status text not null default 'active', -- active | sold | removed
  created_at timestamptz not null default now()
);

create index partial_listings_seller_idx on public.partial_bottle_listings(seller_id);
create index partial_listings_status_idx on public.partial_bottle_listings(status);

-- A signed-in buyer's request to purchase — this is the "have to create an
-- account to buy/order" gate. Browsing the listing above needs no account;
-- creating a row here does.
create table public.partial_listing_inquiries (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.partial_bottle_listings(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  message text,
  status text not null default 'pending', -- pending | accepted | declined | completed
  created_at timestamptz not null default now()
);

create index partial_inquiries_listing_idx on public.partial_listing_inquiries(listing_id);
create index partial_inquiries_buyer_idx on public.partial_listing_inquiries(buyer_id);

-- Trust & safety: lets any signed-in visitor flag a listing or a seller.
-- This is also what makes "user-wise or post-wise" admin reporting real —
-- the admin dashboard groups these by reported_user_id or by listing_id.
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid references public.partial_bottle_listings(id) on delete cascade,
  reported_user_id uuid references public.profiles(id) on delete cascade,
  reason text not null,
  details text,
  status text not null default 'open', -- open | reviewed | resolved | dismissed
  created_at timestamptz not null default now(),
  check (listing_id is not null or reported_user_id is not null)
);

create index reports_listing_idx on public.reports(listing_id);
create index reports_user_idx on public.reports(reported_user_id);
create index reports_status_idx on public.reports(status);
