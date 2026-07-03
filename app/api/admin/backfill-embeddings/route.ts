import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { checkAdminSecret } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const denied = checkAdminSecret(req);
  if (denied) return denied;

  const admin = createAdminClient();
  const { data: fragrances, error } = await admin
    .from('fragrances')
    .select('id, name, description, brands ( name ), fragrance_notes ( notes ( name ) ), fragrance_accords ( accords ( name ) )')
    .is('embedding', null);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!fragrances || fragrances.length === 0) {
    return NextResponse.json({ updated: 0, message: 'Every fragrance already has an embedding.' });
  }

  let updated = 0;
  for (const f of fragrances as any[]) {
    const text = [
      `${f.name} by ${f.brands?.name}`,
      `Notes: ${(f.fragrance_notes ?? []).map((n: any) => n.notes?.name).filter(Boolean).join(', ')}`,
      `Accords: ${(f.fragrance_accords ?? []).map((a: any) => a.accords?.name).filter(Boolean).join(', ')}`,
      f.description ?? '',
    ].join('. ');

    const embeddingResponse = await openai.embeddings.create({ model: 'text-embedding-3-small', input: text });
    const embedding = embeddingResponse.data[0].embedding;

    const { error: updateError } = await admin.from('fragrances').update({ embedding }).eq('id', f.id);
    if (!updateError) updated += 1;
  }

  return NextResponse.json({ updated, total: fragrances.length });
}
