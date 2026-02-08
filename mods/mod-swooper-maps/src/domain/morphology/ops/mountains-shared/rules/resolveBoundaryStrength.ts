const BOUNDARY_STRENGTH_EPS = 1e-6;

/**
 * Converts boundary proximity into a normalized boundary strength.
 */
export function resolveBoundaryStrength(closenessNorm: number, boundaryGate: number, exponent: number): number {
  const normalized =
    closenessNorm <= boundaryGate
      ? 0
      : (closenessNorm - boundaryGate) / Math.max(BOUNDARY_STRENGTH_EPS, 1 - boundaryGate);
  return Math.pow(normalized, exponent);
}

