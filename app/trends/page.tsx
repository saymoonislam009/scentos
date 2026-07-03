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

  useEffect(() => {
    const supabase = createClient();
    supabase
      .rpc('trending_fragrances', { p_days: 30, p_limit: 20 })
      .then(({ data }) => {
        setGlobal(data ?? []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('fragrances')
      .select('id, name, slug, brands ( name )')
      .contains('seasons', [season])
      .limit(12)
      .then(({ data }) => setBySeason(data ?? []));
  }, [season]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-electric">Trend Analytics</p>
      <h1 className="mt-3 font-display text-4xl text-bone">What&rsquo;s moving right now.</h1>

      <section className="mt-10">
        <h2 className="font-display text-lg text-bone">Trending — last 30 days</h2>
        {loading ? (
          <p className="mt-4 text-ash">Loading…</p>
        ) : global.length === 0 ? (
          <p className="mt-4 text-ash">Not enough activity yet to surface a trend signal.</p>
        ) : (
          <ol className="mt-4 space-y-2">
            {global.map((g: any, i: number) => (
              <li key={g.fragrance_id} className="hairline flex items-center justify-between rounded-xl p-4 text-sm">
                <span className="text-ash">
                  <span className="mr-3 font-mono text-gold">#{i + 1}</span>
                  <span className="text-bone">{g.name}</span> — {g.brand_name}
                </span>
                <span className="font-mono text-xs text-electric">{String(g.signal_count)} signals</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="mt-12">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-lg text-bone">By season</h2>
          <div className="flex gap-2">
            {SEASONS.map((s) => (
              <button
                key={s}
                onClick={() => setSeason(s)}
                className={`rounded-full px-3 py-1 text-xs capitalize transition-colors ${
                  season === s ? 'bg-gold text-matte' : 'bg-bone/5 text-ash hover:bg-bone/10'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bySeason.map((f: any) => (
            <Link key={f.id} href={`/fragrance/${f.slug}`} className="glass rounded-2xl p-5 transition-colors hover:border-bone/20">
              <p className="text-xs uppercase tracking-wider text-ash">{f.brands?.name}</p>
              <h3 className="mt-1 font-display text-lg text-bone">{f.name}</h3>
            </Link>
          ))}
          {bySeason.length === 0 && <p className="text-sm text-ash">No fragrances tagged for {season} yet.</p>}
        </div>
      </section>
    </div>
  );
}
