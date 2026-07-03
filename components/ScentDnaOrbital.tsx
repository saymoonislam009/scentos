'use client';

import { motion } from 'framer-motion';

type Orbit = {
  radius: number;
  duration: number;
  reverse?: boolean;
  notes: { label: string; angle: number; tone: 'gold' | 'electric' }[];
};

const ORBITS: Orbit[] = [
  {
    radius: 92,
    duration: 24,
    notes: [
      { label: 'Bergamot', angle: 0, tone: 'gold' },
      { label: 'Pink Pepper', angle: 180, tone: 'electric' },
    ],
  },
  {
    radius: 152,
    duration: 36,
    reverse: true,
    notes: [
      { label: 'Oud', angle: 50, tone: 'electric' },
      { label: 'Amber', angle: 190, tone: 'gold' },
      { label: 'Iris', angle: 300, tone: 'gold' },
    ],
  },
  {
    radius: 212,
    duration: 50,
    notes: [
      { label: 'Vetiver', angle: 25, tone: 'gold' },
      { label: 'Musk', angle: 150, tone: 'electric' },
      { label: 'Sandalwood', angle: 265, tone: 'gold' },
    ],
  },
];

function OrbitRing({ orbit }: { orbit: Orbit }) {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      style={{ willChange: 'transform' }}
      animate={{ rotate: orbit.reverse ? -360 : 360 }}
      transition={{ repeat: Infinity, duration: orbit.duration, ease: 'linear' }}
    >
      <div
        className="absolute rounded-full border border-bone/10"
        style={{ width: orbit.radius * 2, height: orbit.radius * 2 }}
      />
      {orbit.notes.map((note) => (
        <div
          key={note.label}
          className="absolute"
          style={{
            transform: `rotate(${note.angle}deg) translateX(${orbit.radius}px)`,
          }}
        >
          {/* counter-rotate so the label and dot stay upright as the ring spins */}
          <motion.div
            className="flex items-center gap-2"
            style={{ transform: `rotate(${-note.angle}deg)` }}
            animate={{ rotate: orbit.reverse ? 360 - note.angle : -360 - note.angle }}
            transition={{ repeat: Infinity, duration: orbit.duration, ease: 'linear' }}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                note.tone === 'gold' ? 'bg-gold shadow-[0_0_12px_rgba(201,162,75,0.7)]' : 'bg-electric shadow-[0_0_12px_rgba(79,140,255,0.7)]'
              }`}
            />
            <span className="whitespace-nowrap rounded-full bg-obsidian/80 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ash">
              {note.label}
            </span>
          </motion.div>
        </div>
      ))}
    </motion.div>
  );
}

export function ScentDnaOrbital() {
  return (
    <div className="mx-auto flex h-[260px] w-full items-center justify-center overflow-hidden sm:h-[340px] md:h-[460px]">
      <div className="relative h-[460px] w-[460px] flex-shrink-0 origin-center scale-[0.56] sm:scale-[0.74] md:scale-100">
        <div className="absolute inset-0 rounded-full bg-radial-fade" />

        {/* faceted core — an abstracted bottle/gem silhouette, not a literal product photo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg width="86" height="86" viewBox="0 0 86 86" fill="none">
            <defs>
              <linearGradient id="coreGradient" x1="0" y1="0" x2="86" y2="86">
                <stop offset="0%" stopColor="#D9BD7A" />
                <stop offset="55%" stopColor="#C9A24B" />
                <stop offset="100%" stopColor="#4F8CFF" />
              </linearGradient>
            </defs>
            <polygon
              points="43,4 78,30 64,78 22,78 8,30"
              stroke="url(#coreGradient)"
              strokeWidth="1.5"
              fill="rgba(21,21,26,0.7)"
            />
            <polygon points="43,4 78,30 43,43 8,30" fill="rgba(201,162,75,0.18)" />
          </svg>
        </div>

        {ORBITS.map((orbit) => (
          <OrbitRing orbit={orbit} key={orbit.radius} />
        ))}
      </div>
    </div>
  );
}
