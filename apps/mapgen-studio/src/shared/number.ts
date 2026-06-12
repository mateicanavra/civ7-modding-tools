// Numeric helpers shared across Studio features. Extracted verbatim from
// `App.tsx` during the app-decomposition slice.

export function clampNumber(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
