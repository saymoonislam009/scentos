'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, User } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useUser } from '@/lib/useUser';
import { signOut } from '@/app/auth/actions';
import { NotificationBell } from '@/components/NotificationBell';

const LINKS = [
  { href: '/advisor', label: 'Advisor' }, { href: '/database', label: 'Database' },
  { href: '/partial-bottles', label: 'Used Bottles' }, { href: '/marketplace', label: 'Marketplace' },
  { href: '/scentgpt', label: 'ScentGPT' }, { href: '/collection', label: 'Collection' },
  { href: '/social', label: 'Social' }, { href: '/trends', label: 'Trends' },
];

export function NavBar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { user, loading } = useUser();
  useEffect(() => { const h = () => setScrolled(window.scrollY > 20); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);
  useEffect(() => { setOpen(false); }, [pathname]);
  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'glass border-b border-bone/[0.06]' : 'bg-transparent'}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="group flex items-baseline gap-0.5">
          <span className="font-display text-xl font-medium text-bone">Scent</span>
          <span className="font-display text-xl font-medium text-gold group-hover:text-gold-soft transition-colors">OS</span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          {LINKS.map(link => (
            <Link key={link.href} href={link.href} className={`rounded-full px-3 py-1.5 text-sm transition-colors ${pathname === link.href ? 'bg-gold/10 text-gold' : 'text-ash hover:bg-bone/5 hover:text-bone'}`}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {!loading && user && <NotificationBell />}
          <div className="hidden sm:flex sm:items-center sm:gap-2">
            {!loading && (user ? (
              <>
                <Link href="/account" className="flex items-center gap-2 rounded-full border border-bone/10 px-3 py-1.5 text-sm text-ash hover:border-bone/25 hover:text-bone">
                  <User size={14} /><span className="max-w-[100px] truncate">{user.email?.split('@')[0]}</span>
                </Link>
                <form action={signOut}><button className="rounded-full px-3 py-1.5 text-sm text-ash/60 hover:text-ash">Sign out</button></form>
              </>
            ) : (
              <Link href="/sign-in" className="rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5 text-sm text-gold hover:border-gold/60 hover:bg-gold/10">Sign in</Link>
            ))}
          </div>
          <button onClick={() => setOpen(o => !o)} className="flex h-9 w-9 items-center justify-center rounded-full border border-bone/10 text-bone hover:bg-bone/5 lg:hidden">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden border-t border-bone/[0.06] glass lg:hidden">
            <div className="flex flex-col gap-1 px-4 py-4 sm:px-6">
              {LINKS.map(link => (
                <Link key={link.href} href={link.href} className={`rounded-xl px-4 py-3 text-base transition-colors ${pathname === link.href ? 'bg-gold/10 text-gold' : 'text-ash hover:bg-bone/5 hover:text-bone'}`}>{link.label}</Link>
              ))}
              <div className="mt-3 border-t border-bone/[0.06] pt-3">
                {!loading && (user ? (
                  <div className="flex items-center justify-between">
                    <Link href="/account" className="flex items-center gap-2 rounded-xl px-4 py-3 text-ash hover:text-bone"><User size={16} />{user.email?.split('@')[0]}</Link>
                    <form action={signOut}><button className="rounded-xl px-4 py-3 text-sm text-ash/60">Sign out</button></form>
                  </div>
                ) : (
                  <Link href="/sign-in" className="block rounded-xl border border-gold/30 py-3 text-center text-sm text-gold">Sign in to ScentOS</Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
