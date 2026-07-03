'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const SEASONS = ['spring', 'summer', 'fall', 'winter'];
const OCCASIONS = ['office', 'date-night', 'casual', 'formal'];

type FragranceRow = {
  id: string;
  slug: string;
  name: string;
  brand_id: string;
  price_tier_usd: number | null;
};

export default function DatabasePage() {
  const [query, setQuery] = useState('');
  const [season, setSeason] = useState<string | undefined>();
  const [occasion, setOccasion] = useState<string | undefined>();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const supabase = createClient();

    (async () => {
      const { data: rows, error } = await supabase.rpc('search_fragrances', {
        p_query: query || null,
        p_season: season ?? null,
        p_occasion: occasion ?? null,
        p_limit: 24,
      });

      if (error || !rows || !active) {
        if (active) setItems([]);
        return;
      }

      // search_fragrances returns bare fragrance rows — hydrate brand + DNA
      // for display in a second query rather than joining inside the function.
      const ids = (rows as FragranceRow[]).map((r) => r.id);
      const brandIds = [...new Set((rows as FragranceRow[]).map((r) => r.brand_id))];

      const [{ data: brands }, { data: dna }] = await Promise.all([
        supabase.from('brands').select('id, name').in('id', brandIds),
        supabase.from('dna_scores').select('*').in('fragrance_id', ids),
      ]);

      const brandById = new Map((brands ?? []).map((b) => [b.id, b]));
      const dnaByFragranceId = new Map((dna ?? []).map((d) => [d.fragrance_id, d]));

      if (active) {
        setItems(
          (rows as FragranceRow[]).map((f) => ({
            ...f,
            brand: brandById.get(f.brand_id),
            dna: dnaByFragranceId.get(f.id),
          })),
        );
      }
    })().finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [query, season, occasion]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-electric">Fragrance Database</p>
      <h1 className="mt-3 font-display text-4xl text-bone">Search the catalog.</h1>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name…"
          className="input max-w-sm"
        />
        <FilterPills label="Season" value={season} onChange={setSeason} options={SEASONS} />
        <FilterPills label="Occasion" value={occasion} onChange={setOccasion} options={OCCASIONS} />
      </div>

      <p className="mt-6 text-xs text-ash">{loading ? 'Searching…' : `${items.length} fragrances`}</p>

      <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((f) => (
          <Link key={f.id} href={`/fragrance/${f.slug}`} className="glass rounded-2xl p-6 transition-colors hover:border-bone/20">
            <p className="text-xs uppercase tracking-wider text-ash">{f.brand?.name}</p>
            <h3 className="mt-1 font-display text-xl text-bone">{f.name}</h3>
            {f.dna && (
              <div className="mt-4 flex gap-3 font-mono text-[10px] text-ash">
                <span>SWEET {Math.round(f.dna.sweetness * 10)}</span>
                <span>FRESH {Math.round(f.dna.freshness * 10)}</span>
                <span>LONG {Math.round(f.dna.longevity * 10)}</span>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

function FilterPills({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value?: string;
  onChange: (v: string | undefined) => void;
  options: string[];
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-ash">{label}:</span>
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(value === o ? undefined : o)}
          className={`rounded-full px-3 py-1 text-xs transition-colors ${
            value === o ? 'bg-gold text-matte' : 'bg-bone/5 text-ash hover:bg-bone/10'
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
