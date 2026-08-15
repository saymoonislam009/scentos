'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FragranceAutocomplete } from '@/components/FragranceAutocomplete';
import { AccordBars } from '@/components/fragrance/AccordBars';
import { PerfStat } from '@/components/fragrance/FragranceBadges';

type Side = { fragrance: any; dna: any; notes: any[]; accords: any[] } | null;

function CompareCol({ side, label }: { side: Side; label: string }) {
  if (!side) return (
    <div className="glass flex h-48 items-center justify-center rounded-2xl">
      <p className="text-sm text-ash">Select {label} fragrance</p>
    </div>
  );
  const { fragrance: f, dna, notes, accords } = side;
  const top = notes.filter((n: any) => n.position === 'top').map((n: any) => n.notes?.name).filter(Boolean);
  const mid = notes.filter((n: any) => n.position === 'mid').map((n: any) => n.notes?.name).filter(Boolean);
  const base = notes.filter((n: any) => n.position === 'base' || n.position === 'bottom').map((n: any) => n.notes?.name).filter(Boolean);
  return (
    <div className="space-y-5">
      <div className="glass rounded-2xl p-6">
        <p className="section-label mb-1">{f.brand?.name}</p>
        <h2 className="font-display text-2xl text-bone">{f.name}</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {f.concentration && <span className="badge border border-bone/15 text-ash">{f.concentration}</span>}
          {f.release_year && <span className="badge border border-bone/15 text-ash">{f.release_year}</span>}
          {f.price_tier_usd && <span className="font-display text-lg text-gold">${f.price_tier_usd}</span>}
        </div>
        {f.description && <p className="mt-4 text-sm leading-relaxed text-ash line-clamp-3">{f.description}</p>}
      </div>
      {notes.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <h3 className="mb-4 font-mono text-2xs uppercase tracking-wider text-ash">Notes</h3>
          <div className="space-y-2">
            {top.length > 0 && <div className="flex gap-2 flex-wrap"><span className="font-mono text-2xs text-electric w-8">Top</span>{top.map((n: string) => <span key={n} className="note-pill">{n}</span>)}</div>}
            {mid.length > 0 && <div className="flex gap-2 flex-wrap"><span className="font-mono text-2xs text-gold w-8">Mid</span>{mid.map((n: string) => <span key={n} className="note-pill">{n}</span>)}</div>}
            {base.length > 0 && <div className="flex gap-2 flex-wrap"><span className="font-mono text-2xs text-ash w-8">Base</span>{base.map((n: string) => <span key={n} className="note-pill">{n}</span>)}</div>}
          </div>
        </div>
      )}
      {accords.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <h3 className="mb-4 font-mono text-2xs uppercase tracking-wider text-ash">Accords</h3>
          <AccordBars accords={accords} />
        </div>
      )}
      {dna && (
        <div className="glass rounded-2xl p-5">
          <h3 className="mb-4 font-mono text-2xs uppercase tracking-wider text-ash">Performance</h3>
          <div className="space-y-3">
            <PerfStat label="Longevity" value={dna.longevity} />
            <PerfStat label="Projection" value={dna.projection} />
            <PerfStat label="Versatility" value={dna.versatility} />
            <PerfStat label="Sweetness" value={dna.sweetness} />
            <PerfStat label="Freshness" value={dna.freshness} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ComparePage() {
  const [left, setLeft] = useState<Side>(null);
  const [right, setRight] = useState<Side>(null);
  const [loading, setLoading] = useState({ left: false, right: false });

  async function selectLeft(id: string) {
    setLoading(l => ({ ...l, left: true }));
    const data = await loadFragranceById(id).catch(() => null);
    setLeft(data);
    setLoading(l => ({ ...l, left: false }));
  }

  async function selectRight(id: string) {
    setLoading(l => ({ ...l, right: true }));
    const data = await loadFragranceById(id).catch(() => null);
    setRight(data);
    setLoading(l => ({ ...l, right: false }));
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <p className="section-label mb-3">Head to Head</p>
      <h1 className="font-display text-4xl text-bone sm:text-5xl">Compare fragrances.</h1>
      <p className="mt-3 text-sm text-ash">Pick two fragrances to compare notes, accords, and performance side by side.</p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <div>
          <p className="mb-2 font-mono text-2xs uppercase tracking-wider text-ash">Fragrance A</p>
          <FragranceAutocomplete placeholder="Search first fragrance…" onSelect={selectLeft} />
        </div>
        <div>
          <p className="mb-2 font-mono text-2xs uppercase tracking-wider text-ash">Fragrance B</p>
          <FragranceAutocomplete placeholder="Search second fragrance…" onSelect={selectRight} />
        </div>
      </div>
      {(left || right) && (
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {loading.left ? <div className="space-y-4">{[...Array(4)].map((_,i)=><div key={i} className="h-32 animate-pulse rounded-2xl bg-obsidian2"/>)}</div> : <CompareCol side={left} label="A" />}
          {loading.right ? <div className="space-y-4">{[...Array(4)].map((_,i)=><div key={i} className="h-32 animate-pulse rounded-2xl bg-obsidian2"/>)}</div> : <CompareCol side={right} label="B" />}
        </div>
      )}
      {!left && !right && (
        <div className="mt-16 text-center text-ash">
          <p className="text-sm">Search for two fragrances above to start comparing.</p>
        </div>
      )}
    </div>
  );
}

async function loadFragranceById(id: string): Promise<Side> {
  const s = createClient();
  const { data: f } = await s.from('fragrances').select('*').eq('id', id).single();
  if (!f) return null;
  const [{ data: br }, { data: d }, { data: n }, { data: a }] = await Promise.all([
    s.from('brands').select('name').eq('id', f.brand_id).single(),
    s.from('dna_scores').select('*').eq('fragrance_id', f.id).maybeSingle(),
    s.from('fragrance_notes').select('position,notes(name)').eq('fragrance_id', f.id),
    s.from('fragrance_accords').select('strength,accords(name)').eq('fragrance_id', f.id),
  ]);
  return { fragrance: { ...f, brand: br }, dna: d, notes: n ?? [], accords: (a ?? []).map((x: any) => ({ name: (x.accords as any)?.name, strength: x.strength })).filter((x: any) => x.name) };
}
