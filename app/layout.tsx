import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { NavBar } from '@/components/NavBar';
import { ServiceWorkerRegistrar } from '@/components/ServiceWorkerRegistrar';
import { ToastProvider } from '@/components/Toast';
<<<<<<< Updated upstream
=======
import { ConfirmProvider } from '@/components/ui/ConfirmProvider';
>>>>>>> Stashed changes
import { InstallPrompt } from '@/components/InstallPrompt';
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', weight: ['300','400','500','600'], style: ['normal','italic'] });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' });
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://scentos-pi.vercel.app'),
  title: { default: 'ScentOS — The Fragrance Operating System', template: '%s — ScentOS' },
  description: 'AI-powered fragrance discovery, collection tracking, and marketplace.',
  keywords: ['fragrance', 'perfume', 'oud', 'cologne', 'AI advisor'],
  openGraph: { title: 'ScentOS', description: 'Discover, collect, and trade fragrances with AI.', type: 'website' },
  icons: { icon: [{ url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }], apple: [{ url: '/icons/apple-touch-icon.png' }] },
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'ScentOS' },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, maximumScale: 1, themeColor: '#080806', viewportFit: 'cover' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} ${jetbrains.variable}`}>
      <body className="font-body bg-matte text-bone min-h-screen">
        <ServiceWorkerRegistrar />
        <ToastProvider>
<<<<<<< Updated upstream
          <NavBar />
          <main>{children}</main>
          <InstallPrompt />
=======
          <ConfirmProvider>
            <NavBar />
            <main>{children}</main>
            <InstallPrompt />
          </ConfirmProvider>
>>>>>>> Stashed changes
        </ToastProvider>
      </body>
    </html>
  );
}
