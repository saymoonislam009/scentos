/**
 * AmbientGlow — abstract atmospheric light, evoking light diffusing through
 * liquid in glass without any literal illustration. Luxury fragrance brands
 * (Byredo, Diptyque, Aesop) lean on photographic light and restraint rather
 * than decorative iconography — this is the digital equivalent: a slow,
 * barely-perceptible field of warm light behind the type.
 */
export function AmbientGlow({ className = '' }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute ${className}`} aria-hidden="true">
      <div className="ambient-glow-core" />
      <div className="ambient-glow-ring" />
    </div>
  );
}

export { AmbientGlow as BottleHero };
