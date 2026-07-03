import { createBrowserClient } from '@supabase/ssr';

// Not using the generated Database<> generic here on purpose: hand-writing
// it without a live, linked Supabase project produces types that don't
// quite match what @supabase/supabase-js expects internally (surfaces as
// confusing `never` errors on .insert()/.update() calls). Once deployed,
// run `npx supabase gen types typescript --linked > lib/database.types.ts`
// and wire `createBrowserClient<Database>(...)` back in for full type safety.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
