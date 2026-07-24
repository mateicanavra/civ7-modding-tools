/**
 * Evaluates the latitude-only insolation curve shared across every tile in a row.
 *
 * @param absLatDeg - Absolute latitude in degrees; values beyond a pole are clamped.
 * @param options - Equatorial/polar endpoints and the curve exponent between them.
 * @returns The interpolated forcing used by surface-temperature computation.
 */
export function computeInsolationByLatitude(
  absLatDeg: number,
  options: { equator: number; pole: number; exponent: number }
): number {
  const t = Math.max(0, Math.min(1, absLatDeg / 90));
  const curve = Math.pow(t, Math.max(0.0001, options.exponent));
  return options.equator * (1 - curve) + options.pole * curve;
}
