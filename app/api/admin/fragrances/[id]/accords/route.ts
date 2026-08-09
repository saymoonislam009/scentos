import { NextRequest, NextResponse } from 'next/server';
import { checkAdminSecret } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const d = checkAdminSecret(req); if (d) return d;
  const { data, error } = await createAdminClient().from('fragrance_accords').select('strength,accords(id,name)').eq('fragrance_id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const d = checkAdminSecret(req); if (d) return d;
  const { accordName, strength } = await req.json();
  if (!accordName) return NextResponse.json({ error: 'accordName required' }, { status: 400 });
  const a = createAdminClient();
  const { data: existing } = await a.from('accords').select('id').eq('name', accordName).maybeSingle();
  let accordId = existing?.id;
  if (!accordId) { const { data: created } = await a.from('accords').insert({ name: accordName }).select('id').single(); accordId = created?.id; }
  if (!accordId) return NextResponse.json({ error: 'Could not create accord' }, { status: 500 });
  const { error } = await a.from('fragrance_accords').insert({ fragrance_id: params.id, accord_id: accordId, strength: Number(strength) || 0.8 });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const d = checkAdminSecret(req); if (d) return d;
  const { accordId } = await req.json();
  const { error } = await createAdminClient().from('fragrance_accords').delete().eq('fragrance_id', params.id).eq('accord_id', accordId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deleted: true });
}
