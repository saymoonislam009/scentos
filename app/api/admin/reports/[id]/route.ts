import { NextRequest, NextResponse } from 'next/server';
import { checkAdminSecret } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const denied = checkAdminSecret(req);
  if (denied) return denied;

  const body = await req.json();
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('reports')
    .update({ status: body.status })
    .eq('id', params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
