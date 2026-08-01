'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/lib/useUser';
import { createClient } from '@/lib/supabase/client';
export default function EditPartialBottlePage() {
  const { user } = useUser(); const params = useParams(); const router = useRouter();
  const [form, setForm] = useState<any>(null); const [saving, setSaving] = useState(false); const [error, setError] = useState('');
  useEffect(() => {
    if (!user) return;
    createClient().from('partial_bottle_listings').select('*').eq('id', params.id).single().then(({ data }) => {
      if (!data || data.seller_id !== user.id) { router.replace('/account'); return; } setForm(data);
    });
  }, [user, params.id, router]);
  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError('');
    const { error: err } = await createClient().from('partial_bottle_listings').update({ perfume_name: form.perfume_name, brand_name: form.brand_name, days_used: form.days_used ? Number(form.days_used) : null, percent_left: Number(form.percent_left), has_box: form.has_box === true || form.has_box === 'true', price: Number(form.price), currency: form.currency, payment_method: form.payment_method, location: form.location, contact_info: form.contact_info, description: form.description }).eq('id', params.id);
    setSaving(false); if (err) { setError(err.message); return; } router.push('/account');
  }
  if (!form) return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" /></div>;
  const upd = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <Link href="/account" className="mb-6 inline-block font-mono text-2xs text-ash hover:text-bone">← Account</Link>
      <h1 className="font-display text-3xl text-bone">Edit listing</h1>
      <form onSubmit={save} className="glass mt-8 rounded-2xl p-6 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          {([['perfume_name','Perfume name',true],['brand_name','Brand'],['days_used','Days used','number'],['percent_left','% remaining',true,'number']] as [string,string,any?,string?][]).map(([k,l,req,t]) => (
            <label key={k} className="block"><span className="mb-1.5 block font-mono text-2xs uppercase tracking-wider text-ash">{l}{req && ' *'}</span><input type={t || 'text'} required={!!req} value={form[k] ?? ''} onChange={e => upd(k, e.target.value)} className="input" /></label>
          ))}
          <label className="block"><span className="mb-1.5 block font-mono text-2xs uppercase tracking-wider text-ash">Box</span><select value={String(form.has_box)} onChange={e => upd('has_box', e.target.value === 'true')} className="input"><option value="true">With box</option><option value="false">Without box</option></select></label>
          <label className="block"><span className="mb-1.5 block font-mono text-2xs uppercase tracking-wider text-ash">Price *</span><input type="number" required value={form.price ?? ''} onChange={e => upd('price', e.target.value)} className="input" /></label>
          <label className="block"><span className="mb-1.5 block font-mono text-2xs uppercase tracking-wider text-ash">Currency</span><select value={form.currency} onChange={e => upd('currency', e.target.value)} className="input"><option value="BDT">BDT</option><option value="USD">USD</option></select></label>
          <label className="block"><span className="mb-1.5 block font-mono text-2xs uppercase tracking-wider text-ash">Payment</span><select value={form.payment_method} onChange={e => upd('payment_method', e.target.value)} className="input"><option value="online">Online</option><option value="face-to-face">Face to face</option><option value="both">Either</option></select></label>
          <label className="block"><span className="mb-1.5 block font-mono text-2xs uppercase tracking-wider text-ash">Location</span><input value={form.location ?? ''} onChange={e => upd('location', e.target.value)} className="input" /></label>
          <label className="block"><span className="mb-1.5 block font-mono text-2xs uppercase tracking-wider text-ash">Contact info *</span><input required value={form.contact_info ?? ''} onChange={e => upd('contact_info', e.target.value)} className="input" /></label>
          <label className="block sm:col-span-2"><span className="mb-1.5 block font-mono text-2xs uppercase tracking-wider text-ash">Description</span><textarea rows={3} value={form.description ?? ''} onChange={e => upd('description', e.target.value)} className="input resize-none" /></label>
        </div>
        {error && <p className="mt-4 text-sm text-ember">{error}</p>}
        <div className="mt-6 flex gap-3"><button type="submit" disabled={saving} className="btn-gold disabled:opacity-50">{saving ? 'Saving…' : 'Save changes'}</button><Link href="/account" className="btn-ghost">Cancel</Link></div>
      </form>
    </div>
  );
}
