import Link from 'next/link';
import { RecentlyViewedRail } from '@/components/RecentlyViewedRail';
import { TrendingRail } from '@/components/TrendingRail';
import { AmbientGlow } from '@/components/BottleHero';
import { BottleMark } from '@/components/BottleMark';
import { createAdminClient } from '@/lib/supabase/admin';

const PILLARS = [
  { num: '01', title: 'AI Fragrance Advisor', body: 'Claude reads your taste like a perfumer would — recommends from a real catalog, never a hallucinated name.', href: '/advisor' },
  { num: '02', title: 'Fragrance Database', body: 'The full catalog with DNA scoring, note pyramids, accord bars, and Genome similarity matching.', href: '/database' },
  { num: '03', title: 'Used Bottle Market', body: 'Casual classifieds for partial bottles. Message sellers directly in-app — sharing a phone number is always optional.', href: '/partial-bottles' },
  { num: '04', title: 'ScentGPT', body: 'A chat expert that looks up real notes and prices before it answers. Ask it anything.', href: '/scentgpt' },
  { num: '05', title: 'Collection & Layering', body: 'Track every bottle and decant, then get AI-composed layering combinations from what you already own.', href: '/collection' },
  { num: '06', title: 'Decant Marketplace', body: 'Escrow-protected trading. Funds held until delivery is confirmed, released automatically 72 hours later.', href: '/marketplace' },
] as const;

async function getLiveStats() {
  try {
    const a = createAdminClient();
    const count = async (table: string, filter?: (q: any) => any) => {
      let q = a.from(table).select('*', { count: 'exact', head: true });
      if (filter) q = filter(q);
      const { count: c } = await q;
      return c ?? 0;
    };
    const [fragrances, brands, listings] = await Promise.all([
      count('fragrances', q => q.eq('discontinued', false)),
      count('brands'),
      count('partial_bottle_listings', q => q.eq('status', 'active')),
    ]);
    return { fragrances, brands, listings };
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const stats = await getLiveStats();

  return (
    <div>
      <section className="relative overflow-hidden px-4 pb-16 pt-20 sm:px-6 lg:pb-20 lg:pt-28">
        <AmbientGlow className="left-1/2 top-0 h-[36rem] w-[36rem] -translate-x-1/2" />
        <div className="mx-auto max-w-2xl text-center">
          <div className="animate-fade-up mb-8 flex items-center justify-center gap-3">
            <BottleMark className="h-5 w-5 text-gold/70" />
          </div>
          <p className="section-label animate-fade-up mb-6">The Fragrance Operating System</p>
          <h1 className="animate-fade-up font-display text-4xl leading-[1.08] text-bone sm:text-6xl lg:text-7xl" style={{ animationDelay: '0.1s' }}>
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
          <p className="animate-fade-up mt-5 font-mono text-2xs text-ash/60" style={{ animationDelay: '0.35s' }}>
            Free to browse. No account needed until you buy, sell, or save something. <Link href="/quiz" className="text-gold/80 hover:text-gold hover:underline">Not sure yet? Take the 30-second quiz →</Link>
          </p>
        </div>
      </section>

      <div className="animate-fade-up px-4 pb-10 sm:px-6" style={{ animationDelay: '0.38s' }}>
        <div className="mx-auto flex max-w-lg flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {[
            { l: 'Privacy-first messaging' },
            { l: 'Escrow-protected trades' },
            { l: 'Catalog-grounded AI' },
          ].map(t => (
            <div key={t.l} className="flex items-center gap-2 text-xs text-ash">
              <span className="h-1 w-1 rounded-full bg-gold/60" />
              {t.l}
            </div>
          ))}
        </div>
      </div>

      {stats && (stats.fragrances > 0 || stats.brands > 0) && (
        <div className="animate-fade-up px-4 pb-16 sm:px-6" style={{ animationDelay: '0.4s' }}>
          <div className="mx-auto flex max-w-md flex-wrap items-center justify-center gap-x-10 gap-y-4 text-center">
            {[
              { v: stats.fragrances, l: 'Fragrances catalogued' },
              { v: stats.brands, l: 'Brands' },
              { v: stats.listings, l: 'Active listings' },
            ].filter(s => s.v > 0).map(s => (
              <div key={s.l}>
                <p className="font-display text-2xl text-gold sm:text-3xl">{s.v.toLocaleString()}</p>
                <p className="mt-0.5 font-mono text-2xs uppercase tracking-wider text-ash">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      )}

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
          <p className="section-label mb-4">Your number stays yours</p>
          <h2 className="font-display text-3xl text-bone sm:text-4xl">Selling a partial bottle?</h2>
          <p className="mx-auto mt-4 max-w-md text-ash">List your perfume name, days used, percent remaining, and payment preference. Buyers message you in-app — sharing a phone number is entirely optional.</p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Link href="/partial-bottles/new" className="btn-gold">List a bottle</Link>
            <Link href="/partial-bottles" className="btn-ghost">Browse listings</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
