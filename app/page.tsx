import Link from 'next/link';
<<<<<<< Updated upstream
import { RecentlyViewedRail } from '@/components/RecentlyViewedRail';
import { TrendingRail } from '@/components/TrendingRail';
const PILLARS=[
  {num:'01',title:'AI Fragrance Advisor',body:'Claude reads your taste like a perfumer — recommends from a real catalog, never a hallucinated name.',href:'/advisor',accent:'gold'},
  {num:'02',title:'Fragrance Database',body:'The full catalog with DNA scoring, note pyramids, accord bars, and Genome similarity matching.',href:'/database',accent:'electric'},
  {num:'03',title:'Used Bottle Market',body:'Casual classifieds for partial bottles. Anyone can browse — an account is only needed to request a purchase.',href:'/partial-bottles',accent:'gold'},
  {num:'04',title:'ScentGPT',body:'A chat expert that looks up real notes and prices before it answers. Ask it anything.',href:'/scentgpt',accent:'electric'},
  {num:'05',title:'Collection & Layering',body:'Track every bottle and decant. Then get AI-powered layering combinations from what you already own.',href:'/collection',accent:'gold'},
  {num:'06',title:'Decant Marketplace',body:'Escrow-protected decant trading. Funds held until delivery confirmed, auto-released 72h later.',href:'/marketplace',accent:'electric'},
=======
import { Sparkles, Search, Package, MessageSquare, Layers, ShieldCheck } from 'lucide-react';
import { RecentlyViewedRail } from '@/components/RecentlyViewedRail';
import { TrendingRail } from '@/components/TrendingRail';
import { BottleHero } from '@/components/BottleHero';

const PILLARS = [
  { icon: Sparkles, title: 'AI Fragrance Advisor', body: 'Claude reads your taste like a perfumer — recommends from a real catalog, never a hallucinated name.', href: '/advisor', accent: 'gold' },
  { icon: Search, title: 'Fragrance Database', body: 'The full catalog with DNA scoring, note pyramids, accord bars, and Genome similarity matching.', href: '/database', accent: 'electric' },
  { icon: Package, title: 'Used Bottle Market', body: 'Casual classifieds for partial bottles. Anyone can browse — an account is only needed to request a purchase.', href: '/partial-bottles', accent: 'gold' },
  { icon: MessageSquare, title: 'ScentGPT', body: 'A chat expert that looks up real notes and prices before it answers. Ask it anything.', href: '/scentgpt', accent: 'electric' },
  { icon: Layers, title: 'Collection & Layering', body: 'Track every bottle and decant. Then get AI-powered layering combinations from what you already own.', href: '/collection', accent: 'gold' },
  { icon: ShieldCheck, title: 'Decant Marketplace', body: 'Escrow-protected decant trading. Funds held until delivery confirmed, auto-released 72h later.', href: '/marketplace', accent: 'electric' },
>>>>>>> Stashed changes
] as const;

export default function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 lg:pb-28 lg:pt-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
          <div className="text-center lg:text-left">
            <p className="section-label animate-fade-up mb-6">The Fragrance Operating System</p>
            <h1 className="animate-fade-up font-display text-5xl leading-[1.03] text-bone sm:text-6xl lg:text-7xl" style={{ animationDelay: '0.1s' }}>
              Know your <span className="shimmer-text font-display italic">scent.</span>
              <br />
              Own your <span className="font-display italic text-bone opacity-80">shelf.</span>
            </h1>
            <p className="animate-fade-up mx-auto mt-7 max-w-lg text-base leading-relaxed text-ash sm:text-lg lg:mx-0" style={{ animationDelay: '0.2s' }}>
              AI recommendations grounded in a real catalog. A Genome similarity engine that finds what
              actually smells alike. Collection tracking, a marketplace, and a chat expert that looks up
              real data before it speaks.
            </p>
            <div className="animate-fade-up mt-9 flex flex-wrap items-center justify-center gap-4 lg:justify-start" style={{ animationDelay: '0.3s' }}>
              <Link href="/advisor" className="btn-gold text-sm sm:text-base">Find My Fragrance</Link>
              <Link href="/database" className="btn-ghost text-sm sm:text-base">Explore Catalog</Link>
            </div>
          </div>
          <div className="animate-fade-up mx-auto w-48 sm:w-56 lg:w-full lg:max-w-xs" style={{ animationDelay: '0.35s' }}>
            <BottleHero />
          </div>
        </div>
      </section>
<<<<<<< Updated upstream
      <TrendingRail />
      <RecentlyViewedRail />
      <div className="divider-gold mx-auto max-w-5xl"/>
=======

      <TrendingRail />
      <RecentlyViewedRail />

      <div className="divider-gold mx-auto max-w-5xl" />

>>>>>>> Stashed changes
      <section className="px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="section-label mb-4">What ScentOS does</p>
          <h2 className="font-display text-3xl text-bone sm:text-4xl">One platform for the full fragrance life cycle.</h2>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {PILLARS.map(p => {
              const Icon = p.icon;
              const isGold = p.accent === 'gold';
              return (
                <Link key={p.title} href={p.href} className="card group p-6">
                  <div className="flex items-start justify-between">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${isGold ? 'bg-gold/12 text-gold' : 'bg-electric/12 text-electric'}`}>
                      <Icon size={17} />
                    </div>
                    <span className={`font-mono text-2xs opacity-0 transition-opacity group-hover:opacity-100 ${isGold ? 'text-gold' : 'text-electric'}`}>→</span>
                  </div>
                  <h3 className="mt-5 font-display text-xl text-bone">{p.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ash">{p.body}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <div className="divider-gold mx-auto max-w-5xl" />

      <section className="px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="glass-warm relative overflow-hidden rounded-3xl p-8 sm:p-12">
            <div className="glow-gold absolute -right-16 -top-16 h-64 w-64 opacity-40" />
            <p className="section-label mb-4">No account needed to browse</p>
            <h2 className="font-display text-3xl text-bone sm:text-4xl">Selling a partial bottle?</h2>
            <p className="mt-4 max-w-md text-ash">List your perfume name, days used, % left, payment preference, and contact info. Anyone can browse. An account is only needed to request a purchase.</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/partial-bottles/new" className="btn-gold">List a bottle</Link>
              <Link href="/partial-bottles" className="btn-ghost">Browse listings</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
