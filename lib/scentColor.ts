/**
 * scentColor — turns a fragrance's DNA scores into a single accent color,
 * the way a perfumer's blotter is color-coded by scent family. Cool electric
 * blue reads as fresh/light, warm amber reads as sweet/rich. Used as a thin
 * signature strip on catalog cards so the grid carries scent information at
 * a glance, not just text.
 */
export function scentColor(dna?: { sweetness?: number; freshness?: number } | null): string | null {
  if (!dna || dna.sweetness == null || dna.freshness == null) return null;
  const total = dna.sweetness + dna.freshness;
  const t = total > 0 ? Math.max(0, Math.min(1, dna.sweetness / total)) : 0.5;
  const cool: [number, number, number] = [79, 140, 255]; // electric — fresh
  const warm: [number, number, number] = [201, 130, 58]; // amber — sweet
  const rgb = cool.map((c, i) => Math.round(c + (warm[i] - c) * t));
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}
