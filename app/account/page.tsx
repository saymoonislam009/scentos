'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@/lib/useUser';
import { createClient } from '@/lib/supabase/client';
import { signOut } from '@/app/auth/actions';

export default function AccountPage() {
  const { user, loading: userLoading } = useUser();
  const [profile, setProfile] = useState<any>(null);
  const [myListings, setMyListings] = useState<any[]>([]);
  const [editName, setEditName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => {
      setProfile(data);
      setNameInput(data?.name ?? '');
    });
    supabase
      .from('partial_bottle_listings')
      .select('*')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setMyListings(data ?? []));
  }, [user]);

  async function saveName() {
    if (!user) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from('profiles').update({ name: nameInput }).eq('id', user.id);
    setProfile((p: any) => ({ ...p, name: nameInput }));
    setEditName(false);
    setSaving(false);
  }

  async function removeMyListing(id: string) {
    if (!confirm('Remove this listing?')) return;
    const supabase = createClient();
    await supabase.from('partial_bottle_listings').update({ status: 'removed' }).eq('id', id);
    setMyListings((l) => l.filter((x) => x.id !== id));
  }

  if (userLoading) return <div className="py-32 text-center text-ash">Loading…</div>;
  if (!user) return (
    <div className="mx-auto max-w-md px-6 py-32 text-center">
      <p className="text-ash">You&rsquo;re not signed in.</p>
      <Link href="/sign-in" className="mt-4 inline-block rounded-full bg-gold px-6 py-2.5 text-sm font-medium text-matte">
        Sign in
      </Link>
    </div>
  );

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-electric">Account</p>
      <h1 className="mt-3 font-display text-4xl text-bone">Your profile.</h1>

      {/* Account details */}
      <div className="glass mt-8 rounded-2xl p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-xs uppercase tracking-wider text-ash">Email</span>
              <p className="mt-0.5 text-bone">{user.email}</p>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-ash">Name</span>
              {editName ? (
                <div className="mt-1 flex gap-2">
                  <input value={nameInput} onChange={(e) => setNameInput(e.target.value)} className="input py-1.5 text-sm" />
                  <button onClick={saveName} disabled={saving} className="rounded-full bg-gold px-4 py-1.5 text-xs font-medium text-matte disabled:opacity-50">
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                  <button onClick={() => setEditName(false)} className="text-xs text-ash">Cancel</button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <p className="mt-0.5 text-bone">{profile?.name ?? '—'}</p>
                  <button onClick={() => setEditName(true)} className="text-xs text-electric">Edit</button>
                </div>
              )}
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-ash">Member since</span>
              <p className="mt-0.5 text-bone">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { href: '/collection', label: 'My Collection' },
          { href: '/partial-bottles', label: 'Browse Bottles' },
          { href: '/marketplace', label: 'Marketplace' },
          { href: '/advisor', label: 'AI Advisor' },
        ].map((l) => (
          <Link key={l.href} href={l.href} className="glass rounded-xl p-4 text-center text-sm text-bone transition-colors hover:border-bone/20">
            {l.label}
          </Link>
        ))}
      </div>

      {/* My partial bottle listings */}
      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg text-bone">My bottle listings</h2>
          <Link href="/partial-bottles/new" className="text-sm text-electric">+ New listing</Link>
        </div>

        {myListings.length === 0 ? (
          <p className="mt-4 text-sm text-ash">You haven&rsquo;t listed any bottles yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {myListings.map((l) => (
              <div key={l.id} className="hairline flex flex-wrap items-center justify-between gap-3 rounded-xl p-4">
                <div>
                  <p className="text-sm text-bone">{l.perfume_name}</p>
                  <div className="mt-1 flex gap-2 font-mono text-[10px] text-ash">
                    <span>{l.percent_left}% left</span>
                    <span>{l.currency} {Number(l.price).toFixed(0)}</span>
                    <span className={l.status === 'active' ? 'text-electric' : 'text-red-400'}>{l.status}</span>
                  </div>
                </div>
                <div className="flex gap-3 text-xs">
                  <Link href={`/partial-bottles/${l.id}/edit`} className="text-bone">Edit</Link>
                  {l.status === 'active' && (
                    <button onClick={() => removeMyListing(l.id)} className="text-red-400">Remove</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sign out */}
      <div className="mt-10 border-t border-bone/10 pt-6">
        <form action={signOut}>
          <button className="text-sm text-ash hover:text-bone">Sign out of ScentOS</button>
        </form>
      </div>
    </div>
  );
}
