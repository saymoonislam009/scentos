export function BottleHero({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`} aria-hidden="true">
      <div className="bottle-ambient-glow" />
      <svg viewBox="0 0 280 420" fill="none" className="relative w-full h-auto drop-shadow-[0_20px_60px_rgba(201,162,75,0.15)]">
        <defs>
          <linearGradient id="liquidGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFAE5C" />
            <stop offset="55%" stopColor="#E8934A" />
            <stop offset="100%" stopColor="#B8622A" />
          </linearGradient>
          <linearGradient id="glassGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#EDE8DF" stopOpacity="0.10" />
            <stop offset="50%" stopColor="#EDE8DF" stopOpacity="0.02" />
            <stop offset="100%" stopColor="#EDE8DF" stopOpacity="0.07" />
          </linearGradient>
          <linearGradient id="capGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D9BD7A" />
            <stop offset="100%" stopColor="#8F7033" />
          </linearGradient>
          <clipPath id="bottleClip">
            <path d="M92 140 L92 128 Q92 118 104 118 L176 118 Q188 118 188 128 L188 140 Q212 168 212 210 L212 372 Q212 396 188 396 L92 396 Q68 396 68 372 L68 210 Q68 168 92 140 Z" />
          </clipPath>
        </defs>

        {/* rising mist */}
        <g className="bottle-mist">
          <circle cx="140" cy="70" r="3.5" fill="#EDD99A" opacity="0.5" />
          <circle cx="152" cy="48" r="2.5" fill="#EDD99A" opacity="0.35" />
          <circle cx="126" cy="55" r="2" fill="#EDD99A" opacity="0.3" />
        </g>
        <g className="bottle-mist" style={{ animationDelay: '1.6s' }}>
          <circle cx="146" cy="66" r="3" fill="#F4C58C" opacity="0.45" />
          <circle cx="132" cy="44" r="2" fill="#F4C58C" opacity="0.3" />
        </g>

        {/* cap */}
        <rect x="118" y="86" width="44" height="34" rx="6" fill="url(#capGrad)" stroke="#EDD99A" strokeOpacity="0.4" strokeWidth="1" />
        <rect x="126" y="78" width="28" height="14" rx="3" fill="#C9A24B" />

        {/* bottle body glass */}
        <path d="M92 140 L92 128 Q92 118 104 118 L176 118 Q188 118 188 128 L188 140 Q212 168 212 210 L212 372 Q212 396 188 396 L92 396 Q68 396 68 372 L68 210 Q68 168 92 140 Z"
          fill="url(#glassGrad)" stroke="#C9A24B" strokeOpacity="0.45" strokeWidth="1.5" />

        {/* liquid fill, clipped to bottle shape */}
        <g clipPath="url(#bottleClip)">
          <rect className="bottle-liquid" x="60" y="230" width="160" height="180" fill="url(#liquidGrad)" />
          <rect x="60" y="228" width="160" height="4" fill="#FFC98A" opacity="0.55" />
        </g>

        {/* glass refraction highlights */}
        <line x1="98" y1="150" x2="98" y2="380" stroke="#EDE8DF" strokeOpacity="0.12" strokeWidth="3" strokeLinecap="round" />
        <line x1="112" y1="150" x2="112" y2="380" stroke="#EDE8DF" strokeOpacity="0.06" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="182" y1="170" x2="182" y2="360" stroke="#EDE8DF" strokeOpacity="0.08" strokeWidth="2" strokeLinecap="round" />

        {/* label */}
        <rect x="88" y="255" width="104" height="52" rx="3" fill="#080806" fillOpacity="0.35" stroke="#EDD99A" strokeOpacity="0.25" strokeWidth="0.75" />
        <line x1="102" y1="272" x2="178" y2="272" stroke="#EDD99A" strokeOpacity="0.4" strokeWidth="1" />
        <line x1="110" y1="282" x2="170" y2="282" stroke="#EDD99A" strokeOpacity="0.25" strokeWidth="0.75" />
        <line x1="118" y1="291" x2="162" y2="291" stroke="#EDD99A" strokeOpacity="0.25" strokeWidth="0.75" />
      </svg>
    </div>
  );
}
