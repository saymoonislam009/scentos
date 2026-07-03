import { NextRequest, NextResponse } from 'next/server';
import { checkAdminSecret } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  const denied = checkAdminSecret(req);
  if (denied) return denied;

  const admin = createAdminClient();
  const count = (table: string, filter?: (q: any) => any) => {
    let q = admin.from(table).select('*', { count: 'exact', head: true });
    if (filter) q = filter(q);
    return q.then(({ count }: any) => count ?? 0);
  };

  const [fragrances, brands, users, orders, activeListings, reviews, partialListings, openReports] = await Promise.all([
    count('fragrances'),
    count('brands'),
    count('profiles'),
    count('orders'),
    count('decant_listings', (q) => q.eq('status', 'active')),
    count('reviews'),
    count('partial_bottle_listings', (q) => q.eq('status', 'active')),
    count('reports', (q) => q.eq('status', 'open')),
  ]);

  return NextResponse.json({ fragrances, brands, users, orders, activeListings, reviews, partialListings, openReports });
}
