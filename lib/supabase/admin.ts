import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// See the comment in lib/supabase/client.ts re: why no Database<> generic yet.
/**
 * Bypasses every RLS policy — this is the equivalent of the old NestJS
 * server holding the only DATABASE_URL. Use it only for:
 *  - the /api/admin/* routes (gated by ADMIN_SECRET, not by RLS)
 *  - AI route handlers writing results on behalf of a possibly-anonymous
 *    user (advisor_submissions, chat_messages, layering_suggestions)
 *
 * Never import this in a client component or anywhere the service role key
 * could end up in a bundle shipped to the browser.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
