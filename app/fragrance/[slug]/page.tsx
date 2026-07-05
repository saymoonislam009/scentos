'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Star, Package, Droplets, ShoppingBag } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/lib/useUser';
import { DnaRadarChart } from '@/components/DnaRadarChart';
import { AccordBars } from '@/components/fragrance/AccordBars';
import { NotePyramid } from '@/components/fragrance/NotePyramid';
import { SeasonBadges, OccasionBadges, PerfStat } from '@/components/fragrance/FragranceBadges';

const PROJECTION_LABELS: Record<string, string> = {
  intimate: 'Intimate', moderate: 'Moderate', strong: 'Strong', 'beast-mode': 'Beast mode',
};

export default function FragranceDetailPage({ params }: { params: { slug: string } }) {
  const { user } = useUser();
  const [fragrance, setFragrance] = useState<any>(null);
  const [brand, setBrand] = useState<any>(null);
  const [dna, setDna] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [accords, setAccords] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [genomeMatches, setGenomeMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inCollection, setInCollection] = useState(false);
  const [addingToCollection, setAddingToCollection] = useState(false);
  const [collectionType, setCollectionType] = useState('bottle');
  const [showCollectionMenu, setShowCollectionMenu] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 0, body: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    (async () => {
      const { data: f } = await supabase.from('fragrances').select('*').eq('slug', params.slug).single();
      if (!f || !active) { setLoading(false); return; }

      const [
        { data: br },
        { data: d },
        { data: n },
        { data: a },
        { data: r },
        { data: p },
        { data: g },
      ] = await Promise.all([
        supabase.from('brands').select('*').eq('id', f.brand_id).single(),
        supabase.from('dna_scores').select('*').eq('fragrance_id', f.id).maybeSingle(),
        supabase.from('fragrance_notes').select('position, notes ( name )').eq('fragrance_id', f.id),
        supabase.from('fragrance_accords').select('strength, accords ( name )').eq('fragrance_id', f.id),
        supabase.from('reviews').select('*, profiles ( name )').eq('fragrance_id', f.id).order('created_at', { ascending: false }).limit(20),
        supabase.from('price_points').select('*').eq('fragrance_id', f.id).eq('in_stock', true).order('captured_at', { ascending: false }),
        supabase.rpc('match_fragrance_genome', { p_fragrance_id: f.id, p_match_count: 8 }),
      ]);

      if (!active) return;

      // Deduplicate prices
      const retailerMap = new Map<string, any>();
      for (const pp of p ?? []) if (!retailerMap.has(pp.retailer)) retailerMap.set(pp.retailer, pp);
      setDeals([...retailerMap.values()].sort((a, b) => a.price - b.price));

      // Enrich genome matches
      let enrichedGenome: any[] = [];
      if (g && g.length > 0) {
        const ids = g.map((m: any) => m.fragrance_id);
        const { data: gf } = await supabase.from('fragrances').select('id, name, slug, price_tier_usd, brand_id').in('id', ids);
        const brandIds = [...new Set((gf ?? []).map((m: any) => m.brand_id))];
        const { data: gb } = await supabase.from('brands').select('id, name').in('id', brandIds);
        const bById = new Map((gb ?? []).map((b: any) => [b.id, b]));
        const fById = new Map((gf ?? []).map((m: any) => [m.id, m]));
        enrichedGenome = (g as any[]).map((m: any) => {
          const mf: any = fById.get(m.fragrance_id);
          const isBudget = mf && f.price_tier_usd && mf.price_tier_usd && mf.price_tier_usd < f.price_tier_usd * 0.5;
          return {
            fragrance: mf ? { ...mf, brand: bById.get(mf.brand_id) } : null,
            similarity: m.similarity,
            relationship: m.similarity > 0.92 ? 'clone' : isBudget ? 'budget alternative' : 'similar',
          };
        });
      }

      // Check if in user's collection
      if (user) {
        const { data: ci } = await supabase.from('collection_items').select('id').eq('user_id', user.id).eq('fragrance_id', f.id).maybeSingle();
        if (active) setInCollection(!!ci);
      }

      if (!active) return;
      setFragrance(f); setBrand(br); setDna(d);
      setNotes(n ?? []); setAccords(a ?? []);
      setReviews(r ?? []); setGenomeMatches(enrichedGenome);
      setLoading(false);
    })();

    return () => { active = false; };
  }, [params.slug, user]);

  async function addToCollection(type: string) {
    if (!user || !fragrance) return;
    setAddingToCollection(true);
    const supabase = createClient();
    await supabase.from('collection_items').insert({ user_id: user.id, fragrance_id: fragrance.id, type });
    setInCollection(true);
    setShowCollectionMenu(false);
    setAddingToCollection(false);
  }

  async function removeFromCollection() {
    if (!user || !fragrance) return;
    const supabase = createClient();
    await supabase.from('collection_items').delete().eq('user_id', user.id).eq('fragrance_id', fragrance.id);
    setInCollection(false);
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !fragrance || reviewForm.rating === 0) return;
    setSubmittingReview(true); setReviewError(null);
    const supabase = createClient();
    const { error } = await supabase.from('reviews').insert({
      user_id: user.id, fragrance_id: fragrance.id,
      rating: reviewForm.rating, body: reviewForm.body || null,
    });
    if (error) { setReviewError(error.message); }
    else {
      setReviewForm({ rating: 0, body: '' });
      // refresh reviews
      const { data: r } = await supabase.from('reviews').select('*, profiles ( name )').eq('fragrance_id', fragrance.id).order('created_at', { ascending: false }).limit(20);
      setReviews(r ?? []);
    }
    setSubmittingReview(false);
  }

  if (loading) return <div className="py-32 text-center text-ash">Loading…</div>;
  if (!fragrance) return <div className="py-32 text-center text-ash">Fragrance not found.</div>;

  const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : null;
  const accordsForDisplay = (accords ?? []).map((a: any) => ({ name: a.accords?.name, strength: a.strength })).filter((a) => a.name);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">

      {/* ── Hero ── */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <Link href="/database" className="font-mono text-xs text-ash hover:text-bone">← Database</Link>
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.2em] text-gold">{brand?.name}</p>
          <h1 className="mt-1 font-display text-4xl leading-tight text-bone sm:text-5xl">{fragrance.name}</h1>

          {/* Concentration + year */}
          <div className="mt-3 flex flex-wrap gap-2 font-mono text-xs text-ash">
            {fragrance.concentration && <span className="hairline rounded-full px-3 py-1">{fragrance.concentration}</span>}
            {fragrance.release_year && <span className="hairline rounded-full px-3 py-1">{fragrance.release_year}</span>}
            {fragrance.projection && <span className="hairline rounded-full px-3 py-1">{PROJECTION_LABELS[fragrance.projection] ?? fragrance.projection}</span>}
            {fragrance.longevity_hrs && <span className="hairline rounded-full px-3 py-1">{fragrance.longevity_hrs}h longevity</span>}
          </div>

          {/* Rating */}
          {avgRating && (
            <div className="mt-4 flex items-center gap-2">
              <div className="flex text-gold">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} size={16} fill={s <= Math.round(avgRating) ? 'currentColor' : 'none'} />
                ))}
              </div>
              <span className="font-mono text-sm text-bone">{avgRating.toFixed(1)}</span>
              <span className="text-xs text-ash">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
            </div>
          )}
        </div>

        {/* Collection button */}
        <div className="relative flex shrink-0 flex-col items-end gap-2">
          {user ? (
            inCollection ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-electric">In collection</span>
                <button onClick={removeFromCollection} className="hairline rounded-full px-4 py-2 text-xs text-ash hover:text-red-400">Remove</button>
              </div>
            ) : (
              <div className="relative">
                <button onClick={() => setShowCollectionMenu((o) => !o)} disabled={addingToCollection}
                  className="flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-medium text-matte disabled:opacity-50">
                  <Heart size={15} />
                  {addingToCollection ? 'Adding…' : 'Add to Collection'}
                </button>
                {showCollectionMenu && (
                  <div className="glass absolute right-0 top-11 z-10 w-44 rounded-xl p-2">
                    {['bottle', 'decant', 'wishlist'].map((t) => (
                      <button key={t} onClick={() => addToCollection(t)}
                        className="block w-full rounded-lg px-3 py-2 text-left text-sm capitalize text-bone hover:bg-bone/10">
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          ) : (
            <Link href="/sign-in" className="flex items-center gap-2 rounded-full border border-gold/40 px-5 py-2.5 text-sm text-gold">
              <Heart size={15} /> Sign in to collect
            </Link>
          )}

          {deals.length > 0 && (
            <a href={deals[0].url} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 rounded-full border border-bone/20 px-4 py-2 text-xs text-bone hover:border-bone/50">
              <ShoppingBag size={13} />
              Best deal: ${Number(deals[0].price).toFixed(2)} at {deals[0].retailer}
            </a>
          )}
        </div>
      </div>

      {/* ── Description ── */}
      {fragrance.description && (
        <p className="mt-6 max-w-2xl leading-relaxed text-ash">{fragrance.description}</p>
      )}

      {/* ── Season + Occasion ── */}
      {(fragrance.seasons?.length > 0 || fragrance.occasions?.length > 0) && (
        <div className="mt-6 flex flex-wrap gap-6">
          {fragrance.seasons?.length > 0 && (
            <div>
              <p className="mb-2 text-xs uppercase tracking-wider text-ash">Seasons</p>
              <SeasonBadges seasons={fragrance.seasons} />
            </div>
          )}
          {fragrance.occasions?.length > 0 && (
            <div>
              <p className="mb-2 text-xs uppercase tracking-wider text-ash">Occasions</p>
              <OccasionBadges occasions={fragrance.occasions} />
            </div>
          )}
        </div>
      )}

      {/* ── Main grid ── */}
      <div className="mt-10 grid gap-6 lg:grid-cols-2">

        {/* Note pyramid */}
        <div className="glass rounded-2xl p-6">
          <h2 className="mb-5 font-display text-lg text-bone">Note pyramid</h2>
          {notes.length > 0
            ? <NotePyramid notes={notes} />
            : <p className="text-sm text-ash">No notes catalogued yet.</p>
          }
        </div>

        {/* Accord bars */}
        <div className="glass rounded-2xl p-6">
          <h2 className="mb-5 font-display text-lg text-bone">Accords</h2>
          {accordsForDisplay.length > 0
            ? <AccordBars accords={accordsForDisplay} />
            : <p className="text-sm text-ash">No accords catalogued yet.</p>
          }
        </div>

        {/* DNA radar */}
        {dna && (
          <div className="glass rounded-2xl p-6">
            <h2 className="mb-1 font-display text-lg text-bone">Fragrance DNA</h2>
            <p className="mb-4 text-xs text-ash">Based on {dna.sample_size} community reviews</p>
            <DnaRadarChart dna={{
              sweetness: dna.sweetness, freshness: dna.freshness,
              masculineFeminine: dna.masculine_feminine, projection: dna.projection,
              longevity: dna.longevity, versatility: dna.versatility,
            }} />
          </div>
        )}

        {/* Performance bars */}
        {dna && (
          <div className="glass rounded-2xl p-6">
            <h2 className="mb-5 font-display text-lg text-bone">Performance stats</h2>
            <div className="space-y-4">
              <PerfStat label="Longevity" value={dna.longevity} />
              <PerfStat label="Projection (sillage)" value={dna.projection} />
              <PerfStat label="Versatility" value={dna.versatility} />
              <PerfStat label="Sweetness" value={dna.sweetness} />
              <PerfStat label="Freshness" value={dna.freshness} />
            </div>
          </div>
        )}
      </div>

      {/* ── Price tracking ── */}
      {deals.length > 0 && (
        <div className="glass mt-6 rounded-2xl p-6">
          <h2 className="mb-4 font-display text-lg text-bone">Where to buy</h2>
          <div className="divide-y divide-bone/10">
            {deals.map((d) => (
              <div key={d.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm text-bone">{d.retailer}</p>
                  <p className="font-mono text-xs text-ash">{d.currency}</p>
                </div>
                <a href={d.url} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 rounded-full bg-gold/15 px-4 py-1.5 text-sm font-medium text-gold hover:bg-gold/25">
                  ${Number(d.price).toFixed(2)} <span className="text-xs">↗</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Fragrance Genome ── */}
      <div className="mt-6">
        <h2 className="font-display text-lg text-bone">Similar fragrances</h2>
        <p className="mt-1 text-xs text-ash">Ranked by AI-computed scent similarity</p>
        {genomeMatches.length === 0 ? (
          <p className="mt-4 text-sm text-ash">
            Genome matching activates after an admin runs the embeddings backfill.
          </p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {genomeMatches.filter((m) => m.fragrance).map((m) => (
              <Link key={m.fragrance.id} href={`/fragrance/${m.fragrance.slug}`}
                className="glass rounded-xl p-4 transition-colors hover:border-bone/30">
                <span className={`text-[10px] font-mono uppercase tracking-wider ${
                  m.relationship === 'clone' ? 'text-red-400' :
                  m.relationship === 'budget alternative' ? 'text-electric' : 'text-gold'
                }`}>{m.relationship}</span>
                <p className="mt-1 text-sm font-medium text-bone">{m.fragrance.name}</p>
                <p className="text-xs text-ash">{m.fragrance.brand?.name}</p>
                <p className="mt-2 font-mono text-xs text-ash">{Math.round(m.similarity * 100)}% match</p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── Reviews ── */}
      <div className="mt-10">
        <h2 className="font-display text-lg text-bone">
          Community reviews
          {avgRating && <span className="ml-3 font-mono text-2xl text-gold">{avgRating.toFixed(1)}</span>}
        </h2>

        {/* Write a review */}
        {user ? (
          <form onSubmit={submitReview} className="glass mt-4 rounded-2xl p-5">
            <p className="mb-3 text-sm text-bone">Write a review</p>
            <div className="mb-3 flex gap-1">
              {[1,2,3,4,5].map((s) => (
                <button type="button" key={s} onClick={() => setReviewForm({ ...reviewForm, rating: s })}
                  className={`text-xl ${s <= reviewForm.rating ? 'text-gold' : 'text-bone/20'}`}>★</button>
              ))}
            </div>
            <textarea value={reviewForm.body} onChange={(e) => setReviewForm({ ...reviewForm, body: e.target.value })}
              placeholder="Your thoughts on this fragrance… (optional)"
              className="input min-h-[70px] resize-none text-sm" />
            {reviewError && <p className="mt-2 text-xs text-red-400">{reviewError}</p>}
            <button type="submit" disabled={submittingReview || reviewForm.rating === 0}
              className="mt-3 rounded-full bg-gold px-5 py-2 text-sm font-medium text-matte disabled:opacity-50">
              {submittingReview ? 'Submitting…' : 'Submit review'}
            </button>
          </form>
        ) : (
          <div className="mt-4 text-sm text-ash">
            <Link href="/sign-in" className="text-electric">Sign in</Link> to leave a review.
          </div>
        )}

        {/* Review list */}
        <div className="mt-5 space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="hairline rounded-xl p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-bone">{r.profiles?.name ?? 'Anonymous'}</p>
                <div className="flex text-gold text-sm">
                  {[1,2,3,4,5].map((s) => (
                    <span key={s} className={s <= r.rating ? 'text-gold' : 'text-bone/20'}>★</span>
                  ))}
                </div>
              </div>
              {r.body && <p className="mt-2 text-sm leading-relaxed text-ash">{r.body}</p>}
              <p className="mt-2 font-mono text-[10px] text-ash/50">
                {new Date(r.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
          {reviews.length === 0 && <p className="text-sm text-ash">No reviews yet — be the first.</p>}
        </div>
      </div>
    </div>
  );
}
