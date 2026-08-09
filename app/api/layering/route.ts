import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/rateLimit';
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const SYS = `Fragrance layering specialist. Return ONLY valid JSON: {"combinations":[{"layers":[{"fragranceId":string,"application":"base"|"accent","note":string}],"expectedProfile":string,"occasions":string[]}]}. Max 3 combinations using provided ids.`;
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  if (!rateLimit(`layering:${ip}`, 5, 60000)) return NextResponse.json({ error: 'Rate limit exceeded.' }, { status: 429 });
  const { fragranceIds } = await req.json();
  if (!Array.isArray(fragranceIds) || fragranceIds.length < 2) return NextResponse.json({ error: 'At least 2 fragrance IDs required' }, { status: 400 });
  const s = createClient(); const { data: { user } } = await s.auth.getUser();
  const a = createAdminClient();
  const { data: fragrances } = await a.from('fragrances').select('id,name,brands(name),fragrance_notes(notes(name)),fragrance_accords(accords(name))').in('id', fragranceIds.slice(0, 6));
  const summary = (fragrances ?? []).map((f: any) => ({ id: f.id, name: f.name, brand: (f.brands as any)?.name, notes: (f.fragrance_notes ?? []).map((n: any) => n.notes?.name).filter(Boolean), accords: (f.fragrance_accords ?? []).map((ac: any) => ac.accords?.name).filter(Boolean) }));
  const resp = await anthropic.messages.create({ model: 'claude-sonnet-4-6', max_tokens: 1500, system: SYS, messages: [{ role: 'user', content: JSON.stringify(summary) }] });
  const tb = resp.content.find(b => b.type === 'text'); if (!tb || tb.type !== 'text') return NextResponse.json({ error: 'No response' }, { status: 502 });
  let parsed: any; try { parsed = JSON.parse(tb.text.replace(/```json|```/g, '').trim()); } catch { return NextResponse.json({ error: 'Invalid AI response' }, { status: 502 }); }
  const byId = new Map((fragrances ?? []).map((f: any) => [f.id, f]));
  const enriched = parsed.combinations.map((c: any) => ({ ...c, layers: c.layers.map((l: any) => ({ ...l, fragrance: byId.get(l.fragranceId) })) }));
  await a.from('layering_suggestions').insert({ user_id: user?.id ?? null, fragrance_ids: fragranceIds, combination: enriched });
  return NextResponse.json(enriched);
}
