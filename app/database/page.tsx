'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
const SEASONS = ['spring','summer','fall','winter'];
const OCCASIONS = ['office','date-night','casual','formal'];
export default function DatabasePage() {
  const [query, setQuery] = useState('');
  const [season, setSeason] = useState('');
  const [occasion, setOccasion] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    let active = true; setLoading(true);
    const s = createClient();
    (async () => {
      const { data: rows, error } = await s.rpc('search_fragrances', { p_query: query || null, p_season: season || null, p_occasion: occasion || null, p_limit: 24 });
      if (!rows || error || !active) { if (active) { setItems([]); setLoading(false); } return; }
      const ids = (rows as any[]).map((r: any) => r.id);
      const brandIds = [...new Set((rows as any[]).map((r: any) => r.brand_id))];
      const [{ data: brands }, { data: dna }] = await Promise.all([
        s.from('brands').select('id,name').in('id', brandIds),
        s.from('dna_scores').select('*').in('fragrance_id', ids),
      ]);
      if (!active) return;
      const bMap = new Map((brands ?? []).map((b: any) => [b.id, b]));
      const dMap = new Map((dna ?? []).map((d: any) => [d.fragrance_id, d]));
      setItems((rows as any[]).map((f: any) => ({ ...f, brand: bMap.get(f.brand_id), dna: dMap.get(f.id) })));
      setLoading(false);
    })();
    return () => { active = false; };
  }, [query, season, occasion]);
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <p className="section-label mb-3">Fragrance Database</p>
      <h1 className="font-display text-4xl text-bone sm:text-5xl mb-8">Explore the catalog.</h1>
      <div className="glass rounded-2xl p-4 sm:p-5 mb-6">
        <div className="relative mb-4"><Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ash" /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name or brand…" className="input pl-10" /></div>
        <div className="flex flex-wrap gap-4">
          <div><p className="mb-2 font-mono text-2xs uppercase tracking-wider text-ash">Season</p><div className="flex flex-wrap gap-1.5">{SEASONS.map(s => <button key={s} onClick={() => setSeason(season === s ? '' : s)} className={`badge !py-2 border capitalize transition-colors ${season === s ? 'border-gold/50 bg-gold/15 text-gold' : 'border-bone/10 text-ash hover:border-bone/20'}`}>{s}</button>)}</div></div>
          <div><p className="mb-2 font-mono text-2xs uppercase tracking-wider text-ash">Occasion</p><div className="flex flex-wrap gap-1.5">{OCCASIONS.map(o => <button key={o} onClick={() => setOccasion(occasion === o ? '' : o)} className={`badge !py-2 border capitalize transition-colors ${occasion === o ? 'border-gold/50 bg-gold/15 text-gold' : 'border-bone/10 text-ash hover:border-bone/20'}`}>{o.replace('-', ' ')}</button>)}</div></div>
        </div>
      </div>
      <p className="mb-4 font-mono text-2xs text-ash">{loading ? 'Searching…' : `${items.length} results`}</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading ? [...Array(8)].map((_, i) => <div key={i} className="h-48 animate-pulse rounded-2xl bg-obsidian2" />) : items.map(f => (
          <Link key={f.id} href={`/fragrance/${f.slug}`} className="card flex flex-col p-5">
            <p className="section-label text-2xs">{f.brand?.name}</p>
            <h3 className="mt-2 font-display text-xl text-bone leading-snug">{f.name}</h3>
            {f.concentration && <span className="mt-2 inline-block self-start badge border border-bone/10 text-ash">{f.concentration}</span>}
            {f.dna && (
              <div className="mt-4 flex-1 space-y-2">
                {[{label:'Longevity',val:f.dna.longevity},{label:'Projection',val:f.dna.projection},{label:'Versatility',val:f.dna.versatility}].map(({ label, val }) => (
                  <div key={label}>
                    <div className="mb-1 flex justify-between"><span className="font-mono text-2xs text-ash/60">{label}</span><span className="font-mono text-2xs text-ash">{val}/10</span></div>
                    <div className="h-1 overflow-hidden rounded-full bg-bone/[0.06]"><div className="accord-bar h-full rounded-full" style={{ width: `${val * 10}%` }} /></div>
                  </div>
                ))}
              </div>
            )}
            {f.price_tier_usd && <p className="mt-4 font-display text-lg text-gold">${f.price_tier_usd}</p>}
          </Link>
        ))}
        {!loading && items.length === 0 && (
          <div className="col-span-full py-16 text-center">
            <p className="text-ash">No fragrances match your filters.</p>
            <button onClick={() => { setQuery(''); setSeason(''); setOccasion(''); }} className="mt-4 text-sm text-electric hover:underline">Clear filters</button>
          </div>
        )}
      </div>
    </div>
  );
}
