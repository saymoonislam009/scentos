'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@/lib/useUser';
import { createClient } from '@/lib/supabase/client';

export default function CollectionPage() {
  const { user, loading: userLoading } = useUser();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    const supabase = createClient();
    // RLS already scopes this to the signed-in user — no .eq('user_id', ...) needed.
    supabase
      .from('collection_items')
      .select('*, fragrances ( name, seasons, fragrance_notes ( notes ( name ) ), brands ( name ) )')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setItems(data ?? []);
        setLoading(false);
      });
  }, [user, userLoading]);

  const bottlesAndDecants = items.filter((i) => i.type === 'bottle' || i.type === 'decant');
  const collectionValue = bottlesAndDecants.reduce((sum, i) => sum + (i.purchase_price ?? 0), 0);

  const noteCounts = new Map<string, number>();
  for (const item of bottlesAndDecants) {
    for (const fn of item.fragrances?.fragrance_notes ?? []) {
      const name = fn.notes?.name;
      if (name) noteCounts.set(name, (noteCounts.get(name) ?? 0) + 1);
    }
  }
  const topNote = [...noteCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-electric">Collection Manager</p>
      <h1 className="mt-3 font-display text-4xl text-bone">Your shelf.</h1>

      {!user && !userLoading ? (
        <div className="glass mt-10 rounded-2xl p-8 text-center">
          <p className="text-ash">Sign in to track bottles, decants, and wishlist items.</p>
          <Link href="/sign-in" className="mt-4 inline-block rounded-full bg-gold px-6 py-2.5 text-sm font-medium text-matte">
            Sign in
          </Link>
        </div>
      ) : loading ? (
        <p className="mt-8 text-ash">Loading your collection…</p>
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Stat label="Collection value" value={`$${collectionValue.toFixed(0)}`} />
            <Stat label="Bottles & decants" value={String(bottlesAndDecants.length)} />
            <Stat label="Top note" value={topNote} />
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div key={item.id} className="glass rounded-2xl p-5">
                <p className="text-xs uppercase tracking-wider text-ash">{item.type}</p>
                <h3 className="mt-1 font-display text-lg text-bone">{item.fragrances?.name}</h3>
                <p className="text-xs text-ash">{item.fragrances?.brands?.name}</p>
                {item.ml_remaining != null && (
                  <p className="mt-3 font-mono text-xs text-electric">{item.ml_remaining}ml remaining</p>
                )}
              </div>
            ))}
            {items.length === 0 && (
              <p className="text-sm text-ash">Nothing here yet — add bottles from any fragrance page.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-2xl p-5">
      <p className="text-xs uppercase tracking-wider text-ash">{label}</p>
      <p className="mt-2 font-display text-2xl text-gold">{value}</p>
    </div>
  );
}
