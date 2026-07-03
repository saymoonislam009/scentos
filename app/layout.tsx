import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { NavBar } from '@/components/NavBar';
import { ServiceWorkerRegistrar } from '@/components/ServiceWorkerRegistrar';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
});

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' });

export const metadata: Metadata = {
  title: 'ScentOS — The Fragrance Operating System',
  description:
    'Discover, track, trade, and layer fragrances with an AI advisor that actually knows your collection.',
  icons: {
    icon: [{ url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  // Lets iOS treat an "Add to Home Screen" install as a standalone app
  // instead of opening Safari chrome — the other half of installability
  // alongside the manifest, which Android relies on instead.
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ScentOS',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#050505',
  viewportFit: 'cover', // respects notches/safe-areas if this is ever wrapped in a native shell
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} ${jetbrains.variable}`}>
      <body className="font-body bg-matte text-bone min-h-screen">
        <ServiceWorkerRegistrar />
        <NavBar />
        <main>{children}</main>
      </body>
    </html>
  );
}
