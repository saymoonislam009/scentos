import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { checkAdminSecret } from '@/lib/adminAuth';
import { rateLimit } from '@/lib/rateLimit';
import { getSecret } from '@/lib/secrets';
const MAX_BASE64_LEN = 14_000_000; // ~10MB PDF

const SYSTEM = `You extract fragrance/perfume catalog data from documents for ScentOS. Read the attached PDF carefully and extract every distinct perfume/fragrance you can identify.

Return ONLY a valid JSON array, no markdown fences, no commentary. Each item:
{
  "name": string (required, product name only, no brand),
  "brand": string (required),
  "concentration": string (e.g. "EDP", "EDT", "Parfum" — omit if unknown),
  "description": string (1-2 sentences, only if the document describes the scent; omit if not present),
  "priceTierUsd": number (only if a price is given; convert to approximate USD if in another currency; omit if absent — do not guess),
  "releaseYear": number (only if stated),
  "seasons": string[] (subset of "spring","summer","fall","winter" — only if the document indicates suitability; omit if not stated),
  "occasions": string[] (subset of "office","date-night","casual","formal" — only if stated),
  "notes": { "top": string[], "mid": string[], "base": string[] } (only fill positions the document actually lists notes for),
  "accords": [{ "name": string, "strength": number 0-1 }] (only if accords/families are explicitly listed)
}

Rules:
- Never invent data not present in the document. Omit fields you're not confident about rather than guessing.
- If the document is a price list with only names and prices, just extract name, brand, priceTierUsd.
- If brand isn't explicit per-item but a single brand applies to the whole document, use that brand for every item.
- Deduplicate identical entries.
- If you cannot find any fragrances in this document, return an empty array [].`;

export async function POST(req: NextRequest) {
  const d = checkAdminSecret(req); if (d) return d;
  const ip = req.headers.get('x-forwarded-for') ?? 'admin';
  if (!rateLimit(`import-pdf:${ip}`, 5, 300000)) return NextResponse.json({ error: 'Rate limit exceeded. Wait a few minutes before trying another PDF.' }, { status: 429 });

  const body = await req.json().catch(() => null);
  if (!body?.fileBase64) return NextResponse.json({ error: 'fileBase64 required' }, { status: 400 });
  if (typeof body.fileBase64 !== 'string' || body.fileBase64.length > MAX_BASE64_LEN) {
    return NextResponse.json({ error: 'PDF too large (max ~10MB)' }, { status: 400 });
  }

  const apiKey = await getSecret('anthropic_api_key', 'ANTHROPIC_API_KEY');
  if (!apiKey) return NextResponse.json({ error: 'PDF import is not configured. Set an Anthropic API key in Admin → Settings.' }, { status: 503 });
  const anthropic = new Anthropic({ apiKey });

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8000,
      system: SYSTEM,
      messages: [{
        role: 'user',
        content: [
          { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: body.fileBase64 } },
          { type: 'text', text: 'Extract all fragrances from this document as instructed.' },
        ],
      }] as any,
    });
    const tb = response.content.find(b => b.type === 'text');
    if (!tb || tb.type !== 'text') return NextResponse.json({ error: 'No response from model' }, { status: 502 });
    let parsed: any;
    try { parsed = JSON.parse(tb.text.replace(/```json|```/g, '').trim()); }
    catch { return NextResponse.json({ error: 'Could not parse extracted data. Try a clearer PDF.' }, { status: 502 }); }
    if (!Array.isArray(parsed)) return NextResponse.json({ error: 'Unexpected response format' }, { status: 502 });
    return NextResponse.json({ fragrances: parsed.slice(0, 300) });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'PDF extraction failed' }, { status: 500 });
  }
}
