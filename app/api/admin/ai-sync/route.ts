import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { checkAdminSecret } from '@/lib/adminAuth';
import { rateLimit } from '@/lib/rateLimit';
import { sanitizeString } from '@/lib/sanitize';
import { getSecret } from '@/lib/secrets';
import { createAdminClient } from '@/lib/supabase/admin';
import { insertFragranceWithDetails, type ImportFragrance } from '@/lib/fragranceImport';

const SYSTEM = `You are a fragrance-catalog data assistant for ScentOS. Given a perfume name (and optionally a brand), produce a complete, accurate catalog entry from what you know about that real, released fragrance.

Return ONLY a single valid JSON object, no markdown fences, no commentary, matching this shape:
{
  "name": string (required, product name only, no brand),
  "brand": string (required, the correct house/brand for this fragrance),
  "concentration": string (e.g. "EDP", "EDT", "Parfum", "Cologne" — omit if genuinely unknown),
  "description": string (2-3 sentences capturing the character of the scent, written fresh, not copied from any source),
  "priceTierUsd": number (an approximate realistic full-bottle USD retail price — your best estimate, omit only if you truly cannot estimate),
  "releaseYear": number (only if you're confident of the year, omit otherwise),
  "longevityHrs": number (approximate typical wear time in hours, your best estimate),
  "projection": one of "intimate" | "moderate" | "strong" | "beast-mode" (your best estimate),
  "seasons": string[] (subset of "spring","summer","fall","winter" the fragrance suits),
  "occasions": string[] (subset of "office","date-night","casual","formal"),
  "notes": { "top": string[], "mid": string[], "base": string[] } (the fragrance's actual known note pyramid, as complete as you can reliably recall),
  "accords": [{ "name": string, "strength": number 0-1 }] (the main scent accords/families, e.g. "woody", "vanilla", "citrus", ordered strongest first)
}

Rules:
- This must be a REAL, released fragrance. If you do not recognize the name as an actual perfume, or you're not reasonably confident about its identity, return {"error": "not recognized"} instead of guessing.
- Do not invent notes or accords that aren't broadly consistent with what's actually known about this fragrance.
- Fill in every field you can reasonably estimate — the goal is a complete entry, not a sparse one. Only omit a field when you have no reasonable basis for it.
- If a brand is given by the user, trust it unless it's clearly wrong for that fragrance name.`;

export async function POST(req: NextRequest) {
  const d = checkAdminSecret(req); if (d) return d;
  const ip = req.headers.get('x-forwarded-for') ?? 'admin';
  if (!rateLimit(`ai-sync:${ip}`, 20, 60000)) return NextResponse.json({ error: 'Rate limit exceeded. Slow down a bit.' }, { status: 429 });

  const body = await req.json().catch(() => null);
  const name = sanitizeString(body?.name, 200);
  const brand = sanitizeString(body?.brand, 200);
  if (!name) return NextResponse.json({ error: 'Perfume name required' }, { status: 400 });

  const apiKey = await getSecret('anthropic_api_key', 'ANTHROPIC_API_KEY');
  if (!apiKey) return NextResponse.json({ error: 'AI Sync is not configured. Set an Anthropic API key in Admin → Settings.' }, { status: 503 });
  const anthropic = new Anthropic({ apiKey });

  const a = createAdminClient();
  const { data: slugRows } = await a.from('fragrances').select('slug');
  const existingSlugs = new Set((slugRows ?? []).map((r: any) => r.slug));

  let parsed: any;
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: SYSTEM,
      messages: [{
        role: 'user',
        content: `Perfume name: ${name}${brand ? `\nBrand (if known): ${brand}` : ''}\n\nReturn the complete catalog entry as instructed.`,
      }],
    });
    const tb = response.content.find(b => b.type === 'text');
    if (!tb || tb.type !== 'text') return NextResponse.json({ error: 'No response from model' }, { status: 502 });
    try { parsed = JSON.parse(tb.text.replace(/```json|```/g, '').trim()); }
    catch { return NextResponse.json({ error: 'Could not parse AI response. Try again.' }, { status: 502 }); }
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'AI Sync failed' }, { status: 500 });
  }

  if (parsed?.error) return NextResponse.json({ error: `AI didn't recognize "${name}" as a known fragrance. Check the spelling or add it manually.` }, { status: 422 });
  if (!parsed?.name || !parsed?.brand) return NextResponse.json({ error: 'AI response was missing name/brand.' }, { status: 502 });

  const item: ImportFragrance = parsed;
  const res = await insertFragranceWithDetails(a, item, existingSlugs);
  if (res.ok !== true) return NextResponse.json({ error: (res as { ok: false; error: string }).error }, { status: 409 });

  return NextResponse.json({ ok: true, slug: res.slug, fragrance: item });
}
