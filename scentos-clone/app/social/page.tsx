'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, MessageCircle } from 'lucide-react';
import { useUser } from '@/lib/useUser';
import { createClient } from '@/lib/supabase/client';
export default function SocialPage() {
  const { user } = useUser();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [caption, setCaption] = useState('');
  const [posting, setPosting] = useState(false);
  function refresh() { createClient().from('posts').select('*,profiles(name),fragrances(name,brands(name)),likes(id,user_id),comments(id)').order('created_at', { ascending: false }).limit(50).then(({ data }) => { setPosts(data ?? []); setLoading(false); }); }
  useEffect(refresh, []);
  async function post(e: React.FormEvent) { e.preventDefault(); if (!caption.trim() || !user) return; setPosting(true); await createClient().from('posts').insert({ user_id: user.id, type: 'sotd', caption }); setCaption(''); refresh(); setPosting(false); }
  async function toggleLike(p: any) { if (!user) return; const ex = p.likes?.find((l: any) => l.user_id === user.id); if (ex) await createClient().from('likes').delete().eq('id', ex.id); else await createClient().from('likes').insert({ user_id: user.id, post_id: p.id }); refresh(); }
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <p className="section-label mb-3">Social</p>
      <h1 className="font-display text-4xl text-bone">Scent of the day.</h1>
      {user ? (
        <form onSubmit={post} className="glass mt-8 rounded-2xl p-5">
          <textarea value={caption} onChange={e => setCaption(e.target.value)} placeholder="What are you wearing today?" rows={3} className="input resize-none" />
          <button type="submit" disabled={posting || !caption.trim()} className="btn-gold mt-3 disabled:opacity-50">{posting ? 'Posting…' : 'Share SOTD'}</button>
        </form>
      ) : <div className="glass mt-8 rounded-2xl p-5 text-sm text-ash"><Link href="/sign-in" className="text-gold">Sign in</Link> to share what you&rsquo;re wearing.</div>}
      {loading ? <div className="mt-8 space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-32 animate-pulse rounded-2xl bg-obsidian2" />)}</div> : posts.length === 0 ? <p className="mt-10 text-center text-ash">No posts yet — be the first.</p> : (
        <div className="mt-8 space-y-4">
          {posts.map(p => {
            const liked = user ? p.likes?.some((l: any) => l.user_id === user.id) : false;
            return (
              <div key={p.id} className="glass rounded-2xl p-5">
                <div className="flex items-start justify-between gap-3">
                  <div><p className="font-medium text-bone">{p.profiles?.name ?? 'Anonymous'}</p><p className="font-mono text-2xs text-ash">{new Date(p.created_at).toLocaleDateString()}</p></div>
                  {p.fragrances && <div className="text-right"><p className="text-xs text-gold">{p.fragrances.name}</p><p className="font-mono text-2xs text-ash">{(p.fragrances.brands as any)?.name}</p></div>}
                </div>
                {p.caption && <p className="mt-3 leading-relaxed text-ash">{p.caption}</p>}
                <div className="mt-4 flex items-center gap-5 text-xs text-ash">
                  <button onClick={() => toggleLike(p)} disabled={!user} className={`flex items-center gap-1.5 transition-colors ${liked ? 'text-gold' : 'hover:text-gold'} disabled:opacity-40`}><Heart size={14} fill={liked ? 'currentColor' : 'none'} />{p.likes?.length ?? 0}</button>
                  <span className="flex items-center gap-1.5"><MessageCircle size={14} />{p.comments?.length ?? 0}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
