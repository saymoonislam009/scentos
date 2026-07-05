'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/lib/useUser';
import { createClient } from '@/lib/supabase/client';

export default function EditPartialListingPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [form, setForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase.from('partial_bottle_listings').select('*').eq('id', params.id).single().then(({ data }) => {
      if (!data || data.seller_id !== user.id) { router.replace('/account'); return; }
      setForm(data);
    });
  }, [user, params.id, router]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(null);
    const supabase = createClient();
    const { error: err } = await supabase.from('partial_bottle_listings').update({
      perfume_name: form.perfume_name,
      brand_name: form.brand_name,
      days_used: form.days_used ? Number(form.days_used) : null,
      percent_left: Number(form.percent_left),
      has_box: form.has_box,
      price: Number(form.price),
      currency: form.currency,
      payment_method: form.payment_method,
      location: form.location,
      contact_info: form.contact_info,
      description: form.description,
    }).eq('id', params.id);
    setSaving(false);
    if (err) { setError(err.message); return; }
    router.push('/account');
  }

  if (!form) return <div className="py-32 text-center text-ash">Loading…</div>;

  const field = (key: string, label: string, type = 'text', extra?: any) => (
    <label key={key} className="block">
      <span className="mb-1 block text-xs uppercase tracking-wider text-ash">{label}</span>
      <input type={type} value={form[key] ?? ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="input" {...extra} />
    </label>
  );

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <h1 className="font-display text-3xl text-bone">Edit listing</h1>
      <form onSubmit={save} className="glass mt-8 grid gap-4 rounded-2xl p-6 sm:grid-cols-2">
        {field('perfume_name', 'Perfume name', 'text')}
        {field('brand_name', 'Brand')}
        {field('days_used', 'Days used', 'number')}
        {field('percent_left', '% left', 'number')}
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-wider text-ash">Box</span>
          <select value={String(form.has_box)} onChange={(e) => setForm({ ...form, has_box: e.target.value === 'true' })} className="input">
            <option value="true">With box</option>
            <option value="false">Without box</option>
          </select>
        </label>
        {field('price', 'Price', 'number')}
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-wider text-ash">Currency</span>
          <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="input">
            <option value="BDT">BDT</option>
            <option value="USD">USD</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-wider text-ash">Payment</span>
          <select value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })} className="input">
            <option value="online">Online</option>
            <option value="face-to-face">Face to face</option>
            <option value="both">Either</option>
          </select>
        </label>
        {field('location', 'Location')}
        {field('contact_info', 'Contact info')}
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs uppercase tracking-wider text-ash">Description</span>
          <textarea value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input min-h-[80px] resize-none" />
        </label>
        {error && <p className="text-sm text-red-400 sm:col-span-2">{error}</p>}
        <button type="submit" disabled={saving}
          className="rounded-full bg-gold px-6 py-2.5 text-sm font-medium text-matte disabled:opacity-50 sm:col-span-2">
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
