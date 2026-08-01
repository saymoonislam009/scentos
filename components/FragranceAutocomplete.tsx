'use client';
import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search } from 'lucide-react';
interface Props { onSelect: (id: string, name: string, brandName: string) => void; placeholder?: string; value?: string; }
export function FragranceAutocomplete({ onSelect, placeholder = 'Search fragrance…', value }: Props) {
  const [query, setQuery] = useState(value ?? '');
  const [results, setResults] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);
  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const t = setTimeout(async () => {
      const s = createClient();
      const { data } = await s.from('fragrances').select('id,name,brands(name)').ilike('name', `%${query}%`).limit(8);
      setResults(data ?? []); setOpen(true);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);
  function select(f: any) {
    const bn = f.brands?.name ?? '';
    setQuery(`${f.name}${bn ? ` — ${bn}` : ''}`);
    setOpen(false); onSelect(f.id, f.name, bn);
  }
  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ash" />
        <input value={query} onChange={e => { setQuery(e.target.value); setOpen(true); }} onFocus={() => query.length >= 2 && setOpen(true)} placeholder={placeholder} className="input pl-8" />
      </div>
      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-bone/10 bg-obsidian2 shadow-glass">
          {results.map(f => (
            <button key={f.id} type="button" onClick={() => select(f)} className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-bone/5">
              <span className="text-bone">{f.name}</span><span className="text-xs text-ash">{f.brands?.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
