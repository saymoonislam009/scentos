'use client';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from './supabase/client';
export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const s = createClient();
    s.auth.getUser().then(({ data }) => { setUser(data.user); setLoading(false); });
    const { data: sub } = s.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);
  return { user, loading };
}
