'use client';
import { useId } from 'react';

/**
 * ScentMark — the BottleMark seal, scaled up into a hero centerpiece with a
 * slow, breathing liquid fill inside the glass. Same restrained line-art
 * vocabulary as BottleMark (single stroke, no illustration) — the only
 * departure is a clipped gradient fill standing in for light through liquid.
 * Used once, large, as the landing page's signature visual.
 */
export function ScentMark({ className = 'h-24 w-24' }: { className?: string }) {
  const id = useId();
  const clipId = `sm-clip-${id}`;
  const gradId = `sm-grad-${id}`;
  const bottlePath = 'M8.3 8.2 L8.3 7.2 Q8.3 6.1 9.4 6.1 L14.6 6.1 Q15.7 6.1 15.7 7.2 L15.7 8.2 Q18.4 10.8 18.4 14.3 L18.4 18.8 Q18.4 20.6 16.6 20.6 L7.4 20.6 Q5.6 20.6 5.6 18.8 L5.6 14.3 Q5.6 10.8 8.3 8.2 Z';
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <defs>
        <clipPath id={clipId}><path d={bottlePath} /></clipPath>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EDD99A" />
          <stop offset="45%" stopColor="#C9A24B" />
          <stop offset="100%" stopColor="#B8622A" />
        </linearGradient>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect className="scentmark-liquid" x="4" y="11.5" width="16" height="10.5" fill={`url(#${gradId})`} opacity="0.9" />
      </g>
      <rect x="10.25" y="2" width="3.5" height="2.6" rx="0.5" stroke="currentColor" strokeWidth="0.9" />
      <path d={bottlePath} stroke="currentColor" strokeWidth="0.9" fill="none" />
      <line x1="6.2" y1="15.5" x2="17.8" y2="15.5" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.4" />
    </svg>
  );
}
