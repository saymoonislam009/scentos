'use client';
import { useState } from 'react';
import { Bell, BellRing } from 'lucide-react';
import { useUser } from '@/lib/useUser';
import { useToast } from '@/components/Toast';
import { api } from '@/lib/api';

export function PriceAlertButton({ fragranceId, currentPrice }: { fragranceId: string; currentPrice?: number }) {
  const { user } = useUser();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState(currentPrice ? String(Math.round(currentPrice * 0.85)) : '');
  const [set, setSet] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!user) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const price = Number(target);
    if (!price || price <= 0) { toast('Enter a valid target price.', 'error'); return; }
    setSubmitting(true);
    try {
      await api.createAlert(fragranceId, price);
      setSet(true); setOpen(false);
      toast(`We'll notify you when the price drops to $${price}.`, 'success');
    } catch (e: any) {
      toast(e.message ?? 'Could not set alert.', 'error');
    } finally { setSubmitting(false); }
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className={`btn-ghost text-xs ${set ? 'border-gold/40 text-gold' : ''}`}>
        {set ? <BellRing size={12} /> : <Bell size={12} />}
        {set ? 'Alert set' : 'Price alert'}
      </button>
      {open && (
        <form onSubmit={submit} className="glass absolute right-0 top-11 z-20 w-64 rounded-xl p-4 shadow-glass">
          <p className="mb-2 font-mono text-2xs uppercase tracking-wider text-ash">Notify me when price drops to</p>
          <div className="flex gap-2">
            <input type="number" min={1} value={target} onChange={e => setTarget(e.target.value)} className="input py-1.5 text-sm" placeholder="85" autoFocus />
            <button type="submit" disabled={submitting} className="btn-gold !py-1.5 text-xs shrink-0 disabled:opacity-50">{submitting ? '…' : 'Set'}</button>
          </div>
        </form>
      )}
    </div>
  );
}
