import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are ScentOS's fragrance layering specialist. Given a list of fragrances
(with their notes and accords) that a person owns, suggest layering
combinations. Return ONLY valid JSON in this shape:
{
  "combinations": [
    {
      "layers": [{ "fragranceId": string, "application": "base" | "accent", "note": string }],
      "expectedProfile": string,
      "occasions": string[]
    }
  ]
}
Suggest 2-4 combinations. "base" is applied first/more generously, "accent" is
a light top-up layer. Only use fragrance ids from the provided list.`;

export async function POST(req: NextRequest) {
  const { fragranceIds } = await req.json();

  const supabaseServer = createClient();
  const { data: userData } = await supabaseServer.auth.getUser();
  const userId = userData.user?.id;

  const admin = createAdminClient();
  const { data: fragrances } = await admin
    .from('fragrances')
    .select('id, name, brands ( name ), fragrance_notes ( notes ( name ) ), fragrance_accords ( accords ( name ) )')
    .in('id', fragranceIds);

  const summary = (fragrances ?? []).map((f: any) => ({
    id: f.id,
    name: f.name,
    brand: f.brands?.name,
    notes: f.fragrance_notes?.map((n: any) => n.notes?.name).filter(Boolean),
    accords: f.fragrance_accords?.map((a: any) => a.accords?.name).filter(Boolean),
  }));

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: JSON.stringify(summary) }],
  });

  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    return NextResponse.json({ error: 'No layering suggestion returned' }, { status: 502 });
  }

  let parsed: { combinations: any[] };
  try {
    parsed = JSON.parse(textBlock.text.replace(/```json|```/g, '').trim());
  } catch {
    return NextResponse.json({ error: 'Layering response was not valid JSON' }, { status: 502 });
  }

  const byId = new Map((fragrances ?? []).map((f: any) => [f.id, f]));
  const enriched = parsed.combinations.map((c) => ({
    ...c,
    layers: c.layers.map((l: any) => ({ ...l, fragrance: byId.get(l.fragranceId) })),
  }));

  await admin.from('layering_suggestions').insert({
    user_id: userId ?? null,
    fragrance_ids: fragranceIds,
    combination: enriched,
  });

  return NextResponse.json(enriched);
}
