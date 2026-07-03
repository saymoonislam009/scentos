import { NextRequest, NextResponse } from 'next/server';
import { checkAdminSecret } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const denied = checkAdminSecret(req);
  if (denied) return denied;

  const body = await req.json();
  const admin = createAdminClient();

  // toggle-discontinued comes through as a body flag rather than a
  // separate route, to keep the admin route surface small.
  if (body.toggleDiscontinued) {
    const { data: current } = await admin.from('fragrances').select('discontinued').eq('id', params.id).single();
    const { data, error } = await admin
      .from('fragrances')
      .update({ discontinued: !current?.discontinued })
      .eq('id', params.id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  const { data, error } = await admin.from('fragrances').update(body).eq('id', params.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const denied = checkAdminSecret(req);
  if (denied) return denied;

  const admin = createAdminClient();
  const { error } = await admin.from('fragrances').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deleted: true });
}
