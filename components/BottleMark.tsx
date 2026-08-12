/**
 * BottleMark — a quiet, single-stroke seal, not an illustration.
 * Used small: in the nav, and once, restrained, in the hero.
 * No fill, no color variance, no animation — the mark of a maker,
 * not a decoration.
 */
export function BottleMark({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="10.25" y="2" width="3.5" height="2.6" rx="0.5" stroke="currentColor" strokeWidth="1.1" />
      <path
        d="M8.3 8.2 L8.3 7.2 Q8.3 6.1 9.4 6.1 L14.6 6.1 Q15.7 6.1 15.7 7.2 L15.7 8.2 Q18.4 10.8 18.4 14.3 L18.4 18.8 Q18.4 20.6 16.6 20.6 L7.4 20.6 Q5.6 20.6 5.6 18.8 L5.6 14.3 Q5.6 10.8 8.3 8.2 Z"
        stroke="currentColor"
        strokeWidth="1.1"
        fill="none"
      />
      <line x1="6.2" y1="15.5" x2="17.8" y2="15.5" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.55" />
    </svg>
  );
}
