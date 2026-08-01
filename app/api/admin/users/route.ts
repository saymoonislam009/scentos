import { NextRequest, NextResponse } from 'next/server';
import { checkAdminSecret } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';
export async function GET(req: NextRequest) {
  const d = checkAdminSecret(req); if (d) return d;
  const a = createAdminClient();
  const { data: profiles, error } = await a.from('profiles').select('*').order('created_at', { ascending: false }).limit(200);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const ids = (profiles as any[]).map((p: any) => p.id);
  const [{ data: col }, { data: rev }] = await Promise.all([
    a.from('collection_items').select('user_id').in('user_id', ids),
    a.from('reviews').select('user_id').in('user_id', ids),
  ]);
  const tally = (rows: { user_id: string }[] | null) => { const m = new Map<string, number>(); for (const r of rows ?? []) m.set(r.user_id, (m.get(r.user_id) ?? 0) + 1); return m; };
  const ct = tally(col), rt = tally(rev);
  return NextResponse.json((profiles as any[]).map((p: any) => ({ ...p, collection_count: ct.get(p.id) ?? 0, review_count: rt.get(p.id) ?? 0 })));
}
