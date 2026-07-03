import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are ScentGPT, the conversational fragrance expert inside ScentOS.
You help people recommend fragrances, compare perfumes head-to-head, plan a
collection, and suggest layering combinations. Use the lookup_fragrances tool
whenever you need real catalog data instead of relying on memory — never
state notes, prices, or longevity for a specific fragrance without looking it
up first. Keep answers concise, opinionated, and specific.`;

const TOOLS: Anthropic.Tool[] = [
  {
    name: 'lookup_fragrances',
    description: 'Search the ScentOS catalog by name to get real notes, accords, and price data.',
    input_schema: {
      type: 'object',
      properties: { query: { type: 'string', description: 'fragrance name to search for' } },
      required: ['query'],
    },
  },
];

async function runTool(admin: ReturnType<typeof createAdminClient>, name: string, input: any) {
  if (name === 'lookup_fragrances') {
    const { data } = await admin
      .from('fragrances')
      .select('name, longevity_hrs, projection, price_tier_usd, brands ( name ), fragrance_notes ( notes ( name ) ), dna_scores ( * )')
      .ilike('name', `%${input.query}%`)
      .limit(5);
    return JSON.stringify(
      (data ?? []).map((r: any) => ({
        name: r.name,
        brand: r.brands?.name,
        notes: r.fragrance_notes?.map((n: any) => n.notes?.name).filter(Boolean),
        longevityHrs: r.longevity_hrs,
        projection: r.projection,
        priceTierUsd: r.price_tier_usd,
        dna: r.dna_scores,
      })),
    );
  }
  return JSON.stringify({ error: 'unknown tool' });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const supabaseServer = createClient();
  const { data: userData } = await supabaseServer.auth.getUser();
  const userId = userData.user?.id;

  const admin = createAdminClient();

  // Same ownership check that closed the IDOR bug in the NestJS build:
  // a sessionId belonging to someone else is rejected rather than silently
  // reused, and a session with no owner (anonymous) stays open to anyone
  // holding the id.
  let sessionId = body.sessionId as string | undefined;
  if (sessionId) {
    const { data: session } = await admin.from('chat_sessions').select('user_id').eq('id', sessionId).maybeSingle();
    if (!session) {
      return NextResponse.json({ error: 'Chat session not found' }, { status: 404 });
    }
    if (session.user_id && session.user_id !== userId) {
      return NextResponse.json({ error: 'This chat session belongs to another account' }, { status: 403 });
    }
  } else {
    const { data: created } = await admin.from('chat_sessions').insert({ user_id: userId ?? null }).select('id').single();
    sessionId = created!.id;
  }

  const { data: priorMessages } = await admin
    .from('chat_messages')
    .select('role, content')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  let messages: Anthropic.MessageParam[] = [
    ...(priorMessages ?? []).map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    { role: 'user', content: body.message },
  ];

  let finalText = '';
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      tools: TOOLS,
      messages,
    });

    const toolUses = response.content.filter((b) => b.type === 'tool_use');
    if (toolUses.length === 0) {
      const text = response.content.find((b) => b.type === 'text');
      finalText = text && text.type === 'text' ? text.text : '';
      break;
    }

    messages = [...messages, { role: 'assistant', content: response.content }];
    const toolResults = await Promise.all(
      toolUses.map(async (t) => ({
        type: 'tool_result' as const,
        tool_use_id: t.id,
        content: await runTool(admin, t.name, t.input),
      })),
    );
    messages = [...messages, { role: 'user', content: toolResults }];
  }

  await admin.from('chat_messages').insert([
    { session_id: sessionId, role: 'user', content: body.message },
    { session_id: sessionId, role: 'assistant', content: finalText },
  ]);

  return NextResponse.json({ sessionId, reply: finalText });
}
