import Link from 'next/link';
import { RecentlyViewedRail } from '@/components/RecentlyViewedRail';
import { TrendingRail } from '@/components/TrendingRail';
import { AmbientGlow } from '@/components/BottleHero';
import { BottleMark } from '@/components/BottleMark';

const PILLARS = [
  { num: '01', title: 'AI Fragrance Advisor', body: 'Claude reads your taste like a perfumer would — recommends from a real catalog, never a hallucinated name.', href: '/advisor' },
  { num: '02', title: 'Fragrance Database', body: 'The full catalog with DNA scoring, note pyramids, accord bars, and Genome similarity matching.', href: '/database' },
  { num: '03', title: 'Used Bottle Market', body: 'Casual classifieds for partial bottles. Browse freely — an account is only needed to request a purchase.', href: '/partial-bottles' },
  { num: '04', title: 'ScentGPT', body: 'A chat expert that looks up real notes and prices before it answers. Ask it anything.', href: '/scentgpt' },
  { num: '05', title: 'Collection & Layering', body: 'Track every bottle and decant, then get AI-composed layering combinations from what you already own.', href: '/collection' },
  { num: '06', title: 'Decant Marketplace', body: 'Escrow-protected trading. Funds held until delivery is confirmed, released automatically 72 hours later.', href: '/marketplace' },
] as const;

export default function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden px-4 pb-24 pt-20 sm:px-6 lg:pb-32 lg:pt-28">
        <AmbientGlow className="left-1/2 top-0 h-[36rem] w-[36rem] -translate-x-1/2" />
        <div className="mx-auto max-w-2xl text-center">
          <div className="animate-fade-up mb-8 flex items-center justify-center gap-3">
            <BottleMark className="h-5 w-5 text-gold/70" />
          </div>
          <p className="section-label animate-fade-up mb-6">The Fragrance Operating System</p>
          <h1 className="animate-fade-up font-display text-5xl leading-[1.06] text-bone sm:text-6xl lg:text-7xl" style={{ animationDelay: '0.1s' }}>
            Know your <span className="shimmer-text font-display italic">scent.</span>
            <br />
            Own your shelf.
          </h1>
          <p className="animate-fade-up mx-auto mt-8 max-w-md text-base leading-relaxed text-ash" style={{ animationDelay: '0.2s' }}>
            AI recommendations grounded in a real catalog. A Genome engine that finds what actually
            smells alike. Collection tracking, a marketplace, and a chat expert that checks its facts.
          </p>
          <div className="animate-fade-up mt-10 flex flex-wrap items-center justify-center gap-4" style={{ animationDelay: '0.3s' }}>
            <Link href="/advisor" className="btn-gold text-sm sm:text-base">Find My Fragrance</Link>
            <Link href="/database" className="btn-ghost text-sm sm:text-base">Explore Catalog</Link>
          </div>
        </div>
      </section>

      <TrendingRail />
      <RecentlyViewedRail />

      <div className="divider-gold mx-auto max-w-4xl" />

      <section className="px-4 py-28 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <p className="section-label mb-4 text-center">The Index</p>
          <h2 className="text-center font-display text-3xl text-bone sm:text-4xl">One platform for the full fragrance life cycle.</h2>

          <div className="mt-16 divide-y divide-bone/[0.06]">
            {PILLARS.map(p => (
              <Link key={p.num} href={p.href} className="group flex items-start gap-6 py-8 transition-colors sm:gap-10">
                <span className="font-display text-2xl text-gold/35 transition-colors duration-300 group-hover:text-gold sm:text-3xl">{p.num}</span>
                <div className="flex-1">
                  <h3 className="font-display text-xl text-bone sm:text-2xl">{p.title}</h3>
                  <p className="mt-2 max-w-lg text-sm leading-relaxed text-ash sm:text-base">{p.body}</p>
                </div>
                <span className="mt-2 shrink-0 font-mono text-xs text-ash/40 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:text-gold group-hover:opacity-100">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="divider-gold mx-auto max-w-4xl" />

      <section className="px-4 py-28 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="section-label mb-4">No account needed to browse</p>
          <h2 className="font-display text-3xl text-bone sm:text-4xl">Selling a partial bottle?</h2>
          <p className="mx-auto mt-4 max-w-md text-ash">List your perfume name, days used, percent remaining, payment preference, and contact info. Anyone can browse — an account is only needed to request a purchase.</p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Link href="/partial-bottles/new" className="btn-gold">List a bottle</Link>
            <Link href="/partial-bottles" className="btn-ghost">Browse listings</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
