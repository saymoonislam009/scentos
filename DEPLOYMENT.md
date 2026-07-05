# Deploying ScentOS — Supabase + Vercel

Single-page reference. No Railway, no second host — just Supabase for data/auth and Vercel for the app.

---

## Prerequisites

- A [Supabase](https://supabase.com) account
- A [Vercel](https://vercel.com) account
- The repo pushed to GitHub
- API keys for [Anthropic](https://console.anthropic.com) and [OpenAI](https://platform.openai.com)

---

## Step 1 — Create the Supabase project

1. supabase.com → **New project**
2. Choose a name, region closest to your users, and a strong database password
3. Wait ~2 minutes for provisioning

---

## Step 2 — Run the database migrations

Go to **SQL Editor → New query** in your Supabase dashboard. Paste and run each file below **in order**, one at a time.

| Order | File | What it does |
|---|---|---|
| 1 | `supabase/migrations/0001_schema.sql` | All tables, indexes, pgvector + pg_trgm extensions |
| 2 | `supabase/migrations/0002_partial_bottles.sql` | Partial Bottle marketplace tables + reports |
| 3 | `supabase/migrations/0003_functions.sql` | Auth trigger, escrow RPCs, search, Genome matching, trending |
| 4 | `supabase/migrations/0004_rls_policies.sql` | Row Level Security policies for every table |
| 5 | `supabase/seed.sql` | Sample catalog (3 fragrances, brands, notes, prices) |

> **Alternative:** if you have the [Supabase CLI](https://supabase.com/docs/guides/cli) installed locally, run `supabase link` then `supabase db push` and it handles all of the above automatically.

---

## Step 3 — Copy your Supabase keys

Supabase dashboard → **Settings → API**

| Key | Where you'll paste it |
|---|---|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| `anon` `public` key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `service_role` key | `SUPABASE_SERVICE_ROLE_KEY` ⚠️ keep this secret |

---

## Step 4 — Deploy to Vercel

1. [vercel.com](https://vercel.com) → **Add New → Project**
2. Import your GitHub repo
3. **No Root Directory change needed** — the app is at the repo root
4. Framework preset: **Next.js** (auto-detected)
5. Under **Environment Variables**, add all of the following:

```
NEXT_PUBLIC_SUPABASE_URL          =  https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY     =  <anon key from Step 3>
SUPABASE_SERVICE_ROLE_KEY         =  <service_role key from Step 3>

ANTHROPIC_API_KEY                 =  <your Anthropic key>
OPENAI_API_KEY                    =  <your OpenAI key>

ADMIN_SECRET                      =  faltuscentos   ← change this before going public
```

6. Click **Deploy**

Vercel will give you a URL like `https://scentos.vercel.app`. Note it down for the next step.

---

## Step 5 — Connect Supabase Auth to your Vercel domain

Supabase dashboard → **Authentication → URL Configuration**

| Field | Value |
|---|---|
| **Site URL** | `https://scentos.vercel.app` (or your custom domain) |
| **Redirect URLs** | `https://scentos.vercel.app/**` |

> If you add a custom domain on Vercel later, add it here too.

---

## Step 6 — Smoke test (do these in order)

After deploy, run through these quickly to confirm everything is wired correctly:

- [ ] **Sign up** at `/sign-up` → check a profile row was created in Supabase → **Table Editor → profiles**
- [ ] **Database** at `/database` → search "sauvage" → should return Sauvage EDT from seed data
- [ ] **List a partial bottle** at `/partial-bottles/new` → sign out → confirm it's visible at `/partial-bottles` while signed out
- [ ] **Buy a decant** at `/marketplace` → click Buy on a listing → check the order row in **Table Editor → orders**
- [ ] **Admin panel** at `/admin/faltuscentos` (or your `ADMIN_SECRET`) → Overview tab loads stats
- [ ] **Backfill embeddings** in the admin Overview tab → activates Fragrance Genome on all fragrance detail pages

---

## Step 7 — Custom domain (optional)

**Vercel:** Project Settings → Domains → Add your domain → follow the DNS instructions.

**Supabase:** go back to Authentication → URL Configuration and add the new domain to both Site URL and Redirect URLs.

---

## Environment variables reference

```bash
# ── Supabase (required) ─────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=          # https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # safe to expose in the browser
SUPABASE_SERVICE_ROLE_KEY=         # server-only, bypasses RLS — never expose publicly

# ── AI (required for Advisor, ScentGPT, Layering, Genome) ──
ANTHROPIC_API_KEY=
OPENAI_API_KEY=

# ── Admin panel ──────────────────────────────────────
ADMIN_SECRET=faltuscentos          # change this before going live
```

---

## Troubleshooting

| Symptom | Most likely cause | Fix |
|---|---|---|
| Sign-up works but user stays logged out | Auth redirect URL not configured | Add your domain to Supabase → Auth → Redirect URLs |
| `/database` returns no results | Seed didn't run | Re-run `supabase/seed.sql` in the SQL Editor |
| Fragrance Genome shows "no embedding" | Embeddings backfill not run | Admin panel → Overview → Backfill embeddings |
| Admin panel returns 401 | Wrong `ADMIN_SECRET` or env var not set | Check Vercel → Settings → Environment Variables |
| Buy button fails with RLS error | `0003_functions.sql` didn't run | Re-run it in the SQL Editor |
| `SUPABASE_SERVICE_ROLE_KEY` missing | Env var not set in Vercel | Add it under Project Settings → Environment Variables |

---

## Redeploying after changes

Push to your main branch — Vercel redeploys automatically. If you change the database schema, run the new migration in the Supabase SQL Editor before or right after pushing.
