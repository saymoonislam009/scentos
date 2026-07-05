-- ScentOS 0005 — performance index for seller notification queries
-- The notifications API filters by partial_bottle_listings.seller_id across
-- the join, so we need an index on both sides of that join path.

create index if not exists
  partial_inquiries_status_idx on public.partial_listing_inquiries(status);

-- Also add a composite index for the common read pattern:
-- "all pending inquiries on listings where seller_id = X"
create index if not exists
  partial_listings_seller_status_idx on public.partial_bottle_listings(seller_id, status);
