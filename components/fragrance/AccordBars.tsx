'use client';
export function AccordBars({ accords }: { accords: { name: string; strength: number }[] }) {
  const sorted = [...accords].sort((a, b) => b.strength - a.strength);
  return (
    <div className="space-y-3">
      {sorted.map(a => (
        <div key={a.name} className="flex items-center gap-3">
          <span className="w-28 shrink-0 text-right font-mono text-2xs text-ash">{a.name}</span>
          <div className="flex-1 overflow-hidden rounded-full bg-bone/[0.06]">
            <div className="accord-bar h-2 rounded-full transition-all duration-700" style={{ width: `${Math.min(a.strength * 100, 100)}%` }} />
          </div>
          <span className="w-8 text-right font-mono text-2xs text-ash/60">{Math.round(a.strength * 100)}%</span>
        </div>
      ))}
    </div>
  );
}
