'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ProfilePage() {
  const params = useParams();
  const username = Array.isArray(params.username) ? params.username[0] : params.username as string;
  const [profile, setProfile] = useState<any>(null);
  const [collection, setCollection] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = createClient();
    (async () => {
      const { data: p } = await s.from('profiles').select('*').eq('name', decodeURIComponent(username)).maybeSingle();
      if (!p) { setLoading(false); return; }
      setProfile(p);
      const [{ data: col }, { data: rev }] = await Promise.all([
        s.from('collection_items').select('type,fragrances(name,slug,brands(name))').eq('user_id', p.id).in('type', ['bottle','decant']).order('created_at', { ascending: false }).limit(24),
        s.from('reviews').select('*,fragrances(name,slug)').eq('user_id', p.id).order('created_at', { ascending: false }).limit(10),
      ]);
      setCollection(col ?? []);
      setReviews(rev ?? []);
      setLoading(false);
    })();
  }, [username]);

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" /></div>;
  if (!profile) return (
    <div className="flex min-h-[60vh] items-center justify-center text-center px-4">
      <div><p className="font-display text-2xl text-bone">User not found.</p><Link href="/social" className="mt-4 inline-block text-sm text-electric hover:underline">← Social feed</Link></div>
    </div>
  );

  const bottles = collection.filter(i => i.type === 'bottle').length;
  const decants = collection.filter(i => i.type === 'decant').length;
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <div className="glass rounded-2xl p-8 sm:p-10">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <h1 className="font-display text-4xl text-bone">{profile.name ?? 'Anonymous'}</h1>
            {profile.bio && <p className="mt-3 max-w-md text-ash leading-relaxed">{profile.bio}</p>}
            <p className="mt-3 font-mono text-2xs text-ash">Member since {new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[{ v: bottles, l: 'Bottles' },{ v: decants, l: 'Decants' },{ v: reviews.length, l: 'Reviews' }].map(c => (
              <div key={c.l} className="hairline rounded-xl p-4">
                <p className="font-display text-2xl text-gold">{c.v}</p>
                <p className="font-mono text-2xs text-ash">{c.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {collection.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-5 font-display text-2xl text-bone">Collection</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {collection.map((item, i) => (
              <Link key={i} href={`/fragrance/${(item.fragrances as any)?.slug}`} className="card p-4">
                <span className={`badge border text-2xs ${item.type === 'bottle' ? 'border-gold/30 text-gold' : 'border-electric/30 text-electric'}`}>{item.type}</span>
                <p className="mt-2 font-medium text-bone">{(item.fragrances as any)?.name}</p>
                <p className="text-xs text-ash">{(item.fragrances as any)?.brands?.name}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {reviews.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-5 font-display text-2xl text-bone">Reviews {avgRating && <span className="font-mono text-xl text-gold ml-2">{avgRating} avg</span>}</h2>
          <div className="space-y-4">
            {reviews.map(r => (
              <div key={r.id} className="glass rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <Link href={`/fragrance/${(r.fragrances as any)?.slug}`} className="font-medium text-electric hover:underline">{(r.fragrances as any)?.name}</Link>
                  <div className="flex shrink-0 text-gold">{'★'.repeat(r.rating)}<span className="text-bone/20">{'★'.repeat(5 - r.rating)}</span></div>
                </div>
                {r.body && <p className="mt-2 text-sm leading-relaxed text-ash">{r.body}</p>}
                <p className="mt-2 font-mono text-2xs text-ash/50">{new Date(r.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
