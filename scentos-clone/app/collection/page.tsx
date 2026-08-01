'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@/lib/useUser';
import { createClient } from '@/lib/supabase/client';
const TC: Record<string,string> = { bottle:'border-gold/30 bg-gold/[0.08] text-gold', decant:'border-electric/30 bg-electric/[0.08] text-electric', wishlist:'border-bone/15 text-ash', empty:'border-bone/10 text-ash/50' };
export default function CollectionPage() {
  const { user, loading: ul } = useUser();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  useEffect(() => {
    if (ul) return; if (!user) { setLoading(false); return; }
    createClient().from('collection_items').select('*,fragrances(name,seasons,brands(name),fragrance_notes(notes(name)))').order('created_at', { ascending: false }).then(({ data }) => { setItems(data ?? []); setLoading(false); });
  }, [user, ul]);
  const filtered = filter === 'all' ? items : items.filter(i => i.type === filter);
  const own = items.filter(i => ['bottle','decant'].includes(i.type));
  const value = own.reduce((s, i) => s + (i.purchase_price ?? 0), 0);
  const nc = new Map<string,number>();
  for (const i of own) for (const fn of (i.fragrances as any)?.fragrance_notes ?? []) { const n = fn.notes?.name; if (n) nc.set(n, (nc.get(n) ?? 0) + 1); }
  const topNote = [...nc.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <p className="section-label mb-3">Collection Manager</p>
      <h1 className="font-display text-4xl text-bone sm:text-5xl">Your shelf.</h1>
      {!user && !ul ? (
        <div className="glass mt-10 rounded-2xl p-10 text-center"><p className="text-ash">Sign in to track your bottles and decants.</p><Link href="/sign-in" className="btn-gold mt-6 inline-flex">Sign in</Link></div>
      ) : loading ? <div className="mt-10 grid gap-4 sm:grid-cols-3">{[...Array(3)].map((_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-obsidian2" />)}</div> : (
        <>
          {own.length > 0 && (
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[{l:'Bottles & decants',v:own.length},{l:'Est. value',v:`$${value.toFixed(0)}`},{l:'Wishlist',v:items.filter(i=>i.type==='wishlist').length},{l:'Top note',v:topNote??'—'}].map(c => (
                <div key={c.l} className="glass rounded-2xl p-5"><p className="font-mono text-2xs uppercase tracking-wider text-ash">{c.l}</p><p className="mt-2 font-display text-2xl text-gold truncate">{c.v}</p></div>
              ))}
            </div>
          )}
          <div className="mt-8 flex flex-wrap gap-2">
            {['all','bottle','decant','wishlist','empty'].map(t => (
              <button key={t} onClick={() => setFilter(t)} className={`badge border capitalize transition-colors ${filter === t ? 'border-gold/50 bg-gold/15 text-gold' : 'border-bone/10 text-ash hover:border-bone/20'}`}>
                {t}{t !== 'all' && ` (${items.filter(i => i.type === t).length})`}
              </button>
            ))}
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(item => (
              <div key={item.id} className="card p-5">
                <span className={`badge border text-2xs ${TC[item.type] ?? 'border-bone/15 text-ash'}`}>{item.type}</span>
                <h3 className="mt-2 font-display text-lg text-bone leading-snug">{(item.fragrances as any)?.name}</h3>
                <p className="text-xs text-ash">{(item.fragrances as any)?.brands?.name}</p>
                {item.ml_remaining != null && (
                  <div className="mt-4">
                    <div className="mb-1 flex justify-between"><span className="font-mono text-2xs text-ash">Remaining</span><span className="font-mono text-2xs text-bone">{item.ml_remaining}ml</span></div>
                    <div className="h-1 overflow-hidden rounded-full bg-bone/[0.06]"><div className="accord-bar h-full rounded-full" style={{ width: `${Math.min((item.ml_remaining / (item.bottle_size_ml || 100)) * 100, 100)}%` }} /></div>
                  </div>
                )}
                <button onClick={async () => { if (!confirm('Remove?')) return; await createClient().from('collection_items').delete().eq('id', item.id); setItems(p => p.filter(x => x.id !== item.id)); }} className="mt-4 text-2xs text-ash/40 hover:text-ember transition-colors">Remove</button>
              </div>
            ))}
            {filtered.length === 0 && <div className="col-span-full py-12 text-center"><p className="text-ash">Nothing here yet.</p><Link href="/database" className="mt-3 inline-block text-sm text-electric hover:underline">Browse fragrances →</Link></div>}
          </div>
        </>
      )}
    </div>
  );
}
