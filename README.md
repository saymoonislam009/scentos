# ScentOS — The Fragrance Operating System

**Architecture v2: Supabase-native, single Vercel deployment.**

The previous version of this build used Next.js + a separate NestJS API +
Prisma/Postgres + Clerk + Pinecone + Elasticsearch, which meant two hosts
(Vercel for the frontend, Railway/AWS for the API). This version drops the
second host entirely:

- **Database + Auth + Storage:** Supabase (Postgres, Supabase Auth, Supabase Storage)
- **Backend:** a handful of Next.js Route Handlers, only where a secret API
  key is genuinely needed (Claude, OpenAI) or RLS needs to be deliberately
  bypassed (the admin panel)
- **Everything else** (catalog browsing, collection, marketplace, social,
  partial-bottle listings) talks to Supabase **directly from the client**,
  protected by real Row Level Security policies
- **Genome similarity:** Postgres + `pgvector`, no separate vector DB
- **Search:** Postgres + `pg_trgm`, no separate search cluster

One deploy target: **Vercel**. One data platform: **Supabase**.

---

## 1. Feature status

| Feature | Status |
|---|---|
| AI Fragrance Advisor | Full — Route Handler grounds Claude in real catalog candidates |
| Fragrance Database | Full — `pg_trgm` search, season/occasion filters |
| Fragrance DNA | Full — radar chart from `dna_scores` |
| Fragrance Genome | Full — `pgvector` cosine similarity, OpenAI embeddings (admin backfill action) |
| Collection Manager | Full — direct Supabase CRUD, RLS-scoped to the signed-in user |
| ScentGPT | Full — tool-using chat, session-ownership enforced |
| Decant Marketplace | Full — listings, **Buy** button, escrow state machine as Postgres functions, ship/confirm/dispute UI |
| **Partial Bottle Marketplace** (new) | Full — casual classifieds-style listings, public browsing, account-gated buy requests |
| **Trust & safety reports** (new) | Full — report a listing/seller, admin dashboard groups by user or by post |
| Price Intelligence | Full — price history, best-deal display on fragrance detail |
| Social Platform | Full — public feed, posting/likes/comments gated to signed-in |
| AI Layering Engine | Full — pick owned fragrances, Claude-backed combinations |
| Trend Analytics | Full — global trending (Postgres function) + by-season browse |
| Admin panel (private) | Full — shared-secret gate, catalog CRUD, orders, users, **partial listings**, **reports** (grouped), embedding backfill |

## 2. Partial Bottle Marketplace — what it is, why it's separate

This is a more casual listing type than the Decant Marketplace: a seller
posts a partially-used bottle (perfume name, days used, % left, box or no
box, price, payment method, location, and their own contact info), and
buyers arrange payment/handoff directly — no escrow, no shipping flow, the
way most classifieds work.

- **Anyone can browse**, signed in or not — `partial_bottle_listings` has a
  public `select` RLS policy.
- **Listing and buying both require an account.** Listing needs
  `auth.uid() = seller_id`; buying creates a row in
  `partial_listing_inquiries`, which has no anonymous-accessible insert
  policy at all — RLS denies by default, so there's no path for an
  unauthenticated request to create one. That's the actual enforcement
  mechanism, not a UI-level check.
- **Reporting:** any signed-in visitor can report a listing or its seller
  (`reports` table). The admin dashboard's Reports tab can group these
  **by user** or **by post** — directly answering "who's getting reported"
  vs. "which listings are getting reported."
- **Everything syncs to admin automatically** — there's no separate sync
  step; the admin Route Handlers query the same tables with the
  service-role key, which sees every row regardless of RLS.

## 3. Why RLS is actually load-bearing now

In the previous (NestJS) version, RLS had nothing to protect — the browser
never touched Postgres directly. Here, most reads and many writes (posting,
liking, listing, requesting to buy) go straight from the browser to
Supabase. `supabase/migrations/0004_rls_policies.sql` is the real access
control layer:

- Catalog tables (`fragrances`, `brands`, `notes`, ...): public read, **no**
  client write policy at all — only the service-role key (admin Route
  Handlers) can write them.
- User-owned tables (`collection_items`, `price_alerts`): every operation
  scoped to `auth.uid() = user_id`.
- Marketplace tables: public read of active listings, writes scoped to the
  seller; **order status changes go through `SECURITY DEFINER` Postgres
  functions** (`create_decant_order`, `mark_order_shipped`,
  `confirm_order_delivered`, `dispute_order`) that check ownership inside
  the function body, rather than a raw `UPDATE` policy. This is the
  database-level version of the "anyone could dispute anyone's order" bug
  fixed in the previous build — there's no `UPDATE` path left for a client
  to exploit even if a future bug in the app code tried to allow it.
- AI tables (`advisor_submissions`, `chat_sessions`, `chat_messages`,
  `layering_suggestions`): client can only ever `select` their own rows.
  Writes happen exclusively from the Route Handlers using the service-role
  key, mid-AI-call.
- `reports`: a user can see their own filed reports, nobody can browse
  reports filed against other people — only the admin (service-role key)
  sees the full picture.

## 4. Information architecture

```
/                       Landing
/advisor                AI Fragrance Advisor → /api/advisor
/database               Catalog search (pg_trgm)
/fragrance/[slug]       Detail: DNA, Genome (pgvector), prices, reviews
/scentgpt               Chat → /api/scentgpt
/collection             Bottles/decants/wishlist (auth, RLS-scoped)
/layering               AI Layering → /api/layering (auth)
/marketplace            Decant listings, buy, ship/confirm/dispute (auth to act)
/partial-bottles        Used-bottle classifieds — public browse
/partial-bottles/new    List a bottle (auth)
/social                 Public feed (auth to post/like)
/trends                 Global trending + by-season
/sign-in, /sign-up      Supabase Auth (email/password)
/admin                  Private — shared ADMIN_SECRET, not Supabase Auth
```

Server-only routes, all under `/api`:

```
POST /api/advisor                       Claude, catalog-grounded
POST /api/scentgpt                      Claude + tool use, session-ownership checked
POST /api/layering                      Claude

POST   /api/admin/login
GET    /api/admin/stats
GET/POST /api/admin/fragrances
PATCH/DELETE /api/admin/fragrances/[id]
GET    /api/admin/orders
GET    /api/admin/users
GET    /api/admin/partial-listings      (with inquiry + report counts)
PATCH  /api/admin/partial-listings/[id]
GET    /api/admin/reports               (joined: reporter, reported user, listing)
PATCH  /api/admin/reports/[id]
POST   /api/admin/backfill-embeddings   (OpenAI → pgvector)
```

Everything else — fragrance browsing, collection, marketplace listings,
partial-bottle listings, social feed, likes, comments, follows — is a direct
Supabase call from the page itself (`lib/supabase/client.ts`).

## 5. Database & functions

Full schema: `supabase/migrations/0001_schema.sql` and
`0002_partial_bottles.sql`. Postgres functions (escrow state machine,
catalog search, Genome matching, trending): `0003_functions.sql`. RLS:
`0004_rls_policies.sql`. Sample catalog data: `supabase/seed.sql`.

Run them in order against your Supabase project — either via
`supabase db push` (Supabase CLI) or by pasting each file into the SQL
Editor in the Supabase dashboard, in numeric order.

## 6. AI architecture

- **Advisor & Layering:** Claude (`claude-sonnet-4-6`), given a
  catalog-filtered candidate list, instructed to recommend *only* from that
  list, returning strict JSON. Same anti-hallucination approach as before.
- **ScentGPT:** Claude with a `lookup_fragrances` tool querying Postgres
  directly — factual claims are grounded, not recalled from training data.
- **Genome:** OpenAI `text-embedding-3-small`, stored in
  `fragrances.embedding` (a `vector(1536)` column), queried with the
  `match_fragrance_genome()` Postgres function using cosine distance via
  pgvector's `<=>` operator. Run the admin "Backfill embeddings" action
  after seeding, or whenever you add fragrances — Genome returns nothing for
  a fragrance until it has an embedding.

## 7. What's actually been verified vs. what hasn't

I can't reach supabase.co or run the Supabase CLI from this sandbox, so I
couldn't test against a real hosted project. But I didn't want to just ship
SQL and hope — I installed Postgres 16 + `pgvector` + `pg_trgm` locally,
stubbed only the two things Supabase's platform provides that stock
Postgres doesn't (the `auth.users` table and `auth.uid()`), and ran the
actual migration files against it. Verified for real, not just
type-checked:

- All four migrations (`0001`–`0004`) run clean, in order, with
  `ON_ERROR_STOP` — every table, index, function, trigger, and RLS policy is
  syntactically valid and references real columns.
- The `handle_new_user` trigger actually fires and populates `profiles` when
  a row is inserted into `auth.users`.
- **RLS is enforced, not just declared** — tested as two simulated users
  (via Postgres role-switching, since I can't generate real Supabase JWTs
  here): Bob could not insert a listing claiming to be Alice (rejected by
  policy); a properly anonymous session was cleanly rejected from creating a
  `partial_listing_inquiries` row (the actual "account required to buy"
  enforcement); Alice (a reported seller) could see zero reports filed
  against her, while Bob (who filed it) could see his own.
- **The escrow ownership fix holds at the DB level**: Bob (the buyer) calling
  `mark_order_shipped` was rejected; Alice (the seller) succeeded; a random
  third user calling `dispute_order` was rejected.
- `search_fragrances` correctly fuzzy-matched "savage" → "Sauvage EDT" via
  `pg_trgm`. `match_fragrance_genome` correctly ranked similarity once given
  real (non-degenerate) vectors — cosine distance via `pgvector`'s `<=>`
  operator works as expected.

What's **not** verified, because it needs the actual Supabase platform:

- The PostgREST embed syntax used in the Route Handlers and pages (e.g.
  `buyer:buyer_id(name,email)` to disambiguate the two foreign keys from
  `orders` to `profiles`) — this is documented Supabase syntax, but I
  couldn't run a real query against `supabase-js` to confirm the response
  shape matches what the frontend code expects.
- Supabase Auth's actual session/cookie flow end-to-end (sign up → email
  confirm → sign in → middleware refresh) — the code follows Supabase's
  documented `@supabase/ssr` pattern exactly, but local Postgres has no
  Auth service to test against.

Test these specifically right after your first deploy: sign up, list a
partial bottle, buy a decant, and the admin orders/reports pages (those are
exactly the PostgREST embed queries I couldn't verify here).

## 8. Other caveats

- **`lib/database.types.ts` is hand-written, not generated.** It's there for
  reference but the Supabase clients deliberately *don't* use it as a
  generic type parameter — a hand-rolled type without a live project to
  check it against produced confusing `never` errors on `.insert()`/
  `.update()`. Once deployed, run
  `npx supabase gen types typescript --linked > lib/database.types.ts`,
  then wire `createBrowserClient<Database>(...)` etc. back in across the
  three files in `lib/supabase/` for full type safety.
- **Decant Marketplace payment capture isn't wired up** (same TODO as the
  previous build) — orders go straight to `pending` and the seller can mark
  shipped from there. Plug in Stripe Connect (or similar) and have it move
  orders to `escrow-held` on successful payment.
- **Partial Bottle Marketplace has no payment integration at all** — that's
  by design; it's explicitly the "arrange it yourselves" listing type.

## 9. Local setup

```bash
npx supabase init           # if you want the local dev stack
npx supabase start          # local Postgres + Auth + Studio
# or just use a hosted Supabase project — either works with everything below

# Run migrations in order via the SQL Editor (hosted) or:
npx supabase db push

# Seed sample catalog data (SQL Editor or: psql $DATABASE_URL -f supabase/seed.sql)

cp .env.example .env.local   # fill in your Supabase + Anthropic/OpenAI keys
npm install
npm run dev                  # http://localhost:3000
```

Then in the running app: sign up for an account, open `/admin` with your
`ADMIN_SECRET`, and run "Backfill embeddings" once `OPENAI_API_KEY` is set —
that activates Fragrance Genome.

## 10. Deploying — single Vercel project

1. Push to GitHub.
2. Create a Supabase project, run the four migration files + seed (SQL
   Editor, in order).
3. Vercel → Add New → Project → import the repo. No root-directory setting
   needed this time — it's a single app at the repo root.
4. Environment variables (from `.env.example`): `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
   `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `ADMIN_SECRET`.
5. Deploy. That's it — no second host, no Railway, no Root Directory
   gymnastics.
6. In Supabase Auth settings, add your Vercel domain to the allowed
   redirect URLs.
