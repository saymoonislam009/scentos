'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { useUser } from '@/lib/useUser';
import { createClient } from '@/lib/supabase/client';

export default function MessagesInboxPage() {
  const { user, loading: ul } = useUser();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ul) return;
    if (!user) { setLoading(false); return; }
    const s = createClient();
    let active = true;
    async function load() {
      const { data: convos } = await s.from('conversations')
        .select('*,partial_bottle_listings(perfume_name),buyer:buyer_id(name,email),seller:seller_id(name,email)')
        .or(`buyer_id.eq.${user!.id},seller_id.eq.${user!.id}`)
        .order('last_message_at', { ascending: false });
      if (!active || !convos) { setLoading(false); return; }
      const ids = convos.map((c: any) => c.id);
      let unreadMap = new Map<string, number>();
      let lastMsgMap = new Map<string, any>();
      if (ids.length) {
        const { data: msgs } = await s.from('messages').select('conversation_id,sender_id,body,created_at,read_at').in('conversation_id', ids).order('created_at', { ascending: false });
        for (const m of msgs ?? []) {
          if (!lastMsgMap.has(m.conversation_id)) lastMsgMap.set(m.conversation_id, m);
          if (m.sender_id !== user!.id && !m.read_at) unreadMap.set(m.conversation_id, (unreadMap.get(m.conversation_id) ?? 0) + 1);
        }
      }
      if (!active) return;
      setConversations(convos.map((c: any) => ({ ...c, lastMessage: lastMsgMap.get(c.id), unreadCount: unreadMap.get(c.id) ?? 0 })));
      setLoading(false);
    }
    load();
    const t = setInterval(load, 15000);
    return () => { active = false; clearInterval(t); };
  }, [user, ul]);

  if (ul || loading) return <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6"><div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="glass h-20 animate-pulse rounded-2xl" />)}</div></div>;
  if (!user) return (
    <div className="mx-auto max-w-md px-4 py-32 text-center">
      <MessageCircle size={24} className="mx-auto text-gold" />
      <p className="mt-4 text-ash">Sign in to see your messages.</p>
      <Link href="/sign-in" className="btn-gold mt-6 inline-flex">Sign in</Link>
    </div>
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <p className="section-label mb-3">Messages</p>
      <h1 className="font-display text-4xl text-bone">Your conversations.</h1>

      {conversations.length === 0 ? (
        <div className="hairline mt-10 rounded-2xl p-10 text-center">
          <MessageCircle size={22} className="mx-auto text-ash/40" />
          <p className="mt-3 text-ash">No conversations yet.</p>
          <p className="mt-1 text-sm text-ash/70">Message a seller from any used bottle listing to start one.</p>
          <Link href="/partial-bottles" className="mt-4 inline-block text-sm text-electric hover:underline">Browse listings →</Link>
        </div>
      ) : (
        <div className="mt-8 space-y-2">
          {conversations.map(c => {
            const isBuyer = c.buyer_id === user.id;
            const other = isBuyer ? c.seller : c.buyer;
            return (
              <Link key={c.id} href={`/messages/${c.id}`} className="glass flex items-center gap-4 rounded-2xl p-4 transition-colors hover:border-gold/20">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold/12 text-gold font-display text-lg">
                  {(other?.name ?? other?.email ?? '?').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-bone">{other?.name ?? other?.email ?? 'Unknown'}</p>
                    {c.lastMessage && <p className="shrink-0 font-mono text-2xs text-ash/60">{new Date(c.lastMessage.created_at).toLocaleDateString()}</p>}
                  </div>
                  {c.partial_bottle_listings && <p className="mt-0.5 truncate text-xs text-gold/70">{c.partial_bottle_listings.perfume_name}</p>}
                  <p className="mt-0.5 truncate text-sm text-ash">{c.lastMessage ? (c.lastMessage.sender_id === user.id ? 'You: ' : '') + c.lastMessage.body : 'No messages yet'}</p>
                </div>
                {c.unreadCount > 0 && <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-gold px-1.5 text-2xs font-bold text-matte">{c.unreadCount}</span>}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
