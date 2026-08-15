'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrendingUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { scentColor } from '@/lib/scentColor';

export function TrendingRail() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const s = createClient();
    s.rpc('trending_fragrances', { p_days: 30, p_limit: 6 }).then(async ({ data }) => {
      const rows = data ?? [];
      const ids = rows.map((r: any) => r.fragrance_id);
      const { data: dna } = ids.length ? await s.from('dna_scores').select('fragrance_id,sweetness,freshness').in('fragrance_id', ids) : { data: [] as any[] };
      const dMap = new Map((dna ?? []).map((d: any) => [d.fragrance_id, d]));
      setItems(rows.map((r: any) => ({ ...r, dna: dMap.get(r.fragrance_id) })));
      setLoading(false);
    });
  }, []);
  if (!loading && items.length === 0) return null;
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-4 flex items-center gap-2">
        <TrendingUp size={14} className="text-gold" />
        <p className="section-label">Trending this month</p>
      </div>
      {loading ? (
        <div className="flex gap-3 overflow-x-auto pb-2">{[...Array(4)].map((_, i) => <div key={i} className="h-24 w-56 shrink-0 animate-pulse rounded-2xl bg-obsidian2" />)}</div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          {items.map((g: any, i: number) => (
            <Link key={g.fragrance_id} href={`/fragrance/${g.slug}`} className="card relative w-56 shrink-0 overflow-hidden p-4">
              <span className="absolute inset-x-0 top-0 h-[3px]" style={{ background: scentColor(g.dna) ?? 'rgba(237,232,223,0.08)' }} />
              <div className="flex items-center justify-between">
                <span className="font-display text-lg text-gold/50">#{i + 1}</span>
                <span className="font-mono text-2xs text-electric">{String(g.signal_count)} signals</span>
              </div>
              <p className="mt-2 font-display text-base text-bone leading-snug line-clamp-2">{g.name}</p>
              <p className="mt-0.5 text-xs text-ash">{g.brand_name}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
