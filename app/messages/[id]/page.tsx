'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Send, ArrowLeft } from 'lucide-react';
import { useUser } from '@/lib/useUser';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/Toast';

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id as string;
  const { user, loading: ul } = useUser();
  const { toast } = useToast();
  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  async function loadMessages(markRead: boolean) {
    const s = createClient();
    const { data: msgs, error } = await s.from('messages').select('*').eq('conversation_id', id).order('created_at', { ascending: true }).limit(200);
    if (error) { toast(`Couldn't refresh messages: ${error.message}`, 'error'); return; }
    setMessages(msgs ?? []);
    if (markRead && user && msgs?.length) {
      const unreadIds = msgs.filter((m: any) => m.sender_id !== user.id && !m.read_at).map((m: any) => m.id);
      if (unreadIds.length) await s.from('messages').update({ read_at: new Date().toISOString() }).in('id', unreadIds);
    }
  }

  useEffect(() => {
    if (ul) return;
    if (!user) { setLoading(false); return; }
    const s = createClient();
    let active = true;
    async function init() {
      const { data: convo, error } = await s.from('conversations')
        .select('*,partial_bottle_listings(perfume_name),buyer:buyer_id(name,email),seller:seller_id(name,email)')
        .eq('id', id).maybeSingle();
      if (!active) return;
      if (error) { setLoadError(error.message); setLoading(false); return; }
      if (!convo || (convo.buyer_id !== user!.id && convo.seller_id !== user!.id)) { setNotFound(true); setLoading(false); return; }
      setConversation(convo);
      await loadMessages(true);
      setLoading(false);
    }
    init();
    const t = setInterval(() => loadMessages(true), 6000);
    return () => { active = false; clearInterval(t); };
  }, [id, user, ul]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !user || sending) return;
    setSending(true);
    const body = input.trim();
    const s = createClient();
    const { error } = await s.from('messages').insert({ conversation_id: id, sender_id: user.id, body });
    if (error) {
      toast(`Message not sent: ${error.message}`, 'error');
    } else {
      setInput('');
      await loadMessages(false);
    }
    setSending(false);
  }

  if (ul || loading) return <div className="flex min-h-[70vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" /></div>;
  if (!user) return (
    <div className="mx-auto max-w-md px-4 py-32 text-center">
      <p className="text-ash">Sign in to view this conversation.</p>
      <Link href="/sign-in" className="btn-gold mt-6 inline-flex">Sign in</Link>
    </div>
  );
  if (loadError) return (
    <div className="mx-auto max-w-md px-4 py-32 text-center">
      <p className="font-display text-2xl text-bone">Couldn&rsquo;t load this conversation.</p>
      <p className="mt-2 text-sm text-ember">{loadError}</p>
      <Link href="/messages" className="mt-4 inline-block text-sm text-electric hover:underline">← Messages</Link>
    </div>
  );
  if (notFound) return (
    <div className="mx-auto max-w-md px-4 py-32 text-center">
      <p className="font-display text-2xl text-bone">Conversation not found.</p>
      <p className="mt-2 text-sm text-ash">Either it doesn&rsquo;t exist, or it belongs to someone else.</p>
      <Link href="/messages" className="mt-4 inline-block text-sm text-electric hover:underline">← Messages</Link>
    </div>
  );

  const isBuyer = conversation.buyer_id === user.id;
  const other = isBuyer ? conversation.seller : conversation.buyer;
  const listing = conversation.partial_bottle_listings;

  return (
    <div className="mx-auto flex h-[calc(100dvh-72px)] max-w-2xl flex-col px-4 sm:px-6">
      <div className="flex items-center gap-3 border-b border-bone/[0.06] py-5">
        <button onClick={() => router.push('/messages')} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-bone/10 text-ash hover:text-bone"><ArrowLeft size={15} /></button>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/12 text-gold font-display">{(other?.name ?? other?.email ?? '?').charAt(0).toUpperCase()}</div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-bone">{other?.name ?? other?.email ?? 'Unknown'}</p>
          {listing && <Link href="/partial-bottles" className="truncate text-xs text-gold/70 hover:underline">{listing.perfume_name}</Link>}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-5">
        {messages.length === 0 ? (
          <p className="py-10 text-center text-sm text-ash">Say hello — ask about condition, batch, or arrange a meetup.</p>
        ) : (
          <div className="space-y-3">
            {messages.map(m => {
              const mine = m.sender_id === user.id;
              return (
                <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${mine ? 'bg-gold/15 border border-gold/20 text-bone' : 'glass text-bone'}`}>
                    {m.body}
                    <p className={`mt-1 font-mono text-2xs ${mine ? 'text-gold/50' : 'text-ash/50'}`}>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={send} className="flex gap-3 border-t border-bone/[0.06] py-4">
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type a message…" className="input flex-1" maxLength={2000} />
        <button type="submit" disabled={sending || !input.trim()} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold text-matte transition-opacity disabled:opacity-40"><Send size={16} /></button>
      </form>
    </div>
  );
}
