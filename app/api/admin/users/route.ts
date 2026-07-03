import { NextRequest, NextResponse } from 'next/server';
import { checkAdminSecret } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  const denied = checkAdminSecret(req);
  if (denied) return denied;

  const admin = createAdminClient();
  const { data: profiles, error } = await admin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Cheap per-user counts done as follow-up queries rather than a nested
  // select, since collection_items/reviews/posts don't have a direct FK
  // back to profiles that PostgREST can embed in reverse without a view.
  const ids = profiles.map((p) => p.id);
  const [{ data: collectionCounts }, { data: reviewCounts }] = await Promise.all([
    admin.from('collection_items').select('user_id').in('user_id', ids),
    admin.from('reviews').select('user_id').in('user_id', ids),
  ]);

  const tally = (rows: { user_id: string }[] | null) => {
    const map = new Map<string, number>();
    for (const r of rows ?? []) map.set(r.user_id, (map.get(r.user_id) ?? 0) + 1);
    return map;
  };
  const collectionTally = tally(collectionCounts);
  const reviewTally = tally(reviewCounts);

  return NextResponse.json(
    profiles.map((p) => ({
      ...p,
      collection_count: collectionTally.get(p.id) ?? 0,
      review_count: reviewTally.get(p.id) ?? 0,
    })),
  );
}
