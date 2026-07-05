'use client';

type NoteGroup = { top: string[]; mid: string[]; base: string[] };

export function NotePyramid({ notes }: { notes: { position: string; notes: { name: string } | null }[] }) {
  const groups: NoteGroup = { top: [], mid: [], base: [] };
  for (const n of notes) {
    const name = n.notes?.name;
    if (!name) continue;
    if (n.position === 'top') groups.top.push(name);
    else if (n.position === 'mid') groups.mid.push(name);
    else groups.base.push(name);
  }

  const row = (label: string, items: string[], color: string) =>
    items.length > 0 ? (
      <div key={label} className="flex gap-4">
        <div className="w-16 shrink-0 pt-1 text-right text-xs uppercase tracking-wider text-ash">{label}</div>
        <div className="flex flex-wrap gap-2">
          {items.map((name) => (
            <span key={name}
              className={`rounded-full border px-3 py-1 text-xs ${color}`}>
              {name}
            </span>
          ))}
        </div>
      </div>
    ) : null;

  return (
    <div className="space-y-3">
      {row('Top', groups.top, 'border-electric/30 bg-electric/5 text-bone')}
      {row('Heart', groups.mid, 'border-gold/30 bg-gold/5 text-bone')}
      {row('Base', groups.base, 'border-bone/20 bg-bone/5 text-bone')}
    </div>
  );
}
