const BOUNDARY_STRENGTH_EPS = 1e-6;

/**
 * Shapes boundary proximity into the shared landform-strength signal.
 * Values inside the authored gate carry no boundary influence; values beyond
 * it are renormalized and exponent-shaped for ridge and foothill scoring.
 */
export function resolveBoundaryStrength(
  closenessNorm: number,
  boundaryGate: number,
  exponent: number
): number {
  const normalized =
    closenessNorm <= boundaryGate
      ? 0
      : (closenessNorm - boundaryGate) / Math.max(BOUNDARY_STRENGTH_EPS, 1 - boundaryGate);
  return Math.pow(normalized, exponent);
}
