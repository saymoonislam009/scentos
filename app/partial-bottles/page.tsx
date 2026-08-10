'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, Flag } from 'lucide-react';
import { useUser } from '@/lib/useUser';
import { createClient } from '@/lib/supabase/client';
import { usePrompt } from '@/components/ui/ConfirmProvider';
const PM: Record<string,string> = { online:'Online payment','face-to-face':'Face to face', both:'Either' };
export default function PartialBottlesPage() {
  const { user } = useUser();
  const promptDialog = usePrompt();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<string|null>(null);
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  function refresh() { setLoading(true); createClient().from('partial_bottle_listings').select('*,profiles(name)').eq('status','active').order('created_at',{ascending:false}).then(({data})=>{setListings(data??[]);setLoading(false);}); }
  useEffect(refresh, []);
  async function requestToBuy(id: string) {
    if (!user) return; setActioning(id);
    const { error } = await createClient().from('partial_listing_inquiries').insert({ listing_id: id, buyer_id: user.id });
    setActioning(null); setNotice(error ? `Error: ${error.message}` : 'Request sent — the seller will be notified.');
  }
  async function report(id: string, sellerId: string) {
    if (!user) return;
    const reason = await promptDialog({ title: 'Report listing', message: "Tell us what's wrong with this listing.", placeholder: 'e.g. Seller unresponsive, suspicious pricing…', confirmLabel: 'Send report' });
    if (!reason) return;
    await createClient().from('reports').insert({ reporter_id: user.id, listing_id: id, reported_user_id: sellerId, reason });
    setNotice('Report sent. Thank you.');
  }
  const filtered = listings.filter(l => !search || l.perfume_name.toLowerCase().includes(search.toLowerCase()) || (l.brand_name||'').toLowerCase().includes(search.toLowerCase()) || (l.location||'').toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="section-label mb-3">Used Bottle Marketplace</p>
          <h1 className="font-display text-4xl text-bone sm:text-5xl">Partial bottles,<br/>sold directly.</h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-ash">Sellers list their contact info and arrange payment directly. Anyone can browse. An account is only needed to request a purchase.</p>
        </div>
        <Link href={user ? '/partial-bottles/new' : '/sign-in'} className="btn-gold shrink-0">Sell a bottle</Link>
      </div>
      {notice && <div className="glass-warm mt-5 rounded-xl p-4 text-sm text-bone">{notice}<button onClick={() => setNotice('')} className="ml-3 text-xs text-ash underline">dismiss</button></div>}
      <div className="mt-8"><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, brand, or location…" className="input" /></div>
      {loading ? <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[...Array(6)].map((_,i) => <div key={i} className="h-64 animate-pulse rounded-2xl bg-obsidian2" />)}</div> : filtered.length === 0 ? <div className="mt-12 text-center"><p className="text-ash">{search ? 'No listings match.' : 'No partial bottles listed right now.'}</p></div> : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(l => (
            <div key={l.id} className="card flex flex-col p-5">
              {l.brand_name && <p className="section-label text-2xs">{l.brand_name}</p>}
              <h3 className="mt-2 font-display text-xl text-bone leading-snug">{l.perfume_name}</h3>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-obsidian2 p-3 text-center"><p className="font-display text-2xl text-bone">{l.percent_left}%</p><p className="font-mono text-2xs text-ash">remaining</p></div>
                <div className="rounded-xl bg-obsidian2 p-3 text-center"><p className="font-display text-2xl text-gold">{l.currency} {Number(l.price).toFixed(0)}</p><p className="font-mono text-2xs text-ash">asking</p></div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {l.days_used != null && <span className="badge border border-bone/10 text-ash">{l.days_used}d used</span>}
                <span className={`badge border ${l.has_box ? 'border-electric/25 text-electric' : 'border-bone/10 text-ash'}`}>{l.has_box ? 'With box' : 'No box'}</span>
                <span className="badge border border-bone/10 text-ash">{PM[l.payment_method] ?? l.payment_method}</span>
              </div>
              {l.location && <div className="mt-3 flex items-center gap-1.5 text-xs text-ash"><MapPin size={11} />{l.location}</div>}
              {l.description && <p className="mt-3 text-sm leading-relaxed text-ash line-clamp-2">{l.description}</p>}
              <div className="mt-4 rounded-xl border border-bone/[0.06] bg-obsidian2 px-3 py-2.5">
                <p className="text-xs text-ash">Seller: <span className="text-bone">{(l.profiles as any)?.name ?? 'Anonymous'}</span></p>
                <p className="mt-0.5 text-xs text-electric">{l.contact_info}</p>
              </div>
              <div className="mt-4 flex gap-2">
                {user ? user.id === l.seller_id ? (
                  <Link href={`/partial-bottles/${l.id}/edit`} className="btn-ghost flex-1 justify-center text-xs">Edit</Link>
                ) : (
                  <>
                    <button onClick={() => requestToBuy(l.id)} disabled={actioning === l.id} className="btn-gold flex-1 justify-center text-xs disabled:opacity-50">{actioning === l.id ? 'Sending…' : 'Request to buy'}</button>
                    <button onClick={() => report(l.id, l.seller_id)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-bone/10 text-ash/50 hover:border-ember/30 hover:text-ember" title="Report"><Flag size={13} /></button>
                  </>
                ) : <Link href="/sign-in" className="btn-ghost w-full justify-center text-xs">Sign in to request</Link>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
