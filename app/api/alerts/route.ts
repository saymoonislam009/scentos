import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sanitizeNumber } from '@/lib/sanitize';
import { rateLimit } from '@/lib/rateLimit';

export async function GET() {
  const s = createClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data } = await createAdminClient().from('price_alerts').select('*,fragrances(name,slug,brands(name))').eq('user_id', user.id).order('created_at', { ascending: false });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const s = createClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!rateLimit(`alerts:${user.id}`, 10, 60000)) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  const body = await req.json();
  const targetPrice = sanitizeNumber(body.targetPrice, 0, 100000);
  if (!body.fragranceId || !targetPrice) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  const { data, error } = await createAdminClient().from('price_alerts').upsert({ user_id: user.id, fragrance_id: body.fragranceId, target_price: targetPrice, triggered: false, triggered_at: null }, { onConflict: 'user_id,fragrance_id' }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const s = createClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const { error } = await createAdminClient().from('price_alerts').delete().eq('id', id).eq('user_id', user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deleted: true });
}
