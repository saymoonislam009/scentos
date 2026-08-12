import { NextRequest, NextResponse } from 'next/server';
import { checkAdminSecret } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const d = checkAdminSecret(req); if (d) return d;
  const { reason } = await req.json().catch(() => ({ reason: '' }));
  const a = createAdminClient();
  const { error } = await a.from('profiles').update({
    is_suspended: true,
    suspended_reason: (reason ?? '').slice(0, 500) || null,
    suspended_at: new Date().toISOString(),
  }).eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const d = checkAdminSecret(req); if (d) return d;
  const a = createAdminClient();
  const { error } = await a.from('profiles').update({ is_suspended: false, suspended_reason: null, suspended_at: null }).eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
