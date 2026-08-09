export function sanitizeString(input: unknown, maxLen = 1000): string {
  if (typeof input !== 'string') return '';
  return input.slice(0, maxLen).replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').replace(/javascript:/gi, '').trim();
}
export function sanitizeNumber(input: unknown, min?: number, max?: number): number | null {
  const n = Number(input); if (isNaN(n)) return null;
  if (min !== undefined && n < min) return null;
  if (max !== undefined && n > max) return null;
  return n;
}
export function sanitizeArray(input: unknown, maxItems = 20): string[] {
  if (!Array.isArray(input)) return [];
  return input.slice(0, maxItems).map(i => sanitizeString(i, 100)).filter(Boolean);
}
