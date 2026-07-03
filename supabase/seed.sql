-- ScentOS — sample catalog data
-- Run after the migrations. User-generated tables (reviews, collection
-- items, partial bottle listings, etc.) all reference auth.users via
-- profiles, so they're created by actually using the app once you've
-- signed up — not seeded here.

insert into public.brands (id, name, country, tier) values
  ('11111111-1111-1111-1111-111111111111', 'Dior', 'France', 'designer'),
  ('22222222-2222-2222-2222-222222222222', 'Creed', 'France', 'niche'),
  ('33333333-3333-3333-3333-333333333333', 'Armaf', 'UAE', 'clone-house')
on conflict (name) do nothing;

insert into public.notes (id, name) values
  ('a1111111-1111-1111-1111-111111111111', 'Bergamot'),
  ('a2222222-2222-2222-2222-222222222222', 'Pink Pepper'),
  ('a3333333-3333-3333-3333-333333333333', 'Ambroxan'),
  ('a4444444-4444-4444-4444-444444444444', 'Pineapple'),
  ('a5555555-5555-5555-5555-555555555555', 'Birch'),
  ('a6666666-6666-6666-6666-666666666666', 'Jasmine')
on conflict (name) do nothing;

insert into public.accords (id, name) values
  ('b1111111-1111-1111-1111-111111111111', 'Fresh Spicy'),
  ('b2222222-2222-2222-2222-222222222222', 'Woody'),
  ('b3333333-3333-3333-3333-333333333333', 'Fruity')
on conflict (name) do nothing;

insert into public.fragrances
  (id, slug, name, brand_id, release_year, concentration, description, longevity_hrs, projection, seasons, occasions, price_tier_usd)
values
  (
    'c1111111-1111-1111-1111-111111111111', 'dior-sauvage-edt', 'Sauvage EDT',
    '11111111-1111-1111-1111-111111111111', 2015, 'EDT',
    'A radiant, peppery citrus opening over a clean ambroxan base — the modern office-to-evening signature scent.',
    7, 'strong', array['spring','summer','fall'], array['office','casual','date-night'], 95
  ),
  (
    'c2222222-2222-2222-2222-222222222222', 'creed-aventus', 'Aventus',
    '22222222-2222-2222-2222-222222222222', 2010, 'EDP',
    'Pineapple and birch over smoky ambroxan — the most-cloned fragrance of the last decade for a reason.',
    9, 'beast-mode', array['fall','winter','spring'], array['formal','date-night'], 375
  ),
  (
    'c3333333-3333-3333-3333-333333333333', 'armaf-club-de-nuit-intense', 'Club de Nuit Intense Man',
    '33333333-3333-3333-3333-333333333333', 2014, 'EDT',
    'The budget reference for Aventus-adjacent pineapple-and-birch, at a fraction of the price.',
    6, 'strong', array['fall','winter'], array['casual','date-night'], 35
  )
on conflict (slug) do nothing;

insert into public.fragrance_notes (fragrance_id, note_id, position) values
  ('c1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'top'),
  ('c1111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222', 'top'),
  ('c1111111-1111-1111-1111-111111111111', 'a3333333-3333-3333-3333-333333333333', 'base'),
  ('c2222222-2222-2222-2222-222222222222', 'a4444444-4444-4444-4444-444444444444', 'top'),
  ('c2222222-2222-2222-2222-222222222222', 'a5555555-5555-5555-5555-555555555555', 'mid'),
  ('c2222222-2222-2222-2222-222222222222', 'a3333333-3333-3333-3333-333333333333', 'base'),
  ('c3333333-3333-3333-3333-333333333333', 'a4444444-4444-4444-4444-444444444444', 'top'),
  ('c3333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 'base')
on conflict do nothing;

insert into public.fragrance_accords (fragrance_id, accord_id, strength) values
  ('c1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 0.9),
  ('c1111111-1111-1111-1111-111111111111', 'b2222222-2222-2222-2222-222222222222', 0.5),
  ('c2222222-2222-2222-2222-222222222222', 'b3333333-3333-3333-3333-333333333333', 0.8),
  ('c2222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 0.7),
  ('c3333333-3333-3333-3333-333333333333', 'b3333333-3333-3333-3333-333333333333', 0.7),
  ('c3333333-3333-3333-3333-333333333333', 'b2222222-2222-2222-2222-222222222222', 0.6)
on conflict do nothing;

insert into public.dna_scores (fragrance_id, sweetness, freshness, masculine_feminine, projection, longevity, versatility, sample_size) values
  ('c1111111-1111-1111-1111-111111111111', 3, 8, 8, 8, 7, 9, 142),
  ('c2222222-2222-2222-2222-222222222222', 5, 6, 9, 9, 9, 6, 310),
  ('c3333333-3333-3333-3333-333333333333', 5, 6, 8, 7, 6, 6, 58)
on conflict (fragrance_id) do nothing;

insert into public.price_points (fragrance_id, retailer, price, url) values
  ('c1111111-1111-1111-1111-111111111111', 'FragranceNet', 79.99, 'https://example.com/sauvage'),
  ('c1111111-1111-1111-1111-111111111111', 'Sephora', 96.00, 'https://example.com/sauvage-sephora'),
  ('c2222222-2222-2222-2222-222222222222', 'Creed Boutique', 375.00, 'https://example.com/aventus');

-- Embeddings are intentionally left null here — run the admin "backfill
-- embeddings" action (or POST /api/admin/backfill-embeddings) once
-- OPENAI_API_KEY is set, which fills fragrances.embedding for Genome matching.
