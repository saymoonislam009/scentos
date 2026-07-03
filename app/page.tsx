import Link from 'next/link';
import { ScentDnaOrbital } from '@/components/ScentDnaOrbital';

const PILLARS = [
  {
    title: 'AI Fragrance Advisor',
    copy: 'Tell it your budget, climate, and the bottles you already love — get matches with real reasoning, not a generic quiz score.',
    href: '/advisor',
    tone: 'electric',
  },
  {
    title: 'Fragrance Genome',
    copy: 'Every fragrance mapped against the catalog for true similarity: clones, upgrades, and budget alternatives, ranked by percentage.',
    href: '/database',
    tone: 'gold',
  },
  {
    title: 'Collection & Decants',
    copy: 'Track bottles, decants, and empties. See your collection value, your most-worn notes, and trade safely through escrow.',
    href: '/collection',
    tone: 'electric',
  },
  {
    title: 'ScentGPT',
    copy: 'A chat-based fragrance expert that looks up real notes and prices before it answers — ask it to build you a capsule wardrobe.',
    href: '/scentgpt',
    tone: 'gold',
  },
  {
    title: 'Used Bottle Marketplace',
    copy: 'Selling a partially-used bottle? List the days used, what\u2019s left, and how you want to be paid — anyone can browse, an account is only needed to buy.',
    href: '/partial-bottles',
    tone: 'electric',
  },
] as const;

export default function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden px-6 pb-24 pt-16 md:pt-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2">
          <div>
            <p className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-electric">
              The fragrance operating system
            </p>
            <h1 className="font-display text-5xl leading-[1.05] text-bone md:text-6xl">
              Discover your <span className="italic text-gold">perfect scent</span> with AI.
            </h1>
            <p className="mt-6 max-w-md text-ash">
              ScentOS reads your taste like a perfumer would — then backs every recommendation
              with a real catalog of notes, prices, and community data.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/advisor"
                className="rounded-full bg-gold px-6 py-3 text-sm font-medium text-matte transition-transform hover:scale-[1.03]"
              >
                Find My Fragrance
              </Link>
              <Link
                href="/database"
                className="rounded-full border border-bone/20 px-6 py-3 text-sm text-bone transition-colors hover:border-bone/50"
              >
                Explore Database
              </Link>
            </div>
          </div>

          <ScentDnaOrbital />
        </div>
      </section>

      <section className="border-t border-bone/10 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-2xl text-bone">One system, the whole fragrance life cycle.</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {PILLARS.map((pillar) => (
              <Link
                href={pillar.href}
                key={pillar.title}
                className="glass group rounded-2xl p-7 transition-colors hover:border-bone/20"
              >
                <h3 className="font-display text-xl text-bone">{pillar.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ash">{pillar.copy}</p>
                <span
                  className={`mt-5 inline-block text-xs font-mono uppercase tracking-wider ${
                    pillar.tone === 'gold' ? 'text-gold' : 'text-electric'
                  }`}
                >
                  Open →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
