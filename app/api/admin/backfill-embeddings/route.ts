import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { checkAdminSecret } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
export async function POST(req: NextRequest) {
  const d = checkAdminSecret(req); if (d) return d;
  const a = createAdminClient();
  const { data: fragrances, error } = await a.from('fragrances').select('id,name,description,brands(name),fragrance_notes(notes(name)),fragrance_accords(accords(name))').is('embedding', null);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!fragrances?.length) return NextResponse.json({ updated: 0, total: 0 });
  let updated = 0;
  for (const f of fragrances as any[]) {
    const text = [
      `${f.name} by ${(f.brands as any)?.name}`,
      `Notes: ${(f.fragrance_notes ?? []).map((n: any) => n.notes?.name).filter(Boolean).join(', ')}`,
      `Accords: ${(f.fragrance_accords ?? []).map((ac: any) => ac.accords?.name).filter(Boolean).join(', ')}`,
      f.description ?? '',
    ].join('. ');
    try {
      const res = await openai.embeddings.create({ model: 'text-embedding-3-small', input: text });
      const { error: uErr } = await a.from('fragrances').update({ embedding: res.data[0].embedding }).eq('id', f.id);
      if (!uErr) updated++;
    } catch {}
  }
  return NextResponse.json({ updated, total: fragrances.length });
}
