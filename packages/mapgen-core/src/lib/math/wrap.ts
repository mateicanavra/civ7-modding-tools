/**
 * Folds a displacement between coordinates in the same base span onto the nearest periodic image.
 * It shifts by at most one span, preserves signed half-span ties, and returns the input unchanged
 * when the displacement or positive span is invalid.
 */
export function wrapDeltaPeriodic(dx: number, span: number): number {
  if (!Number.isFinite(dx) || !Number.isFinite(span) || span <= 0) return dx;
  const half = span * 0.5;
  if (dx > half) return dx - span;
  if (dx < -half) return dx + span;
  return dx;
}

/**
 * Returns the absolute periodic displacement using {@link wrapDeltaPeriodic}'s one-span assumptions.
 * This is the distance form used by wrapped mesh and projection comparisons.
 */
export function wrapAbsDeltaPeriodic(dx: number, span: number): number {
  return Math.abs(wrapDeltaPeriodic(dx, span));
}
