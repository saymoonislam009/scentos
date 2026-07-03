'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { DnaRadarChart } from '@/components/DnaRadarChart';

export default function FragranceDetailPage({ params }: { params: { slug: string } }) {
  const [fragrance, setFragrance] = useState<any | null>(null);
  const [genomeMatches, setGenomeMatches] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    (async () => {
      const { data: f } = await supabase.from('fragrances').select('*').eq('slug', params.slug).single();
      if (!f || !active) {
        setLoading(false);
        return;
      }

      const [{ data: brand }, { data: dna }, { data: notes }, { data: reviewRows }, { data: prices }, { data: genome }] =
        await Promise.all([
          supabase.from('brands').select('*').eq('id', f.brand_id).single(),
          supabase.from('dna_scores').select('*').eq('fragrance_id', f.id).maybeSingle(),
          supabase
            .from('fragrance_notes')
            .select('position, notes ( name )')
            .eq('fragrance_id', f.id),
          supabase
            .from('reviews')
            .select('*, profiles ( name )')
            .eq('fragrance_id', f.id)
            .order('created_at', { ascending: false })
            .limit(10),
          supabase
            .from('price_points')
            .select('*')
            .eq('fragrance_id', f.id)
            .eq('in_stock', true)
            .order('captured_at', { ascending: false }),
          supabase.rpc('match_fragrance_genome', { p_fragrance_id: f.id, p_match_count: 6 }),
        ]);

      if (!active) return;

      // De-dupe price points to the latest per retailer, cheapest first.
      const latestByRetailer = new Map<string, any>();
      for (const p of prices ?? []) if (!latestByRetailer.has(p.retailer)) latestByRetailer.set(p.retailer, p);
      const bestDeals = [...latestByRetailer.values()].sort((a, b) => a.price - b.price);

      let matches: any[] = [];
      if (genome && genome.length > 0) {
        const ids = genome.map((g: any) => g.fragrance_id);
        const { data: matchedFragrances } = await supabase
          .from('fragrances')
          .select('id, name, slug, price_tier_usd, brand_id')
          .in('id', ids);
        const brandIds = [...new Set((matchedFragrances ?? []).map((m) => m.brand_id))];
        const { data: matchedBrands } = await supabase.from('brands').select('id, name').in('id', brandIds);
        const brandById = new Map((matchedBrands ?? []).map((b) => [b.id, b]));
        const byId = new Map((matchedFragrances ?? []).map((m) => [m.id, m]));

        matches = genome.map((g: any) => {
          const mf = byId.get(g.fragrance_id);
          const isBudget = mf && f.price_tier_usd && mf.price_tier_usd && mf.price_tier_usd < f.price_tier_usd * 0.5;
          return {
            fragrance: mf ? { ...mf, brand: brandById.get(mf.brand_id) } : null,
            similarity: g.similarity,
            relationship: g.similarity > 0.92 ? 'clone' : isBudget ? 'budget-alternative' : 'similar',
          };
        });
      }

      setFragrance({ ...f, brand, dna, notes });
      setReviews(reviewRows ?? []);
      setDeals(bestDeals);
      setGenomeMatches(matches);
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [params.slug]);

  if (loading) return <div className="px-6 py-24 text-center text-ash">Loading…</div>;
  if (!fragrance) return <div className="px-6 py-24 text-center text-ash">Fragrance not found.</div>;

  const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : null;

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-xs uppercase tracking-wider text-ash">{fragrance.brand?.name}</p>
      <h1 className="mt-2 font-display text-4xl text-bone">{fragrance.name}</h1>
      {fragrance.description && <p className="mt-4 max-w-2xl text-ash">{fragrance.description}</p>}

      <div className="mt-6 flex flex-wrap gap-2 font-mono text-[11px] text-ash">
        {fragrance.notes?.map((n: any, i: number) => (
          <span key={i} className="hairline rounded-full px-3 py-1">
            {n.notes?.name} · {n.position}
          </span>
        ))}
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <h2 className="font-display text-lg text-bone">Fragrance DNA</h2>
          <p className="mt-1 text-xs text-ash">Derived from {fragrance.dna?.sample_size ?? 0} community reviews.</p>
          {fragrance.dna ? (
            <DnaRadarChart
              dna={{
                sweetness: fragrance.dna.sweetness,
                freshness: fragrance.dna.freshness,
                masculineFeminine: fragrance.dna.masculine_feminine,
                projection: fragrance.dna.projection,
                longevity: fragrance.dna.longevity,
                versatility: fragrance.dna.versatility,
              }}
            />
          ) : (
            <p className="mt-6 text-sm text-ash">Not enough reviews yet to plot a DNA profile.</p>
          )}
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="font-display text-lg text-bone">Best current deal</h2>
          {deals.length === 0 ? (
            <p className="mt-4 text-sm text-ash">No tracked prices yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {deals.map((d) => (
                <li key={d.id} className="flex items-center justify-between text-sm">
                  <span className="text-bone">{d.retailer}</span>
                  <a href={d.url} className="font-mono text-gold" target="_blank" rel="noreferrer">
                    ${Number(d.price).toFixed(2)}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-12">
        <h2 className="font-display text-lg text-bone">Fragrance Genome — similar &amp; alternatives</h2>
        {genomeMatches.length === 0 ? (
          <p className="mt-4 text-sm text-ash">
            No embedding yet for this fragrance — run the admin &ldquo;backfill embeddings&rdquo; action once
            OPENAI_API_KEY is set.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {genomeMatches.map((m: any) =>
              m.fragrance ? (
                <Link
                  key={m.fragrance.id}
                  href={`/fragrance/${m.fragrance.slug}`}
                  className="hairline rounded-xl p-4 transition-colors hover:border-bone/30"
                >
                  <p className="text-xs uppercase tracking-wider text-electric">{m.relationship}</p>
                  <p className="mt-1 text-sm text-bone">{m.fragrance.name}</p>
                  <p className="mt-1 font-mono text-xs text-ash">{Math.round(m.similarity * 100)}% match</p>
                </Link>
              ) : null,
            )}
          </div>
        )}
      </div>

      <div className="mt-12">
        <h2 className="font-display text-lg text-bone">
          Community rating
          {avgRating && <span className="ml-2 font-mono text-gold">{avgRating.toFixed(1)}★ ({reviews.length})</span>}
        </h2>
        <div className="mt-4 space-y-4">
          {reviews.map((r: any) => (
            <div key={r.id} className="hairline rounded-xl p-4">
              <p className="text-sm text-bone">{r.profiles?.name ?? 'Anonymous'}</p>
              <p className="mt-1 text-sm text-ash">{r.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
