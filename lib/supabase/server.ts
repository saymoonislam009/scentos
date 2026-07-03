import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// See the comment in lib/supabase/client.ts re: why no Database<> generic yet.
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Called from a Server Component render, which can't set cookies —
            // middleware.ts is what actually refreshes the session cookie.
          }
        },
      },
    },
  );
}
