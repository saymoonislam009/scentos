'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, User } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useUser } from '@/lib/useUser';
import { signOut } from '@/app/auth/actions';
import { NotificationBell } from '@/components/NotificationBell';

const LINKS = [
  { href: '/advisor',         label: 'Advisor' },
  { href: '/database',        label: 'Database' },
  { href: '/scentgpt',        label: 'ScentGPT' },
  { href: '/collection',      label: 'Collection' },
  { href: '/layering',        label: 'Layering' },
  { href: '/marketplace',     label: 'Marketplace' },
  { href: '/partial-bottles', label: 'Used Bottles' },
  { href: '/social',          label: 'Social' },
  { href: '/trends',          label: 'Trends' },
];

export function NavBar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user, loading } = useUser();

  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 glass">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">

        {/* Logo */}
        <Link href="/" onClick={close} className="font-display text-lg tracking-wide text-bone">
          Scent<span className="text-gold">OS</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden gap-5 lg:flex">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href}
              className={`text-sm transition-colors hover:text-bone ${pathname === link.href ? 'text-bone' : 'text-ash'}`}>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {!loading && user && <NotificationBell />}

          <div className="hidden sm:flex sm:items-center sm:gap-2">
            {!loading && (
              user ? (
                <>
                  <Link href="/account"
                    className="flex items-center gap-1.5 rounded-full border border-bone/20 px-3 py-1.5 text-sm text-ash hover:text-bone">
                    <User size={14} />
                    {/* Show first name if available */}
                    <span className="max-w-[80px] truncate">{user.email?.split('@')[0]}</span>
                  </Link>
                  <form action={signOut}>
                    <button className="rounded-full border border-bone/10 px-3 py-1.5 text-sm text-ash hover:text-bone">
                      Sign out
                    </button>
                  </form>
                </>
              ) : (
                <Link href="/sign-in"
                  className="rounded-full border border-gold/40 px-4 py-1.5 text-sm text-gold transition-colors hover:bg-gold/10">
                  Sign in
                </Link>
              )
            )}
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setOpen((o) => !o)} aria-label={open ? 'Close menu' : 'Open menu'}
            className="rounded-full p-2 text-bone lg:hidden">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-bone/10 lg:hidden"
          >
            <div className="flex flex-col px-4 py-3 sm:px-6">
              {LINKS.map((link) => (
                <Link key={link.href} href={link.href} onClick={close}
                  className={`rounded-lg px-2 py-3 text-base transition-colors ${
                    pathname === link.href ? 'text-bone' : 'text-ash'
                  }`}>
                  {link.label}
                </Link>
              ))}

              <div className="mt-2 space-y-2 border-t border-bone/10 pt-3">
                {!loading && (
                  user ? (
                    <>
                      <Link href="/account" onClick={close}
                        className="flex items-center gap-2 rounded-lg px-2 py-3 text-base text-ash">
                        <User size={16} /> Account ({user.email?.split('@')[0]})
                      </Link>
                      <form action={signOut}>
                        <button className="w-full rounded-full border border-bone/10 px-4 py-2 text-sm text-ash text-left pl-4">
                          Sign out
                        </button>
                      </form>
                    </>
                  ) : (
                    <Link href="/sign-in" onClick={close}
                      className="block w-full rounded-full border border-gold/40 px-4 py-2 text-center text-sm text-gold">
                      Sign in
                    </Link>
                  )
                )}
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
