import { createAdminClient } from '@/lib/supabase/admin';

type CacheEntry = { value: string | undefined; fetchedAt: number };
const cache = new Map<string, CacheEntry>();
const TTL_MS = 120_000; // 2 minutes — balances "no redeploy needed" against DB load

/**
 * Resolves a secret: DB override (set via Admin → Settings) takes priority,
 * falls back to the env var. Cached briefly per warm serverless instance.
 */
export async function getSecret(dbKey: string, envVarName: string): Promise<string | undefined> {
  const cached = cache.get(dbKey);
  if (cached && Date.now() - cached.fetchedAt < TTL_MS) return cached.value;

  let resolved: string | undefined = process.env[envVarName];
  try {
    const a = createAdminClient();
    const { data } = await a.from('app_settings').select('value').eq('key', dbKey).maybeSingle();
    if (data?.value) resolved = data.value;
  } catch {
    // DB unreachable — silently fall back to env var
  }
  cache.set(dbKey, { value: resolved, fetchedAt: Date.now() });
  return resolved;
}

export function invalidateSecretCache(dbKey?: string) {
  if (dbKey) cache.delete(dbKey);
  else cache.clear();
}

export function maskKey(value: string | undefined | null): string {
  if (!value) return '';
  if (value.length <= 8) return '••••••••';
  return `${value.slice(0, 6)}${'•'.repeat(Math.max(4, value.length - 10))}${value.slice(-4)}`;
}
