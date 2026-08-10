export function BottleMark({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="10" y="2" width="4" height="3" rx="0.75" fill="currentColor" />
      <path d="M8 8.5 L8 7.5Q8 6.3 9.2 6.3L14.8 6.3Q16 6.3 16 7.5L16 8.5Q19 11 19 14.5L19 19Q19 21 17 21L7 21Q5 21 5 19L5 14.5Q5 11 8 8.5Z"
        fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6 15Q6 12.5 8 10.5L16 10.5Q18 12.5 18 15L18 19Q18 20 17 20L7 20Q6 20 6 19Z" fill="currentColor" fillOpacity="0.55" />
    </svg>
  );
}
