'use client';

import { useEffect, useState, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useUser } from '@/lib/useUser';

export function NotificationBell() {
  const { user } = useUser();
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  async function refresh() {
    if (!user) return;
    const res = await fetch('/api/notifications');
    const data = await res.json();
    setInquiries(data.inquiries ?? []);
  }

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 30_000); // poll every 30s
    return () => clearInterval(t);
  }, [user]);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  async function respond(id: string, status: 'accepted' | 'declined') {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    refresh();
  }

  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} className="relative rounded-full p-2 text-ash hover:text-bone">
        <Bell size={20} />
        {inquiries.length > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-matte">
            {inquiries.length > 9 ? '9+' : inquiries.length}
          </span>
        )}
      </button>

      {open && (
        <div className="glass absolute right-0 top-10 z-50 w-80 rounded-2xl p-3 shadow-glass">
          <p className="mb-2 px-2 text-xs uppercase tracking-wider text-ash">
            {inquiries.length === 0 ? 'No new requests' : `${inquiries.length} buy request${inquiries.length > 1 ? 's' : ''}`}
          </p>
          {inquiries.length === 0 && (
            <p className="px-2 py-3 text-sm text-ash">When someone requests to buy your listing, it shows here.</p>
          )}
          <div className="space-y-2">
            {inquiries.map((inq) => (
              <div key={inq.id} className="hairline rounded-xl p-3">
                <p className="text-sm text-bone">
                  <span className="text-electric">{inq.profiles?.name ?? inq.profiles?.email ?? 'Someone'}</span>
                  {' '}wants to buy your <span className="text-gold">{inq.partial_bottle_listings?.perfume_name}</span>
                </p>
                {inq.message && <p className="mt-1 text-xs text-ash">&ldquo;{inq.message}&rdquo;</p>}
                <div className="mt-2 flex gap-2">
                  <button onClick={() => respond(inq.id, 'accepted')}
                    className="rounded-full bg-electric/15 px-3 py-1 text-xs text-electric">
                    Accept
                  </button>
                  <button onClick={() => respond(inq.id, 'declined')}
                    className="rounded-full bg-bone/5 px-3 py-1 text-xs text-ash">
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
