'use client';
const SS: Record<string, string> = { spring: 'border-green-500/25 bg-green-500/[0.08] text-green-300', summer: 'border-yellow-500/25 bg-yellow-500/[0.08] text-yellow-300', fall: 'border-orange-500/25 bg-orange-500/[0.08] text-orange-300', winter: 'border-blue-500/25 bg-blue-500/[0.08] text-blue-300' };
const OS: Record<string, string> = { 'office': 'border-bone/15 text-ash', 'date-night': 'border-gold/25 bg-gold/[0.08] text-gold', 'casual': 'border-electric/25 bg-electric/[0.08] text-electric', 'formal': 'border-bone/20 bg-bone/5 text-bone' };
export function SeasonBadges({ seasons }: { seasons: string[] }) {
  return <div className="flex flex-wrap gap-2">{seasons.map(s => <span key={s} className={`badge border capitalize ${SS[s] ?? 'border-bone/15 text-ash'}`}>{s}</span>)}</div>;
}
export function OccasionBadges({ occasions }: { occasions: string[] }) {
  return <div className="flex flex-wrap gap-2">{occasions.map(o => <span key={o} className={`badge border capitalize ${OS[o] ?? 'border-bone/15 text-ash'}`}>{o.replace('-', ' ')}</span>)}</div>;
}
export function PerfStat({ label, value, max = 10 }: { label: string; value: number; max?: number }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div>
      <div className="mb-1.5 flex justify-between"><span className="text-xs text-ash">{label}</span><span className="font-mono text-2xs text-bone">{value}/{max}</span></div>
      <div className="h-1.5 overflow-hidden rounded-full bg-bone/[0.06]"><div className="accord-bar h-full rounded-full transition-all duration-700" style={{ width: `${pct}%` }} /></div>
    </div>
  );
}
