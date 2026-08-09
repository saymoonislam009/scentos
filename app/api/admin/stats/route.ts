import { NextRequest, NextResponse } from 'next/server';
import { checkAdminSecret } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';
export async function GET(req: NextRequest) {
  const d = checkAdminSecret(req); if (d) return d;
  const a = createAdminClient();
  const cnt = async (t: string, f?: (q: any) => any) => { let q = a.from(t).select('*', { count: 'exact', head: true }); if (f) q = f(q); const { count: c } = await q; return c ?? 0; };
  const [fragrances, brands, users, orders, activeListings, reviews, partialListings, openReports] = await Promise.all([
    cnt('fragrances'), cnt('brands'), cnt('profiles'), cnt('orders'),
    cnt('decant_listings', q => q.eq('status', 'active')), cnt('reviews'),
    cnt('partial_bottle_listings', q => q.eq('status', 'active')), cnt('reports', q => q.eq('status', 'open')),
  ]);

  // Top brands by fragrance count
  const { data: allFrags } = await a.from('fragrances').select('brand_id');
  const brandCounts = new Map<string, number>();
  for (const f of allFrags ?? []) brandCounts.set(f.brand_id, (brandCounts.get(f.brand_id) ?? 0) + 1);
  const topBrandIds = [...brandCounts.entries()].sort((x, y) => y[1] - x[1]).slice(0, 8);
  const { data: brandNames } = await a.from('brands').select('id,name').in('id', topBrandIds.map(([id]) => id));
  const nameMap = new Map((brandNames ?? []).map((b: any) => [b.id, b.name]));
  const topBrands = topBrandIds.map(([id, count]) => ({ name: nameMap.get(id) ?? '—', count }));

  // Collection activity last 14 days
  const since = new Date(Date.now() - 14 * 86400000).toISOString();
  const { data: recentCollection } = await a.from('collection_items').select('created_at').gte('created_at', since);
  const dayBuckets = new Map<string, number>();
  for (let i = 13; i >= 0; i--) { const d2 = new Date(Date.now() - i * 86400000); dayBuckets.set(d2.toISOString().slice(0, 10), 0); }
  for (const c of recentCollection ?? []) { const day = c.created_at.slice(0, 10); if (dayBuckets.has(day)) dayBuckets.set(day, (dayBuckets.get(day) ?? 0) + 1); }
  const activityTrend = [...dayBuckets.entries()].map(([date, count]) => ({ date: date.slice(5), count }));

  return NextResponse.json({ fragrances, brands, users, orders, activeListings, reviews, partialListings, openReports, topBrands, activityTrend });
}
