'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@/lib/useUser';
import { createClient } from '@/lib/supabase/client';

export default function MarketplacePage() {
  const { user } = useUser();
  const [listings, setListings] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ fragranceId: '', mlAmount: '5', price: '', condition: 'used-decant' });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [buying, setBuying] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function refreshListings() {
    setLoading(true);
    const supabase = createClient();
    supabase
      .from('decant_listings')
      .select('*, fragrances ( name, brands ( name ) ), profiles ( name )')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setListings(data ?? []);
        setLoading(false);
      });
  }

  function refreshOrders() {
    if (!user) return;
    const supabase = createClient();
    // RLS scopes this to orders where the signed-in user is buyer or seller.
    supabase
      .from('orders')
      .select('*, decant_listings ( fragrances ( name, brands ( name ) ) )')
      .order('created_at', { ascending: false })
      .then(({ data }) => setOrders(data ?? []));
  }

  useEffect(refreshListings, []);
  useEffect(refreshOrders, [user]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const supabase = createClient();
    const { error: insertError } = await supabase.from('decant_listings').insert({
      seller_id: user!.id,
      fragrance_id: form.fragranceId,
      ml_amount: Number(form.mlAmount),
      price: Number(form.price),
      condition: form.condition,
    });
    if (insertError) {
      setError(insertError.message);
    } else {
      setForm({ fragranceId: '', mlAmount: '5', price: '', condition: 'used-decant' });
      setShowForm(false);
      refreshListings();
    }
    setSubmitting(false);
  }

  async function buy(listingId: string) {
    if (!user) return;
    setBuying(listingId);
    const supabase = createClient();
    // The whole "mark sold + create order" transaction happens inside this
    // one SECURITY DEFINER function (supabase/migrations/0003_functions.sql),
    // so there's no window where a listing is sold without an order existing.
    const { error: rpcError } = await supabase.rpc('create_decant_order', { p_listing_id: listingId });
    setBuying(null);
    if (rpcError) {
      setNotice(`Could not complete purchase: ${rpcError.message}`);
    } else {
      setNotice('Order created — funds are held in escrow until you confirm delivery.');
      refreshListings();
      refreshOrders();
    }
  }

  async function markShipped(orderId: string) {
    const tracking = window.prompt('Tracking number (optional):') ?? '';
    const supabase = createClient();
    await supabase.rpc('mark_order_shipped', { p_order_id: orderId, p_tracking_number: tracking });
    refreshOrders();
  }

  async function confirmDelivered(orderId: string) {
    const supabase = createClient();
    await supabase.rpc('confirm_order_delivered', { p_order_id: orderId });
    refreshOrders();
  }

  async function disputeOrder(orderId: string) {
    if (!window.confirm('Open a dispute on this order?')) return;
    const supabase = createClient();
    await supabase.rpc('dispute_order', { p_order_id: orderId });
    refreshOrders();
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-electric">Decant Marketplace</p>
          <h1 className="mt-3 font-display text-4xl text-bone">Buy, sell, trade.</h1>
          <p className="mt-3 max-w-xl text-sm text-ash">
            Every order is held in escrow until you confirm delivery — funds release to the seller 72 hours
            after that unless a dispute is opened.
          </p>
        </div>
        {user && (
          <button onClick={() => setShowForm((s) => !s)} className="rounded-full bg-gold px-5 py-2.5 text-sm font-medium text-matte">
            {showForm ? 'Cancel' : 'List a decant'}
          </button>
        )}
      </div>

      {!user && (
        <div className="glass mt-6 rounded-2xl p-6 text-sm text-ash">
          <Link href="/sign-in" className="text-gold">
            Sign in
          </Link>{' '}
          to buy or list a decant.
        </div>
      )}

      {notice && (
        <div className="glass mt-6 rounded-xl p-4 text-sm text-bone">
          {notice}{' '}
          <button onClick={() => setNotice(null)} className="ml-2 text-ash underline">
            dismiss
          </button>
        </div>
      )}

      {showForm && (
        <form onSubmit={submit} className="glass mt-6 grid gap-3 rounded-2xl p-6 sm:grid-cols-4">
          <input
            placeholder="Fragrance ID"
            value={form.fragranceId}
            onChange={(e) => setForm({ ...form, fragranceId: e.target.value })}
            className="input sm:col-span-2"
            required
          />
          <input
            placeholder="mL amount"
            type="number"
            value={form.mlAmount}
            onChange={(e) => setForm({ ...form, mlAmount: e.target.value })}
            className="input"
            required
          />
          <input
            placeholder="Price (USD)"
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="input"
            required
          />
          <select
            value={form.condition}
            onChange={(e) => setForm({ ...form, condition: e.target.value })}
            className="input sm:col-span-2"
          >
            <option value="new">New</option>
            <option value="used-decant">Used decant</option>
            <option value="tester">Tester</option>
          </select>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-bone/10 px-5 py-2.5 text-sm text-bone hover:bg-bone/15 sm:col-span-2 disabled:opacity-50"
          >
            {submitting ? 'Listing…' : 'Create listing'}
          </button>
          {error && <p className="text-sm text-red-400 sm:col-span-4">{error}</p>}
          <p className="text-xs text-ash sm:col-span-4">
            Tip: find a fragrance&rsquo;s ID from its detail page URL or the Database search results.
          </p>
        </form>
      )}

      {user && orders.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-lg text-bone">Your orders</h2>
          <div className="mt-4 space-y-3">
            {orders.map((o) => (
              <div key={o.id} className="hairline flex flex-wrap items-center justify-between gap-3 rounded-xl p-4 text-sm">
                <div>
                  <p className="text-bone">{o.decant_listings?.fragrances?.name}</p>
                  <p className="text-xs uppercase tracking-wider text-ash">{o.status}</p>
                </div>
                <div className="flex gap-2 text-xs">
                  {o.seller_id === user.id && ['pending', 'escrow-held'].includes(o.status) && (
                    <button onClick={() => markShipped(o.id)} className="rounded-full bg-electric/15 px-3 py-1.5 text-electric">
                      Mark shipped
                    </button>
                  )}
                  {o.buyer_id === user.id && o.status === 'shipped' && (
                    <button onClick={() => confirmDelivered(o.id)} className="rounded-full bg-gold/15 px-3 py-1.5 text-gold">
                      Confirm delivered
                    </button>
                  )}
                  {['pending', 'escrow-held', 'shipped', 'delivered'].includes(o.status) && (
                    <button onClick={() => disputeOrder(o.id)} className="text-ash hover:text-red-400">
                      Dispute
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <p className="mt-10 text-ash">Loading listings…</p>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((l) => (
            <div key={l.id} className="glass rounded-2xl p-6">
              <p className="text-xs uppercase tracking-wider text-ash">{l.fragrances?.brands?.name}</p>
              <h3 className="mt-1 font-display text-lg text-bone">{l.fragrances?.name}</h3>
              <p className="mt-3 font-mono text-sm text-gold">
                {l.ml_amount}ml · ${Number(l.price).toFixed(2)}
              </p>
              <p className="mt-1 text-xs text-ash">{l.condition} · seller {l.profiles?.name ?? 'anonymous'}</p>
              {user && user.id !== l.seller_id && (
                <button
                  onClick={() => buy(l.id)}
                  disabled={buying === l.id}
                  className="mt-3 rounded-full bg-gold/15 px-3 py-1.5 text-xs text-gold disabled:opacity-50"
                >
                  {buying === l.id ? 'Processing…' : 'Buy'}
                </button>
              )}
            </div>
          ))}
          {listings.length === 0 && <p className="text-sm text-ash">No active listings right now.</p>}
        </div>
      )}
    </div>
  );
}
