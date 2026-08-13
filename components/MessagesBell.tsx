'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { useUser } from '@/lib/useUser';
import { createClient } from '@/lib/supabase/client';

export function MessagesBell() {
  const { user } = useUser();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    const s = createClient();
    let active = true;
    async function check() {
      const { data: convos } = await s.from('conversations').select('id').or(`buyer_id.eq.${user!.id},seller_id.eq.${user!.id}`);
      const ids = (convos ?? []).map((c: any) => c.id);
      if (!ids.length) { if (active) setUnread(0); return; }
      const { count } = await s.from('messages').select('*', { count: 'exact', head: true }).in('conversation_id', ids).is('read_at', null).neq('sender_id', user!.id);
      if (active) setUnread(count ?? 0);
    }
    check();
    const t = setInterval(check, 20000);
    return () => { active = false; clearInterval(t); };
  }, [user]);

  if (!user) return null;

  return (
    <Link href="/messages" className="relative flex h-10 w-10 items-center justify-center rounded-full border border-bone/10 text-ash hover:border-bone/25 hover:text-bone">
      <MessageCircle size={16} />
      {unread > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[9px] font-bold text-matte">
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </Link>
  );
}
