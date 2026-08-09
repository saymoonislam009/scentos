import { NextRequest, NextResponse } from 'next/server';
import { checkAdminSecret } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const d = checkAdminSecret(req); if (d) return d;
  const { data, error } = await createAdminClient().from('fragrance_notes').select('position,notes(id,name)').eq('fragrance_id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const d = checkAdminSecret(req); if (d) return d;
  const { noteName, position } = await req.json();
  if (!noteName || !position) return NextResponse.json({ error: 'noteName and position required' }, { status: 400 });
  const a = createAdminClient();
  const { data: existing } = await a.from('notes').select('id').eq('name', noteName).maybeSingle();
  let noteId = existing?.id;
  if (!noteId) { const { data: created } = await a.from('notes').insert({ name: noteName }).select('id').single(); noteId = created?.id; }
  if (!noteId) return NextResponse.json({ error: 'Could not create note' }, { status: 500 });
  const { error } = await a.from('fragrance_notes').insert({ fragrance_id: params.id, note_id: noteId, position });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const d = checkAdminSecret(req); if (d) return d;
  const { noteId } = await req.json();
  const { error } = await createAdminClient().from('fragrance_notes').delete().eq('fragrance_id', params.id).eq('note_id', noteId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deleted: true });
}
