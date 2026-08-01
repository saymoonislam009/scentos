import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const SYS = `You are the ScentOS AI Fragrance Advisor. Only recommend fragrances from the provided candidate list. Return ONLY valid JSON: {"matches":[{"fragranceId":string,"matchScore":number,"reasoning":string,"expectedPerformance":string}],"alternatives":[{"fragranceId":string,"reasoning":string}]}`;
function seasons(climate: string) { if (['hot-humid','hot-dry'].includes(climate)) return ['summer','spring']; if (climate === 'cold') return ['winter','fall']; return ['spring','summer','fall','winter']; }
export async function POST(req: NextRequest) {
  const input = await req.json();
  const s = createClient(); const { data: { user } } = await s.auth.getUser();
  const a = createAdminClient();
  const { data: candidates } = await a.from('fragrances').select('id,name,price_tier_usd,seasons,occasions,brands(name),fragrance_notes(notes(name)),fragrance_accords(accords(name))').eq('discontinued', false).lte('price_tier_usd', Math.max(input.budgetUsd ?? 100, 30)).overlaps('seasons', seasons(input.climate ?? 'temperate')).limit(120);
  const summary = (candidates ?? []).map((c: any) => ({ id: c.id, name: c.name, brand: (c.brands as any)?.name, notes: (c.fragrance_notes ?? []).map((n: any) => n.notes?.name).filter(Boolean), accords: (c.fragrance_accords ?? []).map((ac: any) => ac.accords?.name).filter(Boolean), seasons: c.seasons, occasions: c.occasions, priceTierUsd: c.price_tier_usd }));
  const response = await anthropic.messages.create({ model: 'claude-sonnet-4-6', max_tokens: 2000, system: SYS, messages: [{ role: 'user', content: `Person:\n${JSON.stringify(input, null, 2)}\n\nCandidates:\n${JSON.stringify(summary)}` }] });
  const tb = response.content.find(b => b.type === 'text'); if (!tb || tb.type !== 'text') return NextResponse.json({ error: 'No response' }, { status: 502 });
  let parsed: any; try { parsed = JSON.parse(tb.text.replace(/```json|```/g, '').trim()); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 502 }); }
  const needed = [...parsed.matches.map((m: any) => m.fragranceId), ...parsed.alternatives.map((al: any) => al.fragranceId)];
  const byId = new Map((candidates ?? []).filter((c: any) => needed.includes(c.id)).map((c: any) => [c.id, c]));
  const result = { matches: parsed.matches.map((m: any) => ({ ...m, fragrance: byId.get(m.fragranceId) })), alternatives: parsed.alternatives.map((al: any) => ({ ...al, fragrance: byId.get(al.fragranceId) })) };
  await a.from('advisor_submissions').insert({ user_id: user?.id ?? null, inputs: input, result_json: result });
  return NextResponse.json(result);
}
