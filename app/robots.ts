import type { MetadataRoute } from 'next';
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin', '/account', '/api'] },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://scentos-pi.vercel.app'}/sitemap.xml`,
  };
}
