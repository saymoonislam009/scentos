-- ScentOS — Row Level Security
-- Every table below has RLS enabled. Policy shape generally follows:
--   - catalog tables (brands/fragrances/notes/accords/...): public read,
--     writes only via the service-role key (admin panel, embedding backfill)
--   - user-owned tables: select/insert/update/delete scoped to auth.uid()
--   - marketplace tables: public read of active listings, scoped writes
--   - AI tables (advisor/chat/layering): scoped read only — writes happen
--     server-side with the service role key mid-AI-call

-- ───────────────────────── Profiles & follows ─────────────────────────

alter table public.profiles enable row level security;

create policy "profiles are publicly readable"
  on public.profiles for select using (true);

create policy "users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

alter table public.follows enable row level security;

create policy "follows are publicly readable"
  on public.follows for select using (true);

create policy "users can follow as themselves"
  on public.follows for insert with check (auth.uid() = follower_id);

create policy "users can unfollow as themselves"
  on public.follows for delete using (auth.uid() = follower_id);

-- ───────────────────────── Catalog (read-only to clients) ─────────────────────────

alter table public.brands enable row level security;
create policy "brands are publicly readable" on public.brands for select using (true);

alter table public.notes enable row level security;
create policy "notes are publicly readable" on public.notes for select using (true);

alter table public.accords enable row level security;
create policy "accords are publicly readable" on public.accords for select using (true);

alter table public.fragrances enable row level security;
create policy "fragrances are publicly readable" on public.fragrances for select using (true);

alter table public.fragrance_notes enable row level security;
create policy "fragrance_notes are publicly readable" on public.fragrance_notes for select using (true);

alter table public.fragrance_accords enable row level security;
create policy "fragrance_accords are publicly readable" on public.fragrance_accords for select using (true);

alter table public.dna_scores enable row level security;
create policy "dna_scores are publicly readable" on public.dna_scores for select using (true);

alter table public.price_points enable row level security;
create policy "price_points are publicly readable" on public.price_points for select using (true);

-- Note: no insert/update/delete policies exist for the catalog tables above.
-- RLS denies by default with no matching policy, so client writes are
-- impossible regardless of role — only the service-role key (admin panel,
-- backfill scripts) can write to them.

-- ───────────────────────── Reviews ─────────────────────────

alter table public.reviews enable row level security;

create policy "reviews are publicly readable" on public.reviews for select using (true);

create policy "users can write their own reviews"
  on public.reviews for insert with check (auth.uid() = user_id);

create policy "users can edit their own reviews"
  on public.reviews for update using (auth.uid() = user_id);

create policy "users can delete their own reviews"
  on public.reviews for delete using (auth.uid() = user_id);

-- ───────────────────────── Collection Manager (private) ─────────────────────────

alter table public.collection_items enable row level security;

create policy "users see only their own collection"
  on public.collection_items for select using (auth.uid() = user_id);

create policy "users add to their own collection"
  on public.collection_items for insert with check (auth.uid() = user_id);

create policy "users update their own collection items"
  on public.collection_items for update using (auth.uid() = user_id);

create policy "users delete their own collection items"
  on public.collection_items for delete using (auth.uid() = user_id);

-- ───────────────────────── Decant Marketplace ─────────────────────────

alter table public.decant_listings enable row level security;

create policy "decant listings are publicly readable"
  on public.decant_listings for select using (true);

create policy "sellers create their own listings"
  on public.decant_listings for insert with check (auth.uid() = seller_id);

create policy "sellers update their own listings"
  on public.decant_listings for update using (auth.uid() = seller_id);

create policy "sellers delete their own listings"
  on public.decant_listings for delete using (auth.uid() = seller_id);

alter table public.orders enable row level security;

create policy "buyer or seller can see their order"
  on public.orders for select using (auth.uid() = buyer_id or auth.uid() = seller_id);

-- No insert/update policy on orders: every status transition goes through
-- the SECURITY DEFINER functions in 0003_functions.sql, which check
-- ownership internally. This is the fix for the "anyone could dispute any
-- order" class of bug — there's no raw UPDATE path left for the client.

-- ───────────────────────── Price Intelligence ─────────────────────────

alter table public.price_alerts enable row level security;

create policy "users manage their own price alerts"
  on public.price_alerts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ───────────────────────── Social Platform ─────────────────────────

alter table public.posts enable row level security;

create policy "posts are publicly readable" on public.posts for select using (true);

create policy "users create their own posts"
  on public.posts for insert with check (auth.uid() = user_id);

create policy "users edit their own posts"
  on public.posts for update using (auth.uid() = user_id);

create policy "users delete their own posts"
  on public.posts for delete using (auth.uid() = user_id);

alter table public.likes enable row level security;

create policy "likes are publicly readable" on public.likes for select using (true);

create policy "users like as themselves"
  on public.likes for insert with check (auth.uid() = user_id);

create policy "users unlike as themselves"
  on public.likes for delete using (auth.uid() = user_id);

alter table public.comments enable row level security;

create policy "comments are publicly readable" on public.comments for select using (true);

create policy "users comment as themselves"
  on public.comments for insert with check (auth.uid() = user_id);

create policy "users edit their own comments"
  on public.comments for update using (auth.uid() = user_id);

create policy "users delete their own comments"
  on public.comments for delete using (auth.uid() = user_id);

-- ───────────────────────── AI tables (server-write only) ─────────────────────────

alter table public.advisor_submissions enable row level security;
create policy "users see their own advisor history"
  on public.advisor_submissions for select using (auth.uid() = user_id);

alter table public.chat_sessions enable row level security;
create policy "users see their own chat sessions"
  on public.chat_sessions for select using (auth.uid() = user_id);

alter table public.chat_messages enable row level security;
create policy "users see messages in their own sessions"
  on public.chat_messages for select using (
    exists (
      select 1 from public.chat_sessions s
      where s.id = chat_messages.session_id and s.user_id = auth.uid()
    )
  );

alter table public.layering_suggestions enable row level security;
create policy "users see their own layering suggestions"
  on public.layering_suggestions for select using (auth.uid() = user_id);

-- No client insert/update policies on any of the four tables above — the
-- Advisor, ScentGPT, and Layering route handlers write these with the
-- service-role key mid-AI-call (see app/api/advisor, /scentgpt, /layering).

-- ───────────────────────── Partial Bottle Marketplace ─────────────────────────

alter table public.partial_bottle_listings enable row level security;

create policy "partial listings are publicly readable"
  on public.partial_bottle_listings for select using (true);

create policy "sellers create their own partial listings"
  on public.partial_bottle_listings for insert with check (auth.uid() = seller_id);

create policy "sellers update their own partial listings"
  on public.partial_bottle_listings for update using (auth.uid() = seller_id);

create policy "sellers delete their own partial listings"
  on public.partial_bottle_listings for delete using (auth.uid() = seller_id);

alter table public.partial_listing_inquiries enable row level security;

-- This is the actual "have to create an account to buy/order" enforcement:
-- there's no anon-accessible insert policy, and RLS denies by default, so
-- an unauthenticated request can't create an inquiry at all.
create policy "buyer or seller can see an inquiry"
  on public.partial_listing_inquiries for select using (
    auth.uid() = buyer_id
    or auth.uid() in (
      select seller_id from public.partial_bottle_listings where id = listing_id
    )
  );

create policy "signed-in users can request to buy"
  on public.partial_listing_inquiries for insert with check (auth.uid() = buyer_id);

create policy "sellers can update inquiry status on their listings"
  on public.partial_listing_inquiries for update using (
    auth.uid() in (
      select seller_id from public.partial_bottle_listings where id = listing_id
    )
  );

-- ───────────────────────── Reports (trust & safety) ─────────────────────────

alter table public.reports enable row level security;

-- Deliberately no public select policy: reports are only visible to the
-- person who filed them (so they can see their own report history) and to
-- admin via the service-role key in the admin dashboard. Nobody can browse
-- reports made against other people.
create policy "users see their own filed reports"
  on public.reports for select using (auth.uid() = reporter_id);

create policy "signed-in users can file a report"
  on public.reports for insert with check (auth.uid() = reporter_id);
