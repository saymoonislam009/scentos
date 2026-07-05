import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return NextResponse.json({ inquiries: [] });

  const admin = createAdminClient();
  // All pending inquiries on this seller's listings
  const { data } = await admin
    .from('partial_listing_inquiries')
    .select('*, partial_bottle_listings ( perfume_name, seller_id ), profiles ( name, email )')
    .eq('status', 'pending')
    .eq('partial_bottle_listings.seller_id', userData.user.id)
    .order('created_at', { ascending: false });

  return NextResponse.json({ inquiries: data ?? [] });
}

export async function PATCH(req: NextRequest) {
  const { id, status } = await req.json();
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('partial_listing_inquiries')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
