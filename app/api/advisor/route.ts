import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are the ScentOS AI Fragrance Advisor, an expert perfumer and fragrance
consultant. You will be given a person's preferences and a list of candidate
fragrances drawn from a real catalog (with id, name, brand, notes, accords,
season/occasion tags, and approximate price tier).

Rules:
- Only recommend fragrances from the provided candidate list. Never invent
  fragrances that are not in the list.
- Return ONLY valid JSON, no prose, no markdown fences, matching this shape:
{
  "matches": [
    { "fragranceId": string, "matchScore": number (0-100), "reasoning": string, "expectedPerformance": string }
  ],
  "alternatives": [
    { "fragranceId": string, "reasoning": string }
  ]
}
- matches: 3-5 best fits, ordered by matchScore descending.
- alternatives: 2-3 fragrances worth considering for a different mood, budget, or occasion.
- reasoning should be 1-2 sentences, specific to the person's stated preferences.`;

function climateToSeasons(climate: string): string[] {
  switch (climate) {
    case 'hot-humid':
    case 'hot-dry':
      return ['summer', 'spring'];
    case 'cold':
      return ['winter', 'fall'];
    default:
      return ['spring', 'summer', 'fall', 'winter'];
  }
}

export async function POST(req: NextRequest) {
  const input = await req.json();

  // Identifies the caller if signed in, but works anonymously too — this is
  // the optional-auth pattern from the NestJS build's OptionalClerkAuthGuard,
  // done here by simply checking whether a session exists at all.
  const supabaseServer = createClient();
  const { data: userData } = await supabaseServer.auth.getUser();
  const userId = userData.user?.id;

  const admin = createAdminClient();

  const { data: candidates } = await admin
    .from('fragrances')
    .select('id, name, price_tier_usd, seasons, occasions, brands ( name ), fragrance_notes ( notes ( name ) ), fragrance_accords ( accords ( name ) )')
    .eq('discontinued', false)
    .lte('price_tier_usd', Math.max(input.budgetUsd ?? 100, 30))
    .overlaps('seasons', climateToSeasons(input.climate))
    .limit(120);

  const candidateSummary = (candidates ?? []).map((c: any) => ({
    id: c.id,
    name: c.name,
    brand: c.brands?.name,
    notes: c.fragrance_notes?.map((n: any) => n.notes?.name).filter(Boolean),
    accords: c.fragrance_accords?.map((a: any) => a.accords?.name).filter(Boolean),
    seasons: c.seasons,
    occasions: c.occasions,
    priceTierUsd: c.price_tier_usd,
  }));

  const userPrompt = `Person profile:\n${JSON.stringify(input, null, 2)}\n\nCandidate fragrances (catalog subset):\n${JSON.stringify(candidateSummary)}`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    return NextResponse.json({ error: 'Advisor returned no usable response' }, { status: 502 });
  }

  let parsed: { matches: any[]; alternatives: any[] };
  try {
    parsed = JSON.parse(textBlock.text.replace(/```json|```/g, '').trim());
  } catch {
    return NextResponse.json({ error: 'Advisor response was not valid JSON' }, { status: 502 });
  }

  const idsNeeded = [...parsed.matches.map((m) => m.fragranceId), ...parsed.alternatives.map((a) => a.fragranceId)];
  const byId = new Map((candidates ?? []).filter((c: any) => idsNeeded.includes(c.id)).map((c: any) => [c.id, c]));

  const result = {
    matches: parsed.matches.map((m) => ({ ...m, fragrance: byId.get(m.fragranceId) })),
    alternatives: parsed.alternatives.map((a) => ({ ...a, fragrance: byId.get(a.fragranceId) })),
  };

  await admin.from('advisor_submissions').insert({ user_id: userId ?? null, inputs: input, result_json: result });

  return NextResponse.json(result);
}
