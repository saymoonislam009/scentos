'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { User, Package, Heart, ShoppingBag } from 'lucide-react';
import { useUser } from '@/lib/useUser';
import { createClient } from '@/lib/supabase/client';
import { signOut } from '@/app/auth/actions';
import { useConfirm } from '@/components/ui/ConfirmProvider';
import { useToast } from '@/components/Toast';

export default function AccountPage() {
  const { user, loading: ul } = useUser();
  const confirmDialog = useConfirm();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [editName, setEditName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const s = createClient();
    s.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => {
      setProfile(data); setNameInput(data?.name ?? '');
    });
    s.from('partial_bottle_listings').select('*').eq('seller_id', user.id)
      .order('created_at', { ascending: false }).then(({ data }) => setListings(data ?? []));
  }, [user]);

  async function saveName() {
    if (!user) return;
    setSaving(true);
    await createClient().from('profiles').update({ name: nameInput }).eq('id', user.id);
    setProfile((p: any) => ({ ...p, name: nameInput }));
    setEditName(false); setSaving(false);
  }

  if (ul) return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" /></div>;
  if (!user) return (
    <div className="mx-auto max-w-md px-4 py-32 text-center">
      <p className="text-ash">You&rsquo;re not signed in.</p>
      <Link href="/sign-in" className="btn-gold mt-6 inline-flex">Sign in</Link>
    </div>
  );

  const LINKS = [
    { href: '/collection', label: 'Collection', Icon: Heart },
    { href: '/partial-bottles/new', label: 'List a bottle', Icon: Package },
    { href: '/marketplace', label: 'Marketplace', Icon: ShoppingBag },
    { href: '/advisor', label: 'AI Advisor', Icon: User },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="section-label mb-3">Account</p>
      <h1 className="font-display text-4xl text-bone">Your profile.</h1>

      <div className="glass mt-8 rounded-2xl p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold"><User size={22} /></div>
          <div className="flex-1 space-y-4">
            <div>
              <p className="font-mono text-2xs uppercase tracking-wider text-ash">Email</p>
              <p className="mt-1 text-bone">{user.email}</p>
            </div>
            <div>
              <p className="font-mono text-2xs uppercase tracking-wider text-ash">Name</p>
              {editName ? (
                <div className="mt-1 flex gap-2">
                  <input value={nameInput} onChange={e => setNameInput(e.target.value)} className="input py-1.5 text-sm" placeholder="Your name" autoFocus />
                  <button onClick={saveName} disabled={saving} className="btn-gold !py-1.5 text-xs disabled:opacity-50">{saving ? '…' : 'Save'}</button>
                  <button onClick={() => setEditName(false)} className="text-xs text-ash">Cancel</button>
                </div>
              ) : (
                <div className="mt-1 flex items-center gap-3">
                  <p className="text-bone">{profile?.name ?? '—'}</p>
                  <button onClick={() => setEditName(true)} className="font-mono text-2xs text-electric hover:underline">edit</button>
                </div>
              )}
            </div>
            <div>
              <p className="font-mono text-2xs uppercase tracking-wider text-ash">Member since</p>
              <p className="mt-1 text-bone">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {LINKS.map(({ href, label, Icon }) => (
          <Link key={href} href={href} className="card flex flex-col items-center gap-2 p-4 text-center">
            <Icon size={18} className="text-gold" />
            <span className="text-sm text-ash">{label}</span>
          </Link>
        ))}
      </div>

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl text-bone">My bottle listings</h2>
          <Link href="/partial-bottles/new" className="font-mono text-2xs text-electric hover:underline">+ New listing</Link>
        </div>
        {listings.length === 0 ? (
          <div className="hairline rounded-2xl p-6 text-center text-sm text-ash">
            No listings yet.
            <Link href="/partial-bottles/new" className="mt-2 block text-electric">List your first bottle →</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {listings.map(l => (
              <div key={l.id} className="glass flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
                <div>
                  <p className="text-bone">{l.perfume_name}</p>
                  <div className="mt-1 flex items-center gap-3 font-mono text-2xs text-ash">
                    <span>{l.percent_left}% left</span>
                    <span>{l.currency} {Number(l.price).toFixed(0)}</span>
                    <span className={l.status === 'active' ? 'text-electric' : 'text-ember'}>{l.status}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/partial-bottles/${l.id}/edit`} className="btn-ghost text-xs !py-1.5 !px-3">Edit</Link>
                  {l.status === 'active' && (
                    <button onClick={async () => {
                      const ok = await confirmDialog({ title: 'Remove listing', message: 'This will remove your listing from the marketplace. You can re-list later.', confirmLabel: 'Remove', danger: true });
                      if (!ok) return;
                      await createClient().from('partial_bottle_listings').update({ status: 'removed' }).eq('id', l.id);
                      setListings(p => p.filter(x => x.id !== l.id));
                      toast('Listing removed.', 'success');
                    }} className="rounded-full border border-ember/30 px-3 py-1.5 text-xs text-ember hover:bg-ember/10">Remove</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-12 border-t border-bone/[0.06] pt-6">
        <form action={signOut}>
          <button className="text-sm text-ash hover:text-bone">Sign out of ScentOS</button>
        </form>
      </div>
    </div>
  );
}
