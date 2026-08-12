import { NextRequest, NextResponse } from 'next/server';
import { checkAdminSecret } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSecret, maskKey, invalidateSecretCache } from '@/lib/secrets';

const MANAGED_KEYS = [
  { dbKey: 'anthropic_api_key', envVar: 'ANTHROPIC_API_KEY', label: 'Anthropic API Key', prefix: 'sk-ant-' },
  { dbKey: 'openai_api_key', envVar: 'OPENAI_API_KEY', label: 'OpenAI API Key', prefix: 'sk-' },
] as const;

export async function GET(req: NextRequest) {
  const d = checkAdminSecret(req); if (d) return d;
  const a = createAdminClient();
  const { data } = await a.from('app_settings').select('key,value,updated_at');
  const overrides = new Map((data ?? []).map((r: any) => [r.key, r]));

  const results = await Promise.all(MANAGED_KEYS.map(async k => {
    const override = overrides.get(k.dbKey);
    const resolved = await getSecret(k.dbKey, k.envVar);
    return {
      dbKey: k.dbKey,
      label: k.label,
      source: override ? 'admin' : (process.env[k.envVar] ? 'env' : 'none'),
      masked: maskKey(resolved),
      updatedAt: override?.updated_at ?? null,
    };
  }));
  return NextResponse.json(results);
}

export async function POST(req: NextRequest) {
  const d = checkAdminSecret(req); if (d) return d;
  const body = await req.json().catch(() => null);
  const meta = MANAGED_KEYS.find(k => k.dbKey === body?.dbKey);
  if (!meta) return NextResponse.json({ error: 'Unknown key' }, { status: 400 });
  const value = (body.value ?? '').trim();
  if (!value || value.length < 10) return NextResponse.json({ error: 'Key looks too short' }, { status: 400 });
  if (!value.startsWith(meta.prefix)) return NextResponse.json({ error: `Expected a key starting with "${meta.prefix}"` }, { status: 400 });

  const a = createAdminClient();
  const { error } = await a.from('app_settings').upsert({ key: meta.dbKey, value, updated_at: new Date().toISOString() });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  invalidateSecretCache(meta.dbKey);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const d = checkAdminSecret(req); if (d) return d;
  const { searchParams } = new URL(req.url);
  const dbKey = searchParams.get('dbKey');
  const meta = MANAGED_KEYS.find(k => k.dbKey === dbKey);
  if (!meta) return NextResponse.json({ error: 'Unknown key' }, { status: 400 });
  const a = createAdminClient();
  const { error } = await a.from('app_settings').delete().eq('key', meta.dbKey);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  invalidateSecretCache(meta.dbKey);
  return NextResponse.json({ ok: true, revertedTo: process.env[meta.envVar] ? 'env' : 'none' });
}
