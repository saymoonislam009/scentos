import type { SupabaseClient } from '@supabase/supabase-js';

export function slugify(name: string, brand: string): string {
  return `${brand}-${name}`.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/(^-|-$)/g, '');
}

export type ImportNote = { name: string; position: 'top' | 'mid' | 'base' };
export type ImportAccord = { name: string; strength?: number };
export type ImportFragrance = {
  name: string;
  brand: string;
  concentration?: string;
  description?: string;
  priceTierUsd?: number;
  releaseYear?: number;
  longevityHrs?: number;
  projection?: string;
  seasons?: string[];
  occasions?: string[];
  notes?: { top?: string[]; mid?: string[]; base?: string[] };
  accords?: { name: string; strength?: number }[];
};

const brandCache = new Map<string, string>();

export async function upsertBrand(a: SupabaseClient, name: string): Promise<string | null> {
  const key = name.trim().toLowerCase();
  if (brandCache.has(key)) return brandCache.get(key)!;
  const { data: existing } = await a.from('brands').select('id').ilike('name', name.trim()).maybeSingle();
  if (existing) { brandCache.set(key, existing.id); return existing.id; }
  const { data: created, error } = await a.from('brands').insert({ name: name.trim() }).select('id').single();
  if (error || !created) return null;
  brandCache.set(key, created.id);
  return created.id;
}

const noteCache = new Map<string, string>();
async function upsertNote(a: SupabaseClient, name: string): Promise<string | null> {
  const key = name.trim().toLowerCase();
  if (noteCache.has(key)) return noteCache.get(key)!;
  const { data: existing } = await a.from('notes').select('id').ilike('name', name.trim()).maybeSingle();
  if (existing) { noteCache.set(key, existing.id); return existing.id; }
  const { data: created } = await a.from('notes').insert({ name: name.trim() }).select('id').single();
  if (created) noteCache.set(key, created.id);
  return created?.id ?? null;
}

const accordCache = new Map<string, string>();
async function upsertAccord(a: SupabaseClient, name: string): Promise<string | null> {
  const key = name.trim().toLowerCase();
  if (accordCache.has(key)) return accordCache.get(key)!;
  const { data: existing } = await a.from('accords').select('id').ilike('name', name.trim()).maybeSingle();
  if (existing) { accordCache.set(key, existing.id); return existing.id; }
  const { data: created } = await a.from('accords').insert({ name: name.trim() }).select('id').single();
  if (created) accordCache.set(key, created.id);
  return created?.id ?? null;
}

const VALID_SEASONS = new Set(['spring', 'summer', 'fall', 'winter']);
const VALID_OCCASIONS = new Set(['office', 'date-night', 'casual', 'formal']);

export async function insertFragranceWithDetails(a: SupabaseClient, f: ImportFragrance, existingSlugs: Set<string>): Promise<{ ok: true; slug: string } | { ok: false; error: string }> {
  const name = (f.name ?? '').trim();
  const brandName = (f.brand ?? '').trim();
  if (!name || !brandName) return { ok: false, error: 'name and brand required' };
  const brandId = await upsertBrand(a, brandName);
  if (!brandId) return { ok: false, error: `Could not resolve brand: ${brandName}` };
  const slug = slugify(name, brandName);
  if (existingSlugs.has(slug)) return { ok: false, error: 'Already exists' };

  const seasons = (f.seasons ?? []).filter(s => VALID_SEASONS.has(s));
  const occasions = (f.occasions ?? []).filter(o => VALID_OCCASIONS.has(o));

  const { data: created, error } = await a.from('fragrances').insert({
    slug, name, brand_id: brandId,
    concentration: f.concentration || null,
    description: f.description || null,
    price_tier_usd: f.priceTierUsd ?? null,
    release_year: f.releaseYear ?? null,
    longevity_hrs: f.longevityHrs ?? null,
    projection: f.projection || null,
    seasons, occasions,
  }).select('id').single();
  if (error || !created) return { ok: false, error: error?.message ?? 'Insert failed' };
  existingSlugs.add(slug);

  const noteRows: { fragrance_id: string; note_id: string; position: string }[] = [];
  for (const pos of ['top', 'mid', 'base'] as const) {
    for (const noteName of f.notes?.[pos] ?? []) {
      const noteId = await upsertNote(a, noteName);
      if (noteId) noteRows.push({ fragrance_id: created.id, note_id: noteId, position: pos });
    }
  }
  if (noteRows.length) await a.from('fragrance_notes').insert(noteRows);

  const accordRows: { fragrance_id: string; accord_id: string; strength: number }[] = [];
  for (const acc of f.accords ?? []) {
    const accordId = await upsertAccord(a, acc.name);
    if (accordId) accordRows.push({ fragrance_id: created.id, accord_id: accordId, strength: acc.strength ?? 0.75 });
  }
  if (accordRows.length) await a.from('fragrance_accords').insert(accordRows);

  return { ok: true, slug };
}
