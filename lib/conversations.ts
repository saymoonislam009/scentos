import { createClient } from '@/lib/supabase/client';

/**
 * Finds an existing conversation for this buyer/seller/listing combo, or
 * creates one. Returns the conversation id, ready to route to /messages/[id].
 */
export async function findOrCreateConversation(sellerId: string, listingId: string | null, myUserId: string): Promise<string> {
  const s = createClient();
  if (sellerId === myUserId) throw new Error("You can't message yourself.");

  let query = s.from('conversations').select('id').eq('buyer_id', myUserId).eq('seller_id', sellerId);
  query = listingId ? query.eq('listing_id', listingId) : query.is('listing_id', null);
  const { data: existing } = await query.maybeSingle();
  if (existing) return existing.id;

  const { data: created, error } = await s.from('conversations')
    .insert({ buyer_id: myUserId, seller_id: sellerId, listing_id: listingId })
    .select('id').single();
  if (error || !created) throw new Error(error?.message ?? 'Could not start conversation.');
  return created.id;
}
