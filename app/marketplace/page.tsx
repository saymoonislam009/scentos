'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Clock, Package } from 'lucide-react';
import { useUser } from '@/lib/useUser';
import { createClient } from '@/lib/supabase/client';
import { FragranceAutocomplete } from '@/components/FragranceAutocomplete';
export default function MarketplacePage() {
  const { user } = useUser();
  const [listings, setListings] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ fragranceId:'', fragranceName:'', mlAmount:'5', price:'', condition:'used-decant' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [buying, setBuying] = useState<string|null>(null);
  const [notice, setNotice] = useState('');
  function refreshListings() { setLoading(true); createClient().from('decant_listings').select('*,fragrances(name,brands(name)),profiles(name)').eq('status','active').order('created_at',{ascending:false}).then(({data})=>{setListings(data??[]);setLoading(false);}); }
  function refreshOrders() { if (!user) return; createClient().from('orders').select('*,decant_listings(fragrances(name,brands(name)))').order('created_at',{ascending:false}).then(({data})=>setOrders(data??[])); }
  useEffect(refreshListings, []);
  useEffect(() => { refreshOrders(); }, [user]);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); if (!form.fragranceId) { setError('Search and select a fragrance first.'); return; }
    setError(''); setSubmitting(true);
    const { error: err } = await createClient().from('decant_listings').insert({ seller_id: user!.id, fragrance_id: form.fragranceId, ml_amount: Number(form.mlAmount), price: Number(form.price), condition: form.condition });
    setSubmitting(false); if (err) { setError(err.message); return; }
    setForm({ fragranceId:'', fragranceName:'', mlAmount:'5', price:'', condition:'used-decant' }); setShowForm(false); refreshListings();
  }
  async function buy(id: string) {
    if (!user) return; setBuying(id);
    const { error: err } = await createClient().rpc('create_decant_order', { p_listing_id: id });
    setBuying(null); if (err) { setNotice(`Failed: ${err.message}`); return; }
    setNotice('Order placed — funds held in escrow until delivery confirmed.'); refreshListings(); refreshOrders();
  }
  async function markShipped(id: string) { const t = window.prompt('Tracking number:') ?? ''; await createClient().rpc('mark_order_shipped', { p_order_id: id, p_tracking_number: t }); refreshOrders(); }
  async function confirmDelivered(id: string) { await createClient().rpc('confirm_order_delivered', { p_order_id: id }); refreshOrders(); setNotice('Confirmed. Funds release in 72h.'); }
  async function dispute(id: string) { if (!window.confirm('Open a dispute?')) return; await createClient().rpc('dispute_order', { p_order_id: id }); refreshOrders(); }
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div><p className="section-label mb-3">Decant Marketplace</p><h1 className="font-display text-4xl text-bone sm:text-5xl">Buy, sell, trade.</h1></div>
        {user && <button onClick={() => setShowForm(s => !s)} className="btn-gold shrink-0">{showForm ? 'Cancel' : 'List a decant'}</button>}
      </div>
      <div className="mt-6 grid grid-cols-3 gap-3">
        {[{I:ShieldCheck,l:'Escrow protected'},{I:Clock,l:'72h auto-release'},{I:Package,l:'Dispute support'}].map(({I,l}) => (
          <div key={l} className="glass rounded-xl p-3 text-center"><I size={16} className="mx-auto text-gold" /><p className="mt-1.5 font-mono text-2xs text-ash">{l}</p></div>
        ))}
      </div>
      {!user && <div className="glass mt-5 rounded-xl p-4 text-sm text-ash"><Link href="/sign-in" className="text-gold">Sign in</Link> to buy or list.</div>}
      {notice && <div className="glass-warm mt-5 rounded-xl p-4 text-sm text-bone">{notice}<button onClick={() => setNotice('')} className="ml-3 text-xs text-ash underline">dismiss</button></div>}
      {showForm && (
        <form onSubmit={submit} className="glass mt-6 rounded-2xl p-6">
          <h2 className="mb-5 font-display text-lg text-bone">New listing</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block font-mono text-2xs uppercase tracking-wider text-ash">Fragrance</label>
              <FragranceAutocomplete value={form.fragranceName} onSelect={(id, name, brand) => setForm(f => ({ ...f, fragranceId: id, fragranceName: `${name} — ${brand}` }))} />
              {form.fragranceId && <p className="mt-1.5 font-mono text-2xs text-electric">Selected: {form.fragranceName}</p>}
            </div>
            <div><label className="mb-1.5 block font-mono text-2xs uppercase tracking-wider text-ash">Amount (ml)</label><input type="number" min="0.5" step="0.5" value={form.mlAmount} onChange={e => setForm(f => ({...f, mlAmount: e.target.value}))} className="input" required /></div>
            <div><label className="mb-1.5 block font-mono text-2xs uppercase tracking-wider text-ash">Price (USD)</label><input type="number" min="0" value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))} className="input" required /></div>
            <div className="sm:col-span-2"><div className="grid grid-cols-3 gap-2">{['new','used-decant','tester'].map(c => <button type="button" key={c} onClick={() => setForm(f => ({...f, condition: c}))} className={`rounded-xl border py-2.5 text-sm capitalize transition-colors ${form.condition === c ? 'border-gold/50 bg-gold/10 text-bone' : 'border-bone/10 text-ash'}`}>{c.replace('-',' ')}</button>)}</div></div>
          </div>
          {error && <p className="mt-4 text-sm text-ember">{error}</p>}
          <button type="submit" disabled={submitting} className="btn-gold mt-5 disabled:opacity-50">{submitting ? 'Listing…' : 'Publish listing'}</button>
        </form>
      )}
      {user && orders.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 font-display text-xl text-bone">Your orders</h2>
          <div className="space-y-3">{orders.map(o => (
            <div key={o.id} className="glass flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5">
              <div><p className="text-bone">{(o.decant_listings as any)?.fragrances?.name}</p><p className="font-mono text-2xs text-ash">{o.status}</p></div>
              <div className="flex items-center gap-3">
                <p className="font-display text-lg text-gold">${Number(o.amount).toFixed(2)}</p>
                <div className="flex gap-2 text-xs">
                  {o.seller_id === user.id && ['pending','escrow-held'].includes(o.status) && <button onClick={() => markShipped(o.id)} className="btn-electric text-xs !py-1 !px-3">Mark shipped</button>}
                  {o.buyer_id === user.id && o.status === 'shipped' && <button onClick={() => confirmDelivered(o.id)} className="btn-gold text-xs !py-1.5 !px-3">Confirm received</button>}
                  {['pending','escrow-held','shipped','delivered'].includes(o.status) && <button onClick={() => dispute(o.id)} className="text-ash hover:text-ember">Dispute</button>}
                </div>
              </div>
            </div>
          ))}</div>
        </div>
      )}
      <div className="mt-10">
        <h2 className="mb-5 font-display text-xl text-bone">Active listings</h2>
        {loading ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[...Array(6)].map((_,i) => <div key={i} className="h-40 animate-pulse rounded-2xl bg-obsidian2" />)}</div> : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map(l => (
              <div key={l.id} className="card p-5">
                <p className="section-label text-2xs">{(l.fragrances as any)?.brands?.name}</p>
                <h3 className="mt-2 font-display text-xl text-bone">{(l.fragrances as any)?.name}</h3>
                <div className="mt-4 flex items-end justify-between">
                  <div><p className="font-mono text-sm text-gold">{l.ml_amount}ml</p><p className="mt-0.5 text-xs text-ash capitalize">{l.condition.replace('-',' ')}</p></div>
                  <p className="font-display text-2xl text-bone">${Number(l.price).toFixed(2)}</p>
                </div>
                <p className="mt-2 text-xs text-ash">by {(l.profiles as any)?.name ?? 'anonymous'}</p>
                {user && user.id !== l.seller_id && <button onClick={() => buy(l.id)} disabled={buying === l.id} className="btn-gold mt-4 w-full justify-center text-sm disabled:opacity-50">{buying === l.id ? 'Processing…' : 'Buy now'}</button>}
              </div>
            ))}
            {listings.length === 0 && <p className="text-sm text-ash">No active listings right now.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
