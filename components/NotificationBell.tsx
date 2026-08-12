'use client';
import { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { useUser } from '@/lib/useUser';
export function NotificationBell() {
  const { user } = useUser();
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  async function refresh() {
    if (!user) return;
    const r = await fetch('/api/notifications');
    const d = await r.json();
    setInquiries(d.inquiries ?? []);
  }
  useEffect(() => { refresh(); const t = setInterval(refresh, 30000); return () => clearInterval(t); }, [user]);
  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);
  async function respond(id: string, status: 'accepted' | 'declined') {
    await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) });
    refresh();
  }
  if (!user) return null;
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(o => !o)} className="relative flex h-10 w-10 items-center justify-center rounded-full border border-bone/10 text-ash hover:border-bone/25 hover:text-bone">
        <Bell size={16} />
        {inquiries.length > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[9px] font-bold text-matte">
            {inquiries.length > 9 ? '9+' : inquiries.length}
          </span>
        )}
      </button>
      {open && (
        <div className="glass absolute right-0 top-11 z-50 w-[calc(100vw-2rem)] max-w-80 rounded-2xl p-3 shadow-glass sm:w-80">
          <p className="mb-2 px-2 font-mono text-2xs uppercase tracking-wider text-ash">
            {inquiries.length === 0 ? 'No new requests' : `${inquiries.length} buy request${inquiries.length !== 1 ? 's' : ''}`}
          </p>
          {inquiries.length === 0 ? (
            <p className="px-2 py-3 text-sm text-ash">When someone wants to buy your listing, it appears here.</p>
          ) : (
            <div className="space-y-2">
              {inquiries.map(inq => (
                <div key={inq.id} className="hairline rounded-xl p-3">
                  <p className="text-sm text-bone">
                    <span className="text-electric">{inq.profiles?.name ?? inq.profiles?.email ?? 'Someone'}</span>{' wants to buy '}
                    <span className="text-gold">{inq.partial_bottle_listings?.perfume_name}</span>
                  </p>
                  {inq.message && <p className="mt-1 text-xs text-ash">&ldquo;{inq.message}&rdquo;</p>}
                  <div className="mt-2.5 flex gap-2">
                    <button onClick={() => respond(inq.id, 'accepted')} className="btn-electric text-xs !py-1 !px-3">Accept</button>
                    <button onClick={() => respond(inq.id, 'declined')} className="rounded-full px-3 py-1 text-xs text-ash hover:text-bone">Decline</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
