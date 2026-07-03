'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/lib/useUser';
import { createClient } from '@/lib/supabase/client';

export default function NewPartialBottleListingPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const [form, setForm] = useState({
    perfumeName: '',
    brandName: '',
    daysUsed: '',
    percentLeft: '70',
    hasBox: 'true',
    price: '',
    currency: 'BDT',
    paymentMethod: 'both',
    location: '',
    contactInfo: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!userLoading && !user) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="text-ash">Sign in to list a bottle for sale.</p>
        <Link href="/sign-in" className="mt-4 inline-block rounded-full bg-gold px-6 py-2.5 text-sm font-medium text-matte">
          Sign in
        </Link>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { error: insertError } = await supabase.from('partial_bottle_listings').insert({
      seller_id: user.id,
      perfume_name: form.perfumeName,
      brand_name: form.brandName || null,
      days_used: form.daysUsed ? Number(form.daysUsed) : null,
      percent_left: Number(form.percentLeft),
      has_box: form.hasBox === 'true',
      price: Number(form.price),
      currency: form.currency,
      payment_method: form.paymentMethod,
      location: form.location || null,
      contact_info: form.contactInfo,
      description: form.description || null,
    });

    setSubmitting(false);
    if (insertError) {
      setError(insertError.message);
    } else {
      router.push('/partial-bottles');
    }
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-electric">Used Bottle Marketplace</p>
      <h1 className="mt-3 font-display text-4xl text-bone">List your bottle.</h1>
      <p className="mt-3 text-sm text-ash">
        Your contact info is shown publicly on the listing, the same as a classifieds post — only put
        what you&rsquo;re comfortable sharing.
      </p>

      <form onSubmit={submit} className="glass mt-8 grid gap-4 rounded-2xl p-6 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs uppercase tracking-wider text-ash">Perfume name</span>
          <input
            value={form.perfumeName}
            onChange={(e) => setForm({ ...form, perfumeName: e.target.value })}
            className="input"
            placeholder="Sauvage EDT 100ml"
            required
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-wider text-ash">Brand (optional)</span>
          <input
            value={form.brandName}
            onChange={(e) => setForm({ ...form, brandName: e.target.value })}
            className="input"
            placeholder="Dior"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-wider text-ash">Days used</span>
          <input
            type="number"
            min="0"
            value={form.daysUsed}
            onChange={(e) => setForm({ ...form, daysUsed: e.target.value })}
            className="input"
            placeholder="20"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-wider text-ash">% left</span>
          <input
            type="number"
            min="1"
            max="100"
            value={form.percentLeft}
            onChange={(e) => setForm({ ...form, percentLeft: e.target.value })}
            className="input"
            required
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-wider text-ash">Box</span>
          <select value={form.hasBox} onChange={(e) => setForm({ ...form, hasBox: e.target.value })} className="input">
            <option value="true">With box</option>
            <option value="false">Without box</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-wider text-ash">Price</span>
          <input
            type="number"
            min="0"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="input"
            required
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-wider text-ash">Currency</span>
          <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="input">
            <option value="BDT">BDT</option>
            <option value="USD">USD</option>
          </select>
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs uppercase tracking-wider text-ash">Payment method</span>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'online', label: 'Online payment' },
              { value: 'face-to-face', label: 'Face to face' },
              { value: 'both', label: 'Either' },
            ].map((opt) => (
              <button
                type="button"
                key={opt.value}
                onClick={() => setForm({ ...form, paymentMethod: opt.value })}
                className={`rounded-xl border px-3 py-2 text-xs transition-colors ${
                  form.paymentMethod === opt.value ? 'border-gold bg-gold/10 text-bone' : 'border-bone/10 text-ash'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs uppercase tracking-wider text-ash">Location</span>
          <input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="input"
            placeholder="Dhanmondi, Dhaka"
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs uppercase tracking-wider text-ash">Contact info (shown publicly)</span>
          <input
            value={form.contactInfo}
            onChange={(e) => setForm({ ...form, contactInfo: e.target.value })}
            className="input"
            placeholder="WhatsApp: 01XXXXXXXXX"
            required
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs uppercase tracking-wider text-ash">Description (optional)</span>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input min-h-[80px] resize-none"
            placeholder="Why you're selling, any flaws, anything a buyer should know."
          />
        </label>

        {error && <p className="text-sm text-red-400 sm:col-span-2">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-gold px-6 py-2.5 text-sm font-medium text-matte disabled:opacity-50 sm:col-span-2"
        >
          {submitting ? 'Listing…' : 'Publish listing'}
        </button>
      </form>
    </div>
  );
}
