import Link from 'next/link';
const PILLARS=[
  {num:'01',title:'AI Fragrance Advisor',body:'Claude reads your taste like a perfumer — recommends from a real catalog, never a hallucinated name.',href:'/advisor',accent:'gold'},
  {num:'02',title:'Fragrance Database',body:'The full catalog with DNA scoring, note pyramids, accord bars, and Genome similarity matching.',href:'/database',accent:'electric'},
  {num:'03',title:'Used Bottle Market',body:'Casual classifieds for partial bottles. Anyone can browse — an account is only needed to request a purchase.',href:'/partial-bottles',accent:'gold'},
  {num:'04',title:'ScentGPT',body:'A chat expert that looks up real notes and prices before it answers. Ask it anything.',href:'/scentgpt',accent:'electric'},
  {num:'05',title:'Collection & Layering',body:'Track every bottle and decant. Then get AI-powered layering combinations from what you already own.',href:'/collection',accent:'gold'},
  {num:'06',title:'Decant Marketplace',body:'Escrow-protected decant trading. Funds held until delivery confirmed, auto-released 72h later.',href:'/marketplace',accent:'electric'},
] as const;
export default function HomePage() {
  return (
    <div>
      <section className="relative px-4 pb-32 pt-24 sm:px-6 lg:pt-36 overflow-hidden">
        <div className="glow-gold absolute -top-32 left-1/2 h-[600px] w-[600px] -translate-x-1/2 opacity-60"/>
        <div className="relative mx-auto max-w-4xl text-center">
          <p className="section-label animate-fade-up mb-6">The Fragrance Operating System</p>
          <h1 className="animate-fade-up font-display text-5xl leading-[1.02] text-bone sm:text-7xl lg:text-8xl" style={{animationDelay:'0.1s'}}>
            Know your{' '}<span className="shimmer-text font-display italic">scent</span>.{}<br className="hidden sm:block"/>{'  '}
            Own your{' '}<span className="font-display italic text-bone opacity-80">shelf.</span>
          </h1>
          <p className="animate-fade-up mx-auto mt-8 max-w-xl text-base leading-relaxed text-ash sm:text-lg" style={{animationDelay:'0.2s'}}>
            AI recommendations grounded in a real catalog. Genome similarity engine. Collection tracking,
            marketplace, and a chat expert that looks up real data before it speaks.
          </p>
          <div className="animate-fade-up mt-10 flex flex-wrap items-center justify-center gap-4" style={{animationDelay:'0.3s'}}>
            <Link href="/advisor" className="btn-gold text-sm sm:text-base">Find My Fragrance</Link>
            <Link href="/database" className="btn-ghost text-sm sm:text-base">Explore Catalog</Link>
          </div>
        </div>
      </section>
      <div className="divider-gold mx-auto max-w-5xl"/>
      <section className="px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="section-label mb-4">What ScentOS does</p>
          <h2 className="font-display text-3xl text-bone sm:text-4xl">One platform for the full fragrance life cycle.</h2>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {PILLARS.map(p=>(
              <Link key={p.num} href={p.href} className="card group p-6">
                <div className="flex items-start justify-between">
                  <span className={`font-mono text-2xs ${p.accent==='gold'?'text-gold':'text-electric'}`}>{p.num}</span>
                  <span className={`font-mono text-2xs opacity-0 transition-opacity group-hover:opacity-100 ${p.accent==='gold'?'text-gold':'text-electric'}`}>→</span>
                </div>
                <h3 className="mt-4 font-display text-xl text-bone">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ash">{p.body}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <div className="divider-gold mx-auto max-w-5xl"/>
      <section className="px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="glass-warm rounded-3xl p-8 sm:p-12">
            <p className="section-label mb-4">No account needed to browse</p>
            <h2 className="font-display text-3xl text-bone sm:text-4xl">Selling a partial bottle?</h2>
            <p className="mt-4 text-ash">List your perfume name, days used, % left, payment preference, and contact info. Anyone can browse. An account is only needed to request a purchase.</p>
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
