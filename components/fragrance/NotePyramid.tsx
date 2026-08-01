'use client';
export function NotePyramid({ notes }:{ notes:{ position:string; notes:{ name:string }|null }[] }) {
  const top:string[]=[],mid:string[]=[],base:string[]=[];
  for(const n of notes){ const name=n.notes?.name; if(!name) continue; if(n.position==='top') top.push(name); else if(n.position==='mid') mid.push(name); else base.push(name); }
  const Row=({ label, items, color }:{ label:string; items:string[]; color:string })=>items.length===0?null:(
    <div className="flex items-start gap-4">
      <span className={`mt-0.5 w-10 shrink-0 text-right font-mono text-2xs uppercase tracking-wider ${color}`}>{label}</span>
      <div className="flex flex-wrap gap-1.5">{items.map(name=><span key={name} className="note-pill">{name}</span>)}</div>
    </div>
  );
  return (
    <div className="space-y-3">
      <Row label="Top" items={top} color="text-electric"/>
      <Row label="Heart" items={mid} color="text-gold"/>
      <Row label="Base" items={base} color="text-ash"/>
    </div>
  );
}
