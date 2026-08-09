'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@/lib/useUser';

export function RecentlyViewedRail() {
  const { user } = useUser();
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    if (!user) return;
    fetch('/api/recently-viewed').then(r => r.json()).then(setItems).catch(() => {});
  }, [user]);
  if (!user || items.length === 0) return null;
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="section-label mb-4">Recently viewed</p>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {items.map((item: any) => (
          <Link key={item.fragrance_id} href={`/fragrance/${item.fragrances?.slug}`} className="card shrink-0 w-48 p-4">
            <p className="section-label text-2xs">{item.fragrances?.brands?.name}</p>
            <p className="mt-1.5 font-display text-base text-bone leading-snug line-clamp-2">{item.fragrances?.name}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
