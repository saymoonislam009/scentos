'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useUser } from '@/lib/useUser';
import { signOut } from '@/app/auth/actions';

const LINKS = [
  { href: '/advisor', label: 'Advisor' },
  { href: '/database', label: 'Database' },
  { href: '/scentgpt', label: 'ScentGPT' },
  { href: '/collection', label: 'Collection' },
  { href: '/layering', label: 'Layering' },
  { href: '/marketplace', label: 'Marketplace' },
  { href: '/partial-bottles', label: 'Used Bottles' },
  { href: '/social', label: 'Social' },
  { href: '/trends', label: 'Trends' },
];

export function NavBar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user, loading } = useUser();

  return (
    <header className="sticky top-0 z-50 glass">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" onClick={() => setOpen(false)} className="font-display text-lg tracking-wide text-bone">
          Scent<span className="text-gold">OS</span>
        </Link>

        <nav className="hidden gap-5 lg:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm transition-colors hover:text-bone ${
                pathname === link.href ? 'text-bone' : 'text-ash'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            {!loading && (
              user ? (
                <form action={signOut}>
                  <button className="rounded-full border border-bone/20 px-4 py-1.5 text-sm text-ash hover:text-bone">
                    Sign out
                  </button>
                </form>
              ) : (
                <Link
                  href="/sign-in"
                  className="rounded-full border border-gold/40 px-4 py-1.5 text-sm text-gold transition-colors hover:bg-gold/10"
                >
                  Sign in
                </Link>
              )
            )}
          </div>

          {/* Mobile menu toggle — the only way to reach most routes below the lg breakpoint */}
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="rounded-full p-2 text-bone lg:hidden"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

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
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-lg px-2 py-3 text-base transition-colors ${
                    pathname === link.href ? 'text-bone' : 'text-ash'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-2 border-t border-bone/10 pt-3 sm:hidden">
                {!loading && (
                  user ? (
                    <form action={signOut}>
                      <button className="w-full rounded-full border border-bone/20 px-4 py-2 text-sm text-ash">
                        Sign out
                      </button>
                    </form>
                  ) : (
                    <Link
                      href="/sign-in"
                      onClick={() => setOpen(false)}
                      className="block w-full rounded-full border border-gold/40 px-4 py-2 text-center text-sm text-gold"
                    >
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
