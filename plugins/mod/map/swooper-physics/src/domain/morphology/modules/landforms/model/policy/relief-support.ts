/** Empirical mountain resolution floor in downward model elevation units, not an Earth slope angle. */
export const MOUNTAIN_DOWNWARD_RELIEF_MIN = 4;
/** Empirical hill resolution floor in absolute model elevation units, not an Earth slope angle. */
export const HILL_ABSOLUTE_RELIEF_MIN = 2;

/** Retains the rough-land planner's 16-unit relief normalization across the landform family. */
export function normalizeReliefSupport(relief: number): number {
  return Math.max(0, Math.min(1, relief / 16));
}
