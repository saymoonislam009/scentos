import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { checkAdminSecret } from '@/lib/adminAuth';
import { getSecret } from '@/lib/secrets';

export async function POST(req: NextRequest) {
  const d = checkAdminSecret(req); if (d) return d;
  const { dbKey } = await req.json().catch(() => ({}));

  try {
    if (dbKey === 'anthropic_api_key') {
      const key = await getSecret('anthropic_api_key', 'ANTHROPIC_API_KEY');
      if (!key) return NextResponse.json({ ok: false, error: 'No key configured' }, { status: 400 });
      const anthropic = new Anthropic({ apiKey: key });
      await anthropic.messages.create({ model: 'claude-sonnet-4-6', max_tokens: 8, messages: [{ role: 'user', content: 'Say "ok".' }] });
      return NextResponse.json({ ok: true });
    }
    if (dbKey === 'openai_api_key') {
      const key = await getSecret('openai_api_key', 'OPENAI_API_KEY');
      if (!key) return NextResponse.json({ ok: false, error: 'No key configured' }, { status: 400 });
      const openai = new OpenAI({ apiKey: key });
      await openai.embeddings.create({ model: 'text-embedding-3-small', input: 'test' });
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ ok: false, error: 'Unknown key' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message ?? 'Connection failed' }, { status: 200 });
  }
}
