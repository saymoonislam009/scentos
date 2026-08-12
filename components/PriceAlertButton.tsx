'use client';
import { useEffect, useRef, useState } from 'react';
import { Bell, BellRing, X } from 'lucide-react';
import { useUser } from '@/lib/useUser';
import { useToast } from '@/components/Toast';
import { useConfirm } from '@/components/ui/ConfirmProvider';
import { api } from '@/lib/api';

export function PriceAlertButton({ fragranceId, currentPrice }: { fragranceId: string; currentPrice?: number }) {
  const { user } = useUser();
  const { toast } = useToast();
  const confirmDialog = useConfirm();
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState(currentPrice ? String(Math.round(currentPrice * 0.85)) : '');
  const [existing, setExisting] = useState<{ id: string; target_price: number; triggered: boolean } | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    api.getAlerts().then((all: any[]) => {
      const mine = all.find(a => a.fragrance_id === fragranceId);
      if (mine) setExisting(mine);
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, [user, fragranceId]);

  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  if (!user) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const price = Number(target);
    if (!price || price <= 0) { toast('Enter a valid target price.', 'error'); return; }
    setSubmitting(true);
    try {
      const created = await api.createAlert(fragranceId, price);
      setExisting(created); setOpen(false);
      toast(`We'll notify you when the price drops to $${price}.`, 'success');
    } catch (e: any) {
      toast(e.message ?? 'Could not set alert.', 'error');
    } finally { setSubmitting(false); }
  }

  async function remove() {
    if (!existing) return;
    const ok = await confirmDialog({ message: 'Remove this price alert?', confirmLabel: 'Remove' });
    if (!ok) return;
    await api.deleteAlert(existing.id);
    setExisting(null);
    toast('Alert removed.', 'success');
  }

  const isActive = !!existing && !existing.triggered;

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(o => !o)} className={`btn-ghost text-xs ${isActive ? 'border-gold/40 text-gold' : ''}`}>
        {isActive ? <BellRing size={12} /> : <Bell size={12} />}
        {!loaded ? 'Price alert' : existing?.triggered ? 'Alert triggered' : isActive ? `Alert at $${existing!.target_price}` : 'Price alert'}
      </button>
      {open && (
        <div className="glass absolute right-0 top-11 z-20 w-[calc(100vw-2rem)] max-w-64 rounded-xl p-4 shadow-glass sm:w-64">
          {isActive ? (
            <>
              <p className="mb-3 text-sm text-bone">Watching for <span className="text-gold">${existing!.target_price}</span></p>
              <button onClick={remove} className="flex items-center gap-1.5 text-xs text-ember hover:underline"><X size={12} />Remove alert</button>
            </>
          ) : (
            <form onSubmit={submit}>
              <p className="mb-2 font-mono text-2xs uppercase tracking-wider text-ash">Notify me when price drops to</p>
              <div className="flex gap-2">
                <input type="number" min={1} value={target} onChange={e => setTarget(e.target.value)} className="input py-1.5 text-sm" placeholder="85" autoFocus />
                <button type="submit" disabled={submitting} className="btn-gold !py-1.5 text-xs shrink-0 disabled:opacity-50">{submitting ? '…' : 'Set'}</button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
