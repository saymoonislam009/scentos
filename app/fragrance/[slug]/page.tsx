'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/lib/useUser';
import { DnaRadarChart } from '@/components/DnaRadarChart';
import { AccordBars } from '@/components/fragrance/AccordBars';
import { NotePyramid } from '@/components/fragrance/NotePyramid';
import { SeasonBadges, OccasionBadges, PerfStat } from '@/components/fragrance/FragranceBadges';
import { PriceAlertButton } from '@/components/PriceAlertButton';
import { useToast } from '@/components/Toast';
import { scentColor } from '@/lib/scentColor';

const PROJ: Record<string,string> = { intimate:'Intimate', moderate:'Moderate', strong:'Strong', 'beast-mode':'Beast mode' };

export default function FragrancePage({ params }: { params: { slug: string } }) {
  const { toast } = useToast();
  const { user } = useUser();
  const [f, setF] = useState<any>(null);
  const [brand, setBrand] = useState<any>(null);
  const [dna, setDna] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [accords, setAccords] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [genome, setGenome] = useState<any[]>([]);
  const [inCol, setInCol] = useState(false);
  const [colMenu, setColMenu] = useState(false);
  const [adding, setAdding] = useState(false);
  const [rvForm, setRvForm] = useState({ rating: 0, body: '' });
  const [submittingRv, setSubmittingRv] = useState(false);
  const [rvError, setRvError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const s = createClient();
    (async () => {
      const { data: frag } = await s.from('fragrances').select('*').eq('slug', params.slug).single();
      if (!frag || !active) { setLoading(false); return; }
      const [
        { data: br }, { data: d }, { data: n }, { data: a },
        { data: r }, { data: p }, { data: g },
      ] = await Promise.all([
        s.from('brands').select('*').eq('id', frag.brand_id).single(),
        s.from('dna_scores').select('*').eq('fragrance_id', frag.id).maybeSingle(),
        s.from('fragrance_notes').select('position,notes(name)').eq('fragrance_id', frag.id),
        s.from('fragrance_accords').select('strength,accords(name)').eq('fragrance_id', frag.id),
        s.from('reviews').select('*,profiles(name)').eq('fragrance_id', frag.id).order('created_at', { ascending: false }).limit(20),
        s.from('price_points').select('*').eq('fragrance_id', frag.id).eq('in_stock', true).order('captured_at', { ascending: false }),
        s.rpc('match_fragrance_genome', { p_fragrance_id: frag.id, p_match_count: 8 }),
      ]);
      if (!active) return;
      const pm = new Map<string, any>();
      for (const pp of p ?? []) if (!pm.has(pp.retailer)) pm.set(pp.retailer, pp);
      setDeals([...pm.values()].sort((a: any, b: any) => a.price - b.price));
      let eg: any[] = [];
      if (g?.length) {
        const { data: gf } = await s.from('fragrances').select('id,name,slug,price_tier_usd,brand_id').in('id', (g as any[]).map((m: any) => m.fragrance_id));
        const bids = [...new Set((gf ?? []).map((m: any) => m.brand_id))];
        const { data: gb } = await s.from('brands').select('id,name').in('id', bids);
        const bm = new Map((gb ?? []).map((b: any) => [b.id, b]));
        const fm = new Map((gf ?? []).map((m: any) => [m.id, m]));
        eg = (g as any[]).map((m: any) => {
          const mf: any = fm.get(m.fragrance_id);
          const isBudget = mf && frag.price_tier_usd && mf.price_tier_usd && mf.price_tier_usd < frag.price_tier_usd * 0.5;
          return { fragrance: mf ? { ...mf, brand: bm.get(mf.brand_id) } : null, similarity: m.similarity, relationship: m.similarity > 0.92 ? 'clone' : isBudget ? 'budget alt' : 'similar' };
        });
      }
      if (user) {
        const { data: ci } = await s.from('collection_items').select('id').eq('user_id', user.id).eq('fragrance_id', frag.id).maybeSingle();
        if (active) setInCol(!!ci);
      }
      if (!active) return;
      setF(frag); setBrand(br); setDna(d); setNotes(n ?? []); setAccords(a ?? []); setReviews(r ?? []); setGenome(eg); setLoading(false);
      if (user) fetch('/api/recently-viewed', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fragranceId: frag.id }) }).catch(() => {});
      const lowestPrice = [...pm.values()].sort((a: any, b: any) => a.price - b.price)[0]?.price;
      if (user && lowestPrice != null) {
        fetch('/api/alerts/check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fragranceId: frag.id, lowestPrice: Number(lowestPrice) }) })
          .then(r => r.json())
          .then(({ triggered }) => {
            if (triggered?.length) toast(`Price alert! ${frag.name} dropped to $${triggered[0].currentPrice} (target was $${triggered[0].targetPrice}).`, 'success');
          }).catch(() => {});
      }
    })();
    return () => { active = false; };
  }, [params.slug, user]);

  async function addToCol(type: string) {
    if (!user || !f) return; setAdding(true);
    await createClient().from('collection_items').insert({ user_id: user.id, fragrance_id: f.id, type });
    setInCol(true); setColMenu(false); setAdding(false);
  }
  async function removeFromCol() {
    if (!user || !f) return;
    await createClient().from('collection_items').delete().eq('user_id', user.id).eq('fragrance_id', f.id);
    setInCol(false);
  }
  async function submitReview(e: React.FormEvent) {
    e.preventDefault(); if (!user || !f || rvForm.rating === 0) return;
    setSubmittingRv(true); setRvError('');
    const { error } = await createClient().from('reviews').insert({ user_id: user.id, fragrance_id: f.id, rating: rvForm.rating, body: rvForm.body || null });
    if (error) { setRvError(error.message); setSubmittingRv(false); return; }
    setRvForm({ rating: 0, body: '' });
    const { data: r } = await createClient().from('reviews').select('*,profiles(name)').eq('fragrance_id', f.id).order('created_at', { ascending: false }).limit(20);
    setReviews(r ?? []); setSubmittingRv(false);
  }

  if (loading) return <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6"><div className="space-y-4">{[...Array(4)].map((_,i) => <div key={i} className="h-32 animate-pulse rounded-2xl bg-obsidian2" />)}</div></div>;
  if (!f) return <div className="flex min-h-[60vh] items-center justify-center px-4"><div className="text-center"><p className="font-display text-2xl text-bone">Fragrance not found.</p><Link href="/database" className="mt-4 inline-block text-sm text-electric hover:underline">← Database</Link></div></div>;

  const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : null;
  const accordList = accords.map((a: any) => ({ name: (a.accords as any)?.name, strength: a.strength })).filter((a: any) => a.name);

  const accent = scentColor(dna);

  return (
    <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6">
      {accent && (
        <div className="pointer-events-none absolute -top-8 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full opacity-[0.16] blur-[90px] sm:h-96 sm:w-96" style={{ background: accent }} aria-hidden="true" />
      )}
      <Link href="/database" className="relative mb-6 inline-block font-mono text-2xs text-ash hover:text-bone">← Database</Link>
      <div className="relative flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 min-w-0">
          <div className="mb-2 flex items-center gap-2.5">
            {accent && <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: accent, boxShadow: `0 0 10px ${accent}` }} />}
            <p className="section-label">{brand?.name}</p>
          </div>
          <h1 className="font-display text-4xl leading-tight text-bone sm:text-6xl">{f.name}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {f.concentration && <span className="badge border border-bone/15 text-ash">{f.concentration}</span>}
            {f.release_year && <span className="badge border border-bone/15 text-ash">{f.release_year}</span>}
            {f.projection && <span className="badge border border-bone/15 text-ash">{PROJ[f.projection] ?? f.projection}</span>}
            {f.longevity_hrs && <span className="badge border border-bone/15 text-ash">{f.longevity_hrs}h longevity</span>}
          </div>
          {avgRating && (
            <div className="mt-4 flex items-center gap-2">
              <span className="stars text-lg">{'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}</span>
              <span className="font-mono text-sm text-gold">{avgRating.toFixed(1)}</span>
              <span className="text-xs text-ash">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
            </div>
          )}
          {f.description && <p className="mt-5 max-w-xl leading-relaxed text-ash">{f.description}</p>}
        </div>
        <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
          {user ? (
            inCol ? (
              <div className="flex items-center gap-3">
                <span className="font-mono text-2xs text-electric">In collection</span>
                <button onClick={removeFromCol} className="text-xs text-ash hover:text-ember">Remove</button>
              </div>
            ) : (
              <div className="relative">
                <button onClick={() => setColMenu(o => !o)} disabled={adding} className="btn-gold disabled:opacity-50">
                  <Heart size={14} /> {adding ? 'Adding…' : 'Add to Collection'}
                </button>
                {colMenu && (
                  <div className="glass absolute right-0 top-11 z-10 w-44 rounded-xl p-2">
                    {['bottle','decant','wishlist'].map(t => <button key={t} onClick={() => addToCol(t)} className="block w-full rounded-lg px-3 py-2.5 text-left text-sm capitalize text-bone hover:bg-bone/8">{t}</button>)}
                  </div>
                )}
              </div>
            )
          ) : <Link href="/sign-in" className="btn-ghost text-sm"><Heart size={14} />Sign in to collect</Link>}
          <div className="flex flex-wrap items-center gap-2">
            {deals.length > 0 && <a href={deals[0].url} target="_blank" rel="noreferrer" className="btn-ghost text-xs"><ShoppingBag size={12} />From ${Number(deals[0].price).toFixed(2)} at {deals[0].retailer}<ExternalLink size={10} /></a>}
            <PriceAlertButton fragranceId={f.id} currentPrice={deals[0]?.price ?? f.price_tier_usd} />
          </div>
        </div>
      </div>

      {(f.seasons?.length > 0 || f.occasions?.length > 0) && (
        <div className="mt-6 flex flex-wrap gap-6">
          {f.seasons?.length > 0 && <div><p className="mb-2 font-mono text-2xs uppercase tracking-wider text-ash">Seasons</p><SeasonBadges seasons={f.seasons} /></div>}
          {f.occasions?.length > 0 && <div><p className="mb-2 font-mono text-2xs uppercase tracking-wider text-ash">Occasions</p><OccasionBadges occasions={f.occasions} /></div>}
        </div>
      )}
      <div className="mt-4 divider-gold" />

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-2xl p-6"><h2 className="mb-5 font-display text-xl text-bone">Note pyramid</h2>{notes.length > 0 ? <NotePyramid notes={notes} /> : <p className="text-sm text-ash">No notes catalogued yet.</p>}</div>
        <div className="glass rounded-2xl p-6"><h2 className="mb-5 font-display text-xl text-bone">Accords</h2>{accordList.length > 0 ? <AccordBars accords={accordList} /> : <p className="text-sm text-ash">No accords catalogued yet.</p>}</div>
        {dna && <div className="glass rounded-2xl p-6"><h2 className="mb-1 font-display text-xl text-bone">Fragrance DNA</h2><p className="mb-4 font-mono text-2xs text-ash">Based on {dna.sample_size} community reviews</p><DnaRadarChart dna={{ sweetness: dna.sweetness, freshness: dna.freshness, masculineFeminine: dna.masculine_feminine, projection: dna.projection, longevity: dna.longevity, versatility: dna.versatility }} /></div>}
        {dna && <div className="glass rounded-2xl p-6"><h2 className="mb-5 font-display text-xl text-bone">Performance</h2><div className="space-y-5"><PerfStat label="Longevity" value={dna.longevity} /><PerfStat label="Projection" value={dna.projection} /><PerfStat label="Versatility" value={dna.versatility} /><PerfStat label="Sweetness" value={dna.sweetness} /><PerfStat label="Freshness" value={dna.freshness} /></div></div>}
      </div>

      {deals.length > 0 && (
        <div className="glass mt-6 rounded-2xl p-6">
          <h2 className="mb-4 font-display text-xl text-bone">Where to buy</h2>
          <div className="divide-y divide-bone/[0.06]">
            {deals.map(d => (
              <div key={d.id} className="flex items-center justify-between py-3">
                <p className="text-bone">{d.retailer}</p>
                <a href={d.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full bg-gold/10 border border-gold/20 px-4 py-1.5 text-sm text-gold hover:bg-gold/20">${Number(d.price).toFixed(2)} <ExternalLink size={12} /></a>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="mb-2 font-display text-xl text-bone">Similar fragrances</h2>
        <p className="mb-5 font-mono text-2xs text-ash">Ranked by AI-computed scent similarity</p>
        {genome.length === 0 ? (
          <div className="hairline rounded-2xl p-6 text-sm text-ash">Genome matching activates after running the embeddings backfill in the admin panel.</div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {genome.filter(m => m.fragrance).map(m => (
              <Link key={m.fragrance.id} href={`/fragrance/${m.fragrance.slug}`} className="card p-4">
                <span className={`font-mono text-2xs ${m.relationship === 'clone' ? 'text-ember' : m.relationship === 'budget alt' ? 'text-electric' : 'text-gold'}`}>{m.relationship}</span>
                <p className="mt-2 font-medium text-bone leading-snug">{m.fragrance.name}</p>
                <p className="mt-0.5 text-xs text-ash">{m.fragrance.brand?.name}</p>
                <p className="mt-3 font-mono text-2xs text-ash">{Math.round(m.similarity * 100)}% match</p>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mt-10">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="font-display text-xl text-bone">Community reviews</h2>
          {avgRating && <div className="text-right"><p className="font-display text-3xl text-gold">{avgRating.toFixed(1)}</p><p className="font-mono text-2xs text-ash">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p></div>}
        </div>
        {user ? (
          <form onSubmit={submitReview} className="glass mb-6 rounded-2xl p-5">
            <p className="mb-3 text-sm font-medium text-bone">Write a review</p>
            <div className="mb-4 flex gap-1">
              {[1,2,3,4,5].map(s => <button type="button" key={s} onClick={() => setRvForm(f => ({ ...f, rating: s }))} className={`text-2xl transition-colors ${s <= rvForm.rating ? 'text-gold' : 'text-bone/20 hover:text-gold/50'}`}>★</button>)}
            </div>
            <textarea value={rvForm.body} onChange={e => setRvForm(f => ({ ...f, body: e.target.value }))} rows={3} placeholder="Your thoughts…" className="input resize-none" />
            {rvError && <p className="mt-2 text-xs text-ember">{rvError}</p>}
            <button type="submit" disabled={submittingRv || rvForm.rating === 0} className="btn-gold mt-4 disabled:opacity-50">{submittingRv ? 'Submitting…' : 'Post review'}</button>
          </form>
        ) : <div className="hairline mb-6 rounded-xl p-4 text-sm text-ash"><Link href="/sign-in" className="text-electric">Sign in</Link> to leave a review.</div>}
        <div className="space-y-4">
          {reviews.map(r => (
            <div key={r.id} className="glass rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div><p className="font-medium text-bone">{(r.profiles as any)?.name ?? 'Anonymous'}</p><p className="mt-0.5 font-mono text-2xs text-ash">{new Date(r.created_at).toLocaleDateString()}</p></div>
                <div className="flex shrink-0 text-gold">{'★'.repeat(r.rating)}<span className="text-bone/20">{'★'.repeat(5 - r.rating)}</span></div>
              </div>
              {r.body && <p className="mt-3 leading-relaxed text-ash">{r.body}</p>}
            </div>
          ))}
          {reviews.length === 0 && <p className="text-ash">No reviews yet — be the first.</p>}
        </div>
      </div>
    </div>
  );
}
