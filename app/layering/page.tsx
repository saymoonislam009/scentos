'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layers } from 'lucide-react';
import { useUser } from '@/lib/useUser';
import { createClient } from '@/lib/supabase/client';
import { api } from '@/lib/api';
export default function LayeringPage() {
  const { user, loading: ul } = useUser();
  const [collection, setCollection] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [combos, setCombos] = useState<any[]|null>(null);
  const [loading, setLoading] = useState(true);
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (ul) return; if (!user) { setLoading(false); return; }
    createClient().from('collection_items').select('fragrance_id,fragrances(name,brands(name))').in('type',['bottle','decant']).then(({data})=>{setCollection(data??[]);setLoading(false);});
  }, [user, ul]);
  function toggle(id: string) { setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]); }
  async function suggest() {
    if (selected.length < 2) { setError('Pick at least 2 fragrances.'); return; }
    setError(''); setThinking(true); setCombos(null);
    try { const r = await api.suggestLayering(selected); setCombos(r); }
    catch (e: any) { setError(e.message ?? 'Error.'); }
    finally { setThinking(false); }
  }
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="section-label mb-3">AI Layering Engine</p>
      <h1 className="font-display text-4xl text-bone sm:text-5xl">Combine what you own.</h1>
      <p className="mt-3 text-sm leading-relaxed text-ash">Pick two or more fragrances from your collection and ScentOS will suggest layering combinations.</p>
      {!user && !ul ? (
        <div className="glass mt-10 rounded-2xl p-10 text-center"><Layers size={24} className="mx-auto text-gold" /><p className="mt-3 text-ash">Sign in and add bottles to your collection.</p><Link href="/sign-in" className="btn-gold mt-6 inline-flex">Sign in</Link></div>
      ) : loading ? <div className="mt-8 grid gap-3 sm:grid-cols-2">{[...Array(4)].map((_,i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-obsidian2" />)}</div> : collection.length === 0 ? (
        <div className="hairline mt-10 rounded-2xl p-8 text-center"><p className="text-ash">Your collection is empty.</p><Link href="/database" className="mt-3 inline-block text-sm text-electric hover:underline">Browse fragrances →</Link></div>
      ) : (
        <>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {collection.map(item => (
              <button key={item.fragrance_id} onClick={() => toggle(item.fragrance_id)} className={`rounded-2xl border p-4 text-left transition-all ${selected.includes(item.fragrance_id) ? 'border-gold/50 bg-gold/[0.08] shadow-gold' : 'border-bone/8 hover:border-bone/20'}`}>
                <p className="font-medium text-bone">{(item.fragrances as any)?.name}</p>
                <p className="mt-0.5 text-xs text-ash">{(item.fragrances as any)?.brands?.name}</p>
                {selected.includes(item.fragrance_id) && <p className="mt-2 font-mono text-2xs text-gold">Selected ✓</p>}
              </button>
            ))}
          </div>
          {error && <p className="mt-4 text-sm text-ember">{error}</p>}
          <button onClick={suggest} disabled={thinking || selected.length < 2} className="btn-gold mt-6 disabled:opacity-40">
            <Layers size={15} />{thinking ? 'Generating…' : `Suggest combos (${selected.length} selected)`}
          </button>
          {combos && (
            <div className="mt-10 space-y-5">
              <h2 className="font-display text-2xl text-bone">Layering combinations</h2>
              {combos.map((combo: any, i: number) => (
                <div key={i} className="glass rounded-2xl p-6">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {combo.layers?.map((l: any, j: number) => (
                      <div key={j} className={`rounded-full border px-3 py-1.5 text-xs ${l.application === 'base' ? 'border-gold/30 bg-gold/[0.08] text-gold' : 'border-electric/30 bg-electric/[0.08] text-electric'}`}>
                        <span className="font-mono uppercase mr-1.5">{l.application}</span>
                        <span className="text-bone">{l.fragrance?.name}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-ash">{combo.expectedProfile}</p>
                  {combo.occasions?.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{combo.occasions.map((o: string) => <span key={o} className="badge border border-bone/10 text-ash capitalize">{o}</span>)}</div>}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
