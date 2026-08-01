import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const SYS = `You are ScentGPT, the fragrance expert inside ScentOS. Use the lookup_fragrances tool for real catalog data. Be concise and opinionated.`;
const TOOLS: Anthropic.Tool[] = [{ name: 'lookup_fragrances', description: 'Search the ScentOS catalog by name.', input_schema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] } }];
export async function POST(req: NextRequest) {
  const body = await req.json();
  const s = createClient(); const { data: { user } } = await s.auth.getUser(); const userId = user?.id;
  const a = createAdminClient();
  let sessionId = body.sessionId as string | undefined;
  if (sessionId) {
    const { data: session } = await a.from('chat_sessions').select('user_id').eq('id', sessionId).maybeSingle();
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    if (session.user_id && session.user_id !== userId) return NextResponse.json({ error: 'Session belongs to another account' }, { status: 403 });
  } else {
    const { data: cr } = await a.from('chat_sessions').insert({ user_id: userId ?? null }).select('id').single();
    sessionId = cr!.id;
  }
  const { data: prior } = await a.from('chat_messages').select('role,content').eq('session_id', sessionId).order('created_at', { ascending: true });
  let messages: Anthropic.MessageParam[] = [
    ...(prior ?? []).map((m: any) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    { role: 'user', content: body.message },
  ];
  let finalText = '';
  while (true) {
    const resp = await anthropic.messages.create({ model: 'claude-sonnet-4-6', max_tokens: 1500, system: SYS, tools: TOOLS, messages });
    const toolUses = resp.content.filter(b => b.type === 'tool_use');
    if (!toolUses.length) { const t = resp.content.find(b => b.type === 'text'); finalText = t && t.type === 'text' ? t.text : ''; break; }
    messages = [...messages, { role: 'assistant', content: resp.content }];
    const results = await Promise.all(toolUses.map(async t => {
      let content = '[]';
      if (t.name === 'lookup_fragrances') {
        const { data } = await a.from('fragrances').select('name,longevity_hrs,projection,price_tier_usd,brands(name),fragrance_notes(notes(name))').ilike('name', `%${(t.input as any).query}%`).limit(5);
        content = JSON.stringify((data ?? []).map((r: any) => ({ name: r.name, brand: (r.brands as any)?.name, notes: (r.fragrance_notes ?? []).map((n: any) => n.notes?.name).filter(Boolean), longevityHrs: r.longevity_hrs, projection: r.projection, priceTierUsd: r.price_tier_usd })));
      }
      return { type: 'tool_result' as const, tool_use_id: t.id, content };
    }));
    messages = [...messages, { role: 'user', content: results }];
  }
  await a.from('chat_messages').insert([{ session_id: sessionId, role: 'user', content: body.message }, { session_id: sessionId, role: 'assistant', content: finalText }]);
  return NextResponse.json({ sessionId, reply: finalText });
}
