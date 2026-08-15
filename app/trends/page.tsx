'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
const SEASONS = ['spring', 'summer', 'fall', 'winter'];
export default function TrendsPage() {
  const [global, setGlobal] = useState<any[]>([]);
  const [season, setSeason] = useState('summer');
  const [bySeason, setBySeason] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { createClient().rpc('trending_fragrances', { p_days: 30, p_limit: 20 }).then(({ data }) => { setGlobal(data ?? []); setLoading(false); }); }, []);
  useEffect(() => { createClient().from('fragrances').select('id,name,slug,brands(name)').contains('seasons', [season]).order('created_at', { ascending: false }).limit(12).then(({ data }) => setBySeason(data ?? [])); }, [season]);
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <p className="section-label mb-3">Trend Analytics</p>
      <h1 className="font-display text-4xl text-bone sm:text-5xl">What&rsquo;s moving.</h1>
      <section className="mt-12">
        <h2 className="font-display text-2xl text-bone">Trending — last 30 days</h2>
        {loading ? <div className="mt-5 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-14 animate-pulse rounded-xl bg-obsidian2" />)}</div> : global.length === 0 ? <p className="mt-5 text-ash">Not enough activity yet.</p> : (
          <ol className="mt-5 space-y-2">{global.map((g: any, i: number) => (
            <li key={g.fragrance_id} className="glass flex items-center justify-between rounded-xl px-5 py-4">
              <div className="flex items-center gap-4"><span className="w-6 font-display text-lg text-gold/50">#{i + 1}</span><div><p className="text-bone">{g.name}</p><p className="font-mono text-2xs text-ash">{g.brand_name}</p></div></div>
              <span className="font-mono text-2xs text-electric">{String(g.signal_count)} signals</span>
            </li>
          ))}</ol>
        )}
      </section>
      <div className="mt-12 divider-gold" />
      <section className="mt-12">
        <div className="flex flex-wrap items-center gap-4">
          <h2 className="font-display text-2xl text-bone">By season</h2>
          <div className="flex gap-2">{SEASONS.map(s => <button key={s} onClick={() => setSeason(s)} className={`badge !py-2 border capitalize transition-colors ${season === s ? 'border-gold/50 bg-gold/15 text-gold' : 'border-bone/10 text-ash hover:border-bone/20'}`}>{s}</button>)}</div>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bySeason.map((f: any) => <Link key={f.id} href={`/fragrance/${f.slug}`} className="card p-5"><p className="section-label text-2xs">{(f.brands as any)?.name}</p><h3 className="mt-2 font-display text-xl text-bone">{f.name}</h3></Link>)}
          {bySeason.length === 0 && <p className="col-span-full text-sm text-ash">No fragrances tagged for {season} yet.</p>}
        </div>
      </section>
    </div>
  );
}
