import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const s = createClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return NextResponse.json([]);
  const a = createAdminClient();
  const { data } = await a.from('recently_viewed').select('fragrance_id,viewed_at,fragrances(name,slug,brands(name))').eq('user_id', user.id).order('viewed_at', { ascending: false }).limit(8);
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const s = createClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return NextResponse.json({ ok: true }); // silently no-op for guests
  const { fragranceId } = await req.json();
  if (!fragranceId) return NextResponse.json({ error: 'fragranceId required' }, { status: 400 });
  const a = createAdminClient();
  await a.from('recently_viewed').upsert({ user_id: user.id, fragrance_id: fragranceId, viewed_at: new Date().toISOString() }, { onConflict: 'user_id,fragrance_id' });
  return NextResponse.json({ ok: true });
}
