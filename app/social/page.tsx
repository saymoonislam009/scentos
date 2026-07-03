'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@/lib/useUser';
import { createClient } from '@/lib/supabase/client';

export default function SocialPage() {
  const { user } = useUser();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [caption, setCaption] = useState('');
  const [posting, setPosting] = useState(false);

  function refresh() {
    const supabase = createClient();
    supabase
      .from('posts')
      .select('*, profiles ( name ), fragrances ( name, brands ( name ) ), likes ( id, user_id ), comments ( id )')
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setPosts(data ?? []);
        setLoading(false);
      });
  }

  useEffect(refresh, []);

  async function submitPost(e: React.FormEvent) {
    e.preventDefault();
    if (!caption.trim() || !user) return;
    setPosting(true);
    const supabase = createClient();
    await supabase.from('posts').insert({ user_id: user.id, type: 'sotd', caption });
    setCaption('');
    refresh();
    setPosting(false);
  }

  async function toggleLike(post: any) {
    if (!user) return;
    const supabase = createClient();
    const existing = post.likes?.find((l: any) => l.user_id === user.id);
    if (existing) {
      await supabase.from('likes').delete().eq('id', existing.id);
    } else {
      await supabase.from('likes').insert({ user_id: user.id, post_id: post.id });
    }
    refresh();
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-electric">Social</p>
      <h1 className="mt-3 font-display text-4xl text-bone">Scent of the day.</h1>

      {user ? (
        <form onSubmit={submitPost} className="glass mt-8 rounded-2xl p-5">
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="What are you wearing today?"
            className="input min-h-[80px] resize-none"
          />
          <button
            type="submit"
            disabled={posting || !caption.trim()}
            className="mt-3 rounded-full bg-gold px-5 py-2 text-sm font-medium text-matte disabled:opacity-50"
          >
            Post
          </button>
        </form>
      ) : (
        <div className="glass mt-8 rounded-2xl p-6 text-center text-sm text-ash">
          <Link href="/sign-in" className="text-gold">
            Sign in
          </Link>{' '}
          to post your own SOTD or like what others are wearing. Browsing the feed is open to everyone.
        </div>
      )}

      {loading ? (
        <p className="mt-8 text-ash">Loading feed…</p>
      ) : posts.length === 0 ? (
        <p className="mt-8 text-ash">No posts yet — be the first to share your SOTD.</p>
      ) : (
        <div className="mt-8 space-y-5">
          {posts.map((p) => {
            const liked = user ? p.likes?.some((l: any) => l.user_id === user.id) : false;
            return (
              <div key={p.id} className="glass rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-bone">{p.profiles?.name ?? 'Anonymous'}</p>
                  {p.fragrances && (
                    <p className="text-xs text-electric">
                      {p.fragrances.brands?.name} — {p.fragrances.name}
                    </p>
                  )}
                </div>
                {p.caption && <p className="mt-3 text-sm text-ash">{p.caption}</p>}
                <div className="mt-4 flex items-center gap-4 text-xs text-ash">
                  <button onClick={() => toggleLike(p)} disabled={!user} className={liked ? 'text-gold' : 'hover:text-gold'}>
                    ♥ {p.likes?.length ?? 0}
                  </button>
                  <span>{p.comments?.length ?? 0} comments</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
