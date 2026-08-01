'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/lib/useUser';
import { createClient } from '@/lib/supabase/client';
export default function NewPartialBottlePage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [form, setForm] = useState({ perfumeName:'', brandName:'', daysUsed:'', percentLeft:'70', hasBox:'true', price:'', currency:'BDT', paymentMethod:'both', location:'', contactInfo:'', description:'' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  if (!loading && !user) return <div className="mx-auto max-w-md px-4 py-32 text-center"><p className="text-ash">Sign in to list a bottle.</p><Link href="/sign-in" className="btn-gold mt-6 inline-flex">Sign in</Link></div>;
  async function submit(e: React.FormEvent) {
    e.preventDefault(); if (!user) return; setSubmitting(true); setError('');
    const { error: err } = await createClient().from('partial_bottle_listings').insert({ seller_id: user.id, perfume_name: form.perfumeName, brand_name: form.brandName || null, days_used: form.daysUsed ? Number(form.daysUsed) : null, percent_left: Number(form.percentLeft), has_box: form.hasBox === 'true', price: Number(form.price), currency: form.currency, payment_method: form.paymentMethod, location: form.location || null, contact_info: form.contactInfo, description: form.description || null });
    setSubmitting(false); if (err) { setError(err.message); return; } router.push('/partial-bottles');
  }
  const upd = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <Link href="/partial-bottles" className="mb-6 inline-block font-mono text-2xs text-ash hover:text-bone">← Used bottles</Link>
      <p className="section-label mb-3">Used Bottle Marketplace</p>
      <h1 className="font-display text-4xl text-bone">List your bottle.</h1>
      <p className="mt-3 text-sm text-ash">Your contact info is shown publicly — only share what you&rsquo;re comfortable with.</p>
      <form onSubmit={submit} className="glass mt-8 rounded-2xl p-6 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2"><span className="mb-1.5 block font-mono text-2xs uppercase tracking-wider text-ash">Perfume name *</span><input required value={form.perfumeName} onChange={e => upd('perfumeName', e.target.value)} className="input" placeholder="Sauvage EDT 100ml" /></label>
          <label className="block"><span className="mb-1.5 block font-mono text-2xs uppercase tracking-wider text-ash">Brand</span><input value={form.brandName} onChange={e => upd('brandName', e.target.value)} className="input" placeholder="Dior" /></label>
          <label className="block"><span className="mb-1.5 block font-mono text-2xs uppercase tracking-wider text-ash">Days used</span><input type="number" min={0} value={form.daysUsed} onChange={e => upd('daysUsed', e.target.value)} className="input" placeholder="30" /></label>
          <label className="block"><span className="mb-1.5 block font-mono text-2xs uppercase tracking-wider text-ash">% remaining *</span><input type="number" required min={1} max={100} value={form.percentLeft} onChange={e => upd('percentLeft', e.target.value)} className="input" /></label>
          <label className="block"><span className="mb-1.5 block font-mono text-2xs uppercase tracking-wider text-ash">Box</span><select value={form.hasBox} onChange={e => upd('hasBox', e.target.value)} className="input"><option value="true">With box</option><option value="false">Without box</option></select></label>
          <label className="block"><span className="mb-1.5 block font-mono text-2xs uppercase tracking-wider text-ash">Price *</span><input type="number" required min={0} value={form.price} onChange={e => upd('price', e.target.value)} className="input" /></label>
          <label className="block"><span className="mb-1.5 block font-mono text-2xs uppercase tracking-wider text-ash">Currency</span><select value={form.currency} onChange={e => upd('currency', e.target.value)} className="input"><option value="BDT">BDT (৳)</option><option value="USD">USD ($)</option></select></label>
          <label className="block sm:col-span-2"><span className="mb-2 block font-mono text-2xs uppercase tracking-wider text-ash">Payment method *</span><div className="grid grid-cols-3 gap-2">{[{v:'online',l:'Online'},{v:'face-to-face',l:'Face to face'},{v:'both',l:'Either'}].map(({ v, l }) => <button type="button" key={v} onClick={() => upd('paymentMethod', v)} className={`rounded-xl border py-2.5 text-sm transition-colors ${form.paymentMethod === v ? 'border-gold/50 bg-gold/10 text-bone' : 'border-bone/10 text-ash'}`}>{l}</button>)}</div></label>
          <label className="block"><span className="mb-1.5 block font-mono text-2xs uppercase tracking-wider text-ash">Location</span><input value={form.location} onChange={e => upd('location', e.target.value)} className="input" placeholder="Dhanmondi, Dhaka" /></label>
          <label className="block"><span className="mb-1.5 block font-mono text-2xs uppercase tracking-wider text-ash">Contact info *</span><input required value={form.contactInfo} onChange={e => upd('contactInfo', e.target.value)} className="input" placeholder="WhatsApp: 01XXXXXXXXX" /></label>
          <label className="block sm:col-span-2"><span className="mb-1.5 block font-mono text-2xs uppercase tracking-wider text-ash">Description</span><textarea rows={3} value={form.description} onChange={e => upd('description', e.target.value)} className="input resize-none" placeholder="Why selling, any flaws…" /></label>
        </div>
        {error && <p className="mt-4 text-sm text-ember">{error}</p>}
        <button type="submit" disabled={submitting} className="btn-gold mt-6 w-full justify-center disabled:opacity-50">{submitting ? 'Publishing…' : 'Publish listing'}</button>
      </form>
    </div>
  );
}
