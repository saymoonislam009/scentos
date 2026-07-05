'use client';

const SEASON_COLORS: Record<string, string> = {
  spring: 'bg-green-500/15 text-green-300 border-green-500/20',
  summer: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/20',
  fall: 'bg-orange-500/15 text-orange-300 border-orange-500/20',
  winter: 'bg-blue-500/15 text-blue-300 border-blue-500/20',
};

const OCCASION_COLORS: Record<string, string> = {
  office: 'bg-bone/10 text-ash border-bone/15',
  'date-night': 'bg-gold/10 text-gold border-gold/20',
  casual: 'bg-electric/10 text-electric border-electric/20',
  formal: 'bg-bone/10 text-ash border-bone/15',
};

export function SeasonBadges({ seasons }: { seasons: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {seasons.map((s) => (
        <span key={s} className={`rounded-full border px-3 py-1 text-xs capitalize ${SEASON_COLORS[s] ?? 'bg-bone/10 text-ash border-bone/15'}`}>
          {s}
        </span>
      ))}
    </div>
  );
}

export function OccasionBadges({ occasions }: { occasions: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {occasions.map((o) => (
        <span key={o} className={`rounded-full border px-3 py-1 text-xs capitalize ${OCCASION_COLORS[o] ?? 'bg-bone/10 text-ash border-bone/15'}`}>
          {o.replace('-', ' ')}
        </span>
      ))}
    </div>
  );
}

export function PerfStat({ label, value, max = 10 }: { label: string; value: number; max?: number }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-ash">{label}</span>
        <span className="font-mono text-bone">{value}/{max}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-bone/10">
        <div className="h-full rounded-full bg-gradient-to-r from-electric to-gold" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
