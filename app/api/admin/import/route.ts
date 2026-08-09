import { NextRequest, NextResponse } from 'next/server';
import { checkAdminSecret } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';
function slugify(n: string, b: string) { return `${b}-${n}`.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/(^-|-$)/g, ''); }
export async function POST(req: NextRequest) {
  const d = checkAdminSecret(req); if (d) return d;
  const { rows } = await req.json();
  if (!Array.isArray(rows) || rows.length === 0) return NextResponse.json({ error: 'No rows' }, { status: 400 });
  const a = createAdminClient();
  const brandNames = [...new Set(rows.map((r: any) => (r.brand || r.brand_name || '').trim()).filter(Boolean))];
  const brandMap = new Map<string, string>();
  for (const name of brandNames) {
    const { data: ex } = await a.from('brands').select('id').eq('name', name).maybeSingle();
    if (ex) { brandMap.set(name, ex.id); } else { const { data: cr } = await a.from('brands').insert({ name }).select('id').single(); if (cr) brandMap.set(name, cr.id); }
  }
  const { data: slugRows } = await a.from('fragrances').select('slug');
  const slugSet = new Set((slugRows ?? []).map((r: any) => r.slug));
  const results: any[] = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const name = (row.name || '').trim();
    const brandName = (row.brand || row.brand_name || '').trim();
    if (!name || !brandName) { results.push({ row: i + 1, name: name || '(empty)', status: 'error', error: 'name and brand required' }); continue; }
    const brandId = brandMap.get(brandName);
    if (!brandId) { results.push({ row: i + 1, name, status: 'error', error: `Brand not found: ${brandName}` }); continue; }
    const slug = slugify(name, brandName);
    if (slugSet.has(slug)) { results.push({ row: i + 1, name, status: 'error', error: 'Already exists' }); continue; }
    const parseList = (v: string | undefined) => v ? v.split('|').map((s: string) => s.trim()).filter(Boolean) : [];
    const { error } = await a.from('fragrances').insert({ slug, name, brand_id: brandId, concentration: row.concentration || null, description: row.description || null, price_tier_usd: row.price_tier_usd ? Number(row.price_tier_usd) : null, release_year: row.release_year ? Number(row.release_year) : null, seasons: parseList(row.seasons), occasions: parseList(row.occasions) });
    if (error) { results.push({ row: i + 1, name, status: 'error', error: error.message }); } else { slugSet.add(slug); results.push({ row: i + 1, name, status: 'ok' }); }
  }
  const ok = results.filter(r => r.status === 'ok').length;
  const failed = results.filter(r => r.status === 'error').length;
  return NextResponse.json({ ok, failed, results });
}
