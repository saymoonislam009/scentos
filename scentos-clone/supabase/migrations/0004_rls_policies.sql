alter table public.profiles enable row level security;
create policy "profiles public read" on public.profiles for select using(true);
create policy "users update own profile" on public.profiles for update using(auth.uid()=id);

alter table public.brands enable row level security;
create policy "brands public read" on public.brands for select using(true);
alter table public.notes enable row level security;
create policy "notes public read" on public.notes for select using(true);
alter table public.accords enable row level security;
create policy "accords public read" on public.accords for select using(true);
alter table public.fragrances enable row level security;
create policy "fragrances public read" on public.fragrances for select using(true);
alter table public.fragrance_notes enable row level security;
create policy "fragrance_notes public read" on public.fragrance_notes for select using(true);
alter table public.fragrance_accords enable row level security;
create policy "fragrance_accords public read" on public.fragrance_accords for select using(true);
alter table public.dna_scores enable row level security;
create policy "dna_scores public read" on public.dna_scores for select using(true);
alter table public.price_points enable row level security;
create policy "price_points public read" on public.price_points for select using(true);

alter table public.reviews enable row level security;
create policy "reviews public read" on public.reviews for select using(true);
create policy "users write reviews" on public.reviews for insert with check(auth.uid()=user_id);
create policy "users update reviews" on public.reviews for update using(auth.uid()=user_id);
create policy "users delete reviews" on public.reviews for delete using(auth.uid()=user_id);

alter table public.collection_items enable row level security;
create policy "own collection only" on public.collection_items for select using(auth.uid()=user_id);
create policy "add to own collection" on public.collection_items for insert with check(auth.uid()=user_id);
create policy "update own collection" on public.collection_items for update using(auth.uid()=user_id);
create policy "delete own collection" on public.collection_items for delete using(auth.uid()=user_id);

alter table public.decant_listings enable row level security;
create policy "listings public read" on public.decant_listings for select using(true);
create policy "sellers create listing" on public.decant_listings for insert with check(auth.uid()=seller_id);
create policy "sellers update listing" on public.decant_listings for update using(auth.uid()=seller_id);
create policy "sellers delete listing" on public.decant_listings for delete using(auth.uid()=seller_id);

alter table public.orders enable row level security;
create policy "buyer or seller sees order" on public.orders for select using(auth.uid()=buyer_id or auth.uid()=seller_id);

alter table public.posts enable row level security;
create policy "posts public read" on public.posts for select using(true);
create policy "post as self" on public.posts for insert with check(auth.uid()=user_id);
create policy "edit own post" on public.posts for update using(auth.uid()=user_id);
create policy "delete own post" on public.posts for delete using(auth.uid()=user_id);

alter table public.likes enable row level security;
create policy "likes public read" on public.likes for select using(true);
create policy "like as self" on public.likes for insert with check(auth.uid()=user_id);
create policy "unlike as self" on public.likes for delete using(auth.uid()=user_id);

alter table public.comments enable row level security;
create policy "comments public read" on public.comments for select using(true);
create policy "comment as self" on public.comments for insert with check(auth.uid()=user_id);
create policy "edit own comment" on public.comments for update using(auth.uid()=user_id);
create policy "delete own comment" on public.comments for delete using(auth.uid()=user_id);

alter table public.advisor_submissions enable row level security;
create policy "own advisor history" on public.advisor_submissions for select using(auth.uid()=user_id);

alter table public.chat_sessions enable row level security;
create policy "own chat sessions" on public.chat_sessions for select using(auth.uid()=user_id);

alter table public.chat_messages enable row level security;
create policy "own chat messages" on public.chat_messages for select using(exists(select 1 from public.chat_sessions s where s.id=chat_messages.session_id and s.user_id=auth.uid()));

alter table public.layering_suggestions enable row level security;
create policy "own layering suggestions" on public.layering_suggestions for select using(auth.uid()=user_id);

alter table public.partial_bottle_listings enable row level security;
create policy "partial listings public read" on public.partial_bottle_listings for select using(true);
create policy "sellers create partial listing" on public.partial_bottle_listings for insert with check(auth.uid()=seller_id);
create policy "sellers update partial listing" on public.partial_bottle_listings for update using(auth.uid()=seller_id);
create policy "sellers delete partial listing" on public.partial_bottle_listings for delete using(auth.uid()=seller_id);

alter table public.partial_listing_inquiries enable row level security;
create policy "buyer or seller sees inquiry" on public.partial_listing_inquiries for select using(auth.uid()=buyer_id or auth.uid() in(select seller_id from public.partial_bottle_listings where id=listing_id));
create policy "signed-in users can inquire" on public.partial_listing_inquiries for insert with check(auth.uid()=buyer_id);
create policy "sellers can update inquiry" on public.partial_listing_inquiries for update using(auth.uid() in(select seller_id from public.partial_bottle_listings where id=listing_id));

alter table public.reports enable row level security;
create policy "own filed reports" on public.reports for select using(auth.uid()=reporter_id);
create policy "file a report" on public.reports for insert with check(auth.uid()=reporter_id);
