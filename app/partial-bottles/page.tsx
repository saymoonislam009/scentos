'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@/lib/useUser';
import { createClient } from '@/lib/supabase/client';

export default function PartialBottlesPage() {
  const { user } = useUser();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function refresh() {
    setLoading(true);
    const supabase = createClient();
    supabase
      .from('partial_bottle_listings')
      .select('*, profiles ( name )')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setListings(data ?? []);
        setLoading(false);
      });
  }

  useEffect(refresh, []);

  async function requestToBuy(listingId: string) {
    if (!user) return;
    setActioning(listingId);
    const supabase = createClient();
    const { error } = await supabase
      .from('partial_listing_inquiries')
      .insert({ listing_id: listingId, buyer_id: user.id });
    setActioning(null);
    setNotice(error ? `Could not send request: ${error.message}` : 'Request sent — the seller can now see your interest.');
  }

  async function report(listingId: string, reportedUserId: string) {
    if (!user) return;
    const reason = window.prompt('What\u2019s wrong with this listing? (e.g. scam, fake bottle, inappropriate)');
    if (!reason) return;
    const supabase = createClient();
    const { error } = await supabase.from('reports').insert({
      listing_id: listingId,
      reported_user_id: reportedUserId,
      reason,
    });
    setNotice(error ? `Could not file report: ${error.message}` : 'Report sent to the admin team. Thanks for flagging it.');
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-electric">Used Bottle Marketplace</p>
          <h1 className="mt-3 font-display text-4xl text-bone">Partial bottles, sold directly.</h1>
          <p className="mt-3 max-w-xl text-sm text-ash">
            Anyone can browse — sellers list their own contact info and arrange payment and handoff
            directly (online payment or face-to-face). You&rsquo;ll need an account to request a purchase or
            list your own bottle.
          </p>
        </div>
        <Link
          href={user ? '/partial-bottles/new' : '/sign-in'}
          className="rounded-full bg-gold px-5 py-2.5 text-sm font-medium text-matte"
        >
          Sell a bottle
        </Link>
      </div>

      {notice && (
        <div className="glass mt-6 rounded-xl p-4 text-sm text-bone">
          {notice}{' '}
          <button onClick={() => setNotice(null)} className="ml-2 text-ash underline">
            dismiss
          </button>
        </div>
      )}

      {loading ? (
        <p className="mt-8 text-ash">Loading listings…</p>
      ) : listings.length === 0 ? (
        <p className="mt-8 text-ash">No partial bottles listed right now.</p>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((l) => (
            <div key={l.id} className="glass rounded-2xl p-6">
              {l.brand_name && <p className="text-xs uppercase tracking-wider text-ash">{l.brand_name}</p>}
              <h3 className="mt-1 font-display text-lg text-bone">{l.perfume_name}</h3>

              <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px] text-ash">
                <span className="hairline rounded-full px-2 py-0.5">{l.percent_left}% left</span>
                {l.days_used != null && <span className="hairline rounded-full px-2 py-0.5">{l.days_used}d used</span>}
                <span className="hairline rounded-full px-2 py-0.5">{l.has_box ? 'With box' : 'No box'}</span>
                <span className="hairline rounded-full px-2 py-0.5">{l.payment_method}</span>
              </div>

              <p className="mt-3 font-mono text-sm text-gold">
                {l.currency} {Number(l.price).toFixed(0)}
              </p>
              {l.location && <p className="mt-1 text-xs text-ash">📍 {l.location}</p>}
              {l.description && <p className="mt-2 text-sm text-ash">{l.description}</p>}

              <p className="mt-3 text-xs text-bone">
                Seller: {l.profiles?.name ?? 'anonymous'} · <span className="text-electric">{l.contact_info}</span>
              </p>

              <div className="mt-4 flex gap-3 text-xs">
                {user ? (
                  user.id === l.seller_id ? (
                    <span className="text-ash">This is your listing</span>
                  ) : (
                    <>
                      <button
                        onClick={() => requestToBuy(l.id)}
                        disabled={actioning === l.id}
                        className="rounded-full bg-gold/15 px-3 py-1.5 text-gold disabled:opacity-50"
                      >
                        {actioning === l.id ? 'Sending…' : 'Request to buy'}
                      </button>
                      <button onClick={() => report(l.id, l.seller_id)} className="text-ash hover:text-red-400">
                        Report
                      </button>
                    </>
                  )
                ) : (
                  <Link href="/sign-in" className="text-electric">
                    Sign in to request or report
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
