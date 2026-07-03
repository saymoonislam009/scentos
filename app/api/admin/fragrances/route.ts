import { NextRequest, NextResponse } from 'next/server';
import { checkAdminSecret } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';

function slugify(name: string, brand: string) {
  return `${brand}-${name}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export async function GET(req: NextRequest) {
  const denied = checkAdminSecret(req);
  if (denied) return denied;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('fragrances')
    .select('*, brands ( name ), dna_scores ( sample_size )')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const denied = checkAdminSecret(req);
  if (denied) return denied;

  const body = await req.json();
  const admin = createAdminClient();

  let brandId: string;
  const { data: existingBrand } = await admin.from('brands').select('id').eq('name', body.brandName).maybeSingle();
  if (existingBrand) {
    brandId = existingBrand.id;
  } else {
    const { data: newBrand, error: brandError } = await admin
      .from('brands')
      .insert({ name: body.brandName })
      .select('id')
      .single();
    if (brandError) return NextResponse.json({ error: brandError.message }, { status: 500 });
    brandId = newBrand.id;
  }

  const { data, error } = await admin
    .from('fragrances')
    .insert({
      slug: body.slug || slugify(body.name, body.brandName),
      name: body.name,
      brand_id: brandId,
      release_year: body.releaseYear,
      concentration: body.concentration,
      description: body.description,
      hero_image_url: body.heroImageUrl,
      price_tier_usd: body.priceTierUsd,
      seasons: body.seasons ?? [],
      occasions: body.occasions ?? [],
    })
    .select('*, brands ( name )')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
