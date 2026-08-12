'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, User, Sparkles, Search, Layers, ShoppingBag, Package, TrendingUp, Users, FlaskConical, BookOpen, Scale } from 'lucide-react';
import { BottleMark } from '@/components/BottleMark';
import { AnimatePresence, motion } from 'framer-motion';
import { useUser } from '@/lib/useUser';
import { signOut } from '@/app/auth/actions';
import { NotificationBell } from '@/components/NotificationBell';

const LINKS = [
  { href: '/advisor', label: 'Advisor', icon: Sparkles },
  { href: '/quiz', label: 'Quiz', icon: FlaskConical },
  { href: '/database', label: 'Database', icon: Search },
  { href: '/compare', label: 'Compare', icon: Scale },
  { href: '/scentgpt', label: 'ScentGPT', icon: BookOpen },
  { href: '/collection', label: 'Collection', icon: Layers },
  { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
  { href: '/partial-bottles', label: 'Used Bottles', icon: Package },
  { href: '/social', label: 'Social', icon: Users },
  { href: '/trends', label: 'Trends', icon: TrendingUp },
];

export function NavBar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { user, loading } = useUser();
  useEffect(() => { const h = () => setScrolled(window.scrollY > 20); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);
  useEffect(() => { setOpen(false); }, [pathname]);

  // primary nav links (desktop)
  const PRIMARY = LINKS.slice(0, 6);
  const SECONDARY = LINKS.slice(6);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'glass border-b border-bone/[0.06]' : 'bg-transparent'}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2 shrink-0">
          <BottleMark className="h-5 w-5 text-gold transition-transform duration-300 group-hover:scale-110" />
          <span className="flex items-baseline gap-0.5">
            <span className="font-display text-xl font-medium text-bone">Scent</span>
            <span className="font-display text-xl font-medium text-gold transition-colors">OS</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 xl:flex">
          {PRIMARY.map(link => (
            <Link key={link.href} href={link.href} className={`rounded-full px-3 py-1.5 text-sm transition-colors ${pathname === link.href ? 'bg-gold/10 text-gold' : 'text-ash hover:bg-bone/5 hover:text-bone'}`}>{link.label}</Link>
          ))}
          <div className="group relative ml-1">
            <button className={`rounded-full px-3 py-1.5 text-sm transition-colors ${SECONDARY.some(l => l.href === pathname) ? 'bg-gold/10 text-gold' : 'text-ash hover:bg-bone/5 hover:text-bone'}`}>More ▾</button>
            <div className="glass invisible absolute left-0 top-full mt-1 w-44 rounded-xl p-1.5 opacity-0 shadow-glass transition-all group-hover:visible group-hover:opacity-100">
              {SECONDARY.map(link => (
                <Link key={link.href} href={link.href} className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors ${pathname === link.href ? 'text-gold' : 'text-ash hover:bg-bone/5 hover:text-bone'}`}>
                  <link.icon size={14} className="shrink-0" />{link.label}
                </Link>
              ))}
            </div>
          </div>
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
          <button onClick={() => setOpen(o => !o)} className="flex h-10 w-10 items-center justify-center rounded-full border border-bone/10 text-bone hover:bg-bone/5 xl:hidden">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden border-t border-bone/[0.06] glass xl:hidden">
            <div className="flex flex-col gap-1 px-4 py-4 sm:px-6">
              {LINKS.map(link => (
                <Link key={link.href} href={link.href} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-base transition-colors ${pathname === link.href ? 'bg-gold/10 text-gold' : 'text-ash hover:bg-bone/5 hover:text-bone'}`}>
                  <link.icon size={16} className="shrink-0 text-gold/60" />{link.label}
                </Link>
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
