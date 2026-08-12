import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Called when a fragrance page loads its prices. If the signed-in user has
 * an untriggered alert for this fragrance and the lowest current price is
 * at or below their target, mark it triggered and tell the client — this is
 * how the price-alert loop actually closes without needing email/cron infra.
 */
export async function POST(req: NextRequest) {
  const s = createClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return NextResponse.json({ triggered: [] });

  const { fragranceId, lowestPrice } = await req.json().catch(() => ({}));
  if (!fragranceId || typeof lowestPrice !== 'number') return NextResponse.json({ triggered: [] });

  const a = createAdminClient();
  const { data: alert } = await a.from('price_alerts').select('*').eq('user_id', user.id).eq('fragrance_id', fragranceId).eq('triggered', false).maybeSingle();
  if (!alert || lowestPrice > Number(alert.target_price)) return NextResponse.json({ triggered: [] });

  await a.from('price_alerts').update({ triggered: true, triggered_at: new Date().toISOString() }).eq('id', alert.id);
  return NextResponse.json({ triggered: [{ id: alert.id, targetPrice: alert.target_price, currentPrice: lowestPrice }] });
}
