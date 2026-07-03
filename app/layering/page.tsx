'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@/lib/useUser';
import { createClient } from '@/lib/supabase/client';
import { api } from '@/lib/api';

export default function LayeringPage() {
  const { user, loading: userLoading } = useUser();
  const [collection, setCollection] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [combos, setCombos] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    const supabase = createClient();
    supabase
      .from('collection_items')
      .select('fragrance_id, fragrances ( name, brands ( name ) )')
      .in('type', ['bottle', 'decant'])
      .then(({ data }) => {
        setCollection(data ?? []);
        setLoading(false);
      });
  }, [user, userLoading]);

  function toggle(fragranceId: string) {
    setSelected((s) => (s.includes(fragranceId) ? s.filter((id) => id !== fragranceId) : [...s, fragranceId]));
  }

  async function suggest() {
    if (selected.length < 2) {
      setError('Pick at least two fragrances to layer.');
      return;
    }
    setError(null);
    setThinking(true);
    try {
      const result = await api.suggestLayering(selected);
      setCombos(result);
    } catch (e: any) {
      setError(e.message ?? 'Could not generate combinations.');
    } finally {
      setThinking(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-electric">AI Layering Engine</p>
      <h1 className="mt-3 font-display text-4xl text-bone">Combine what you own.</h1>
      <p className="mt-3 text-sm text-ash">
        Pick two or more fragrances from your collection and ScentOS will suggest layering combinations —
        which to apply as a base, which as an accent, and what occasions each works for.
      </p>

      {!user && !userLoading ? (
        <div className="glass mt-8 rounded-2xl p-8 text-center">
          <p className="text-ash">Sign in to layer fragrances from your collection.</p>
          <Link href="/sign-in" className="mt-4 inline-block rounded-full bg-gold px-6 py-2.5 text-sm font-medium text-matte">
            Sign in
          </Link>
        </div>
      ) : (
        <>
          {loading ? (
            <p className="mt-8 text-ash">Loading your collection…</p>
          ) : collection.length === 0 ? (
            <p className="mt-8 text-ash">Add a few bottles to your collection first.</p>
          ) : (
            <>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {collection.map((item) => (
                  <button
                    key={item.fragrance_id}
                    onClick={() => toggle(item.fragrance_id)}
                    className={`rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                      selected.includes(item.fragrance_id) ? 'border-gold bg-gold/10 text-bone' : 'border-bone/10 text-ash'
                    }`}
                  >
                    <p className="text-bone">{item.fragrances?.name}</p>
                    <p className="text-xs text-ash">{item.fragrances?.brands?.name}</p>
                  </button>
                ))}
              </div>

              {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

              <button
                onClick={suggest}
                disabled={thinking}
                className="mt-6 rounded-full bg-gold px-6 py-2.5 text-sm font-medium text-matte disabled:opacity-50"
              >
                {thinking ? 'Thinking through combinations…' : 'Suggest layering combos'}
              </button>
            </>
          )}

          {combos && (
            <div className="mt-10 space-y-5">
              {combos.map((combo: any, i: number) => (
                <div key={i} className="glass rounded-2xl p-6">
                  <div className="flex flex-wrap gap-3">
                    {combo.layers?.map((l: any, j: number) => (
                      <span key={j} className="hairline rounded-full px-3 py-1 text-xs">
                        <span className="text-electric uppercase">{l.application}</span>{' '}
                        <span className="text-bone">{l.fragrance?.name}</span>
                      </span>
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-ash">{combo.expectedProfile}</p>
                  {combo.occasions?.length > 0 && (
                    <p className="mt-2 font-mono text-xs text-gold">{combo.occasions.join(' · ')}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
