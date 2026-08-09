import type { MetadataRoute } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://scentos-pi.vercel.app';
  const staticRoutes = ['', '/advisor', '/database', '/quiz', '/compare', '/scentgpt', '/marketplace', '/partial-bottles', '/social', '/trends', '/collection'].map(p => ({
    url: `${base}${p}`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: p === '' ? 1 : 0.7,
  }));
  try {
    const a = createAdminClient();
    const { data } = await a.from('fragrances').select('slug,created_at').eq('discontinued', false).limit(1000);
    const fragranceRoutes = (data ?? []).map((f: any) => ({
      url: `${base}/fragrance/${f.slug}`, lastModified: new Date(f.created_at), changeFrequency: 'weekly' as const, priority: 0.6,
    }));
    return [...staticRoutes, ...fragranceRoutes];
  } catch { return staticRoutes; }
}
