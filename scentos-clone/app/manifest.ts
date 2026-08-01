import type { MetadataRoute } from 'next';
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ScentOS — The Fragrance Operating System',
    short_name: 'ScentOS',
    start_url: '/',
    display: 'standalone',
    background_color: '#080806',
    theme_color: '#080806',
    icons: [
      { src:'/icons/icon-192.png', sizes:'192x192', type:'image/png', purpose:'any' },
      { src:'/icons/icon-512.png', sizes:'512x512', type:'image/png', purpose:'any' },
      { src:'/icons/icon-maskable-512.png', sizes:'512x512', type:'image/png', purpose:'maskable' },
    ],
  };
}
