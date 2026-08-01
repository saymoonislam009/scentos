import { NextRequest, NextResponse } from 'next/server';
import { checkAdminSecret } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';
export async function GET(req: NextRequest) {
  const d = checkAdminSecret(req); if (d) return d;
  const a = createAdminClient();
  const { data: listings, error } = await a.from('partial_bottle_listings').select('*,profiles(name,email)').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const ids = (listings as any[]).map((l: any) => l.id);
  const [{ data: inq }, { data: rep }] = await Promise.all([
    a.from('partial_listing_inquiries').select('listing_id').in('listing_id', ids),
    a.from('reports').select('listing_id').in('listing_id', ids),
  ]);
  const tally = (rows: { listing_id: string }[] | null) => { const m = new Map<string, number>(); for (const r of rows ?? []) m.set(r.listing_id, (m.get(r.listing_id) ?? 0) + 1); return m; };
  const it = tally(inq), rt = tally(rep);
  return NextResponse.json((listings as any[]).map((l: any) => ({ ...l, inquiry_count: it.get(l.id) ?? 0, report_count: rt.get(l.id) ?? 0 })));
}
