import { NextRequest, NextResponse } from 'next/server';
import { checkAdminSecret } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  const denied = checkAdminSecret(req);
  if (denied) return denied;

  const admin = createAdminClient();
  const { data: listings, error } = await admin
    .from('partial_bottle_listings')
    .select('*, profiles ( name, email )')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const ids = listings.map((l) => l.id);
  const [{ data: inquiries }, { data: reports }] = await Promise.all([
    admin.from('partial_listing_inquiries').select('listing_id').in('listing_id', ids),
    admin.from('reports').select('listing_id').in('listing_id', ids),
  ]);

  const tally = (rows: { listing_id: string }[] | null) => {
    const map = new Map<string, number>();
    for (const r of rows ?? []) map.set(r.listing_id, (map.get(r.listing_id) ?? 0) + 1);
    return map;
  };
  const inquiryTally = tally(inquiries);
  const reportTally = tally(reports);

  return NextResponse.json(
    listings.map((l) => ({
      ...l,
      inquiry_count: inquiryTally.get(l.id) ?? 0,
      report_count: reportTally.get(l.id) ?? 0,
    })),
  );
}
