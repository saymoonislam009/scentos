import { NextRequest, NextResponse } from 'next/server';
import { checkAdminSecret } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';
import { insertFragranceWithDetails, type ImportFragrance } from '@/lib/fragranceImport';

export async function POST(req: NextRequest) {
  const d = checkAdminSecret(req); if (d) return d;
  const body = await req.json().catch(() => null);
  const items: ImportFragrance[] = body?.fragrances;
  if (!Array.isArray(items) || items.length === 0) return NextResponse.json({ error: 'No fragrances provided' }, { status: 400 });
  if (items.length > 300) return NextResponse.json({ error: 'Too many items (max 300 per import)' }, { status: 400 });

  const a = createAdminClient();
  const { data: slugRows } = await a.from('fragrances').select('slug');
  const existingSlugs = new Set((slugRows ?? []).map((r: any) => r.slug));

  const results: { row: number; name: string; status: 'ok' | 'error'; error?: string }[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const res = await insertFragranceWithDetails(a, item, existingSlugs);
    if (res.ok === true) results.push({ row: i + 1, name: item.name || '(unnamed)', status: 'ok' });
    else results.push({ row: i + 1, name: item.name || '(unnamed)', status: 'error', error: (res as { ok: false; error: string }).error });
  }
  const ok = results.filter(r => r.status === 'ok').length;
  const failed = results.filter(r => r.status === 'error').length;
  return NextResponse.json({ ok, failed, results });
}
