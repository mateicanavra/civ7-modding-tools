/**
 * Applies the authored runoff source floor before topological discharge accumulation.
 *
 * @param value - Rainfall-derived runoff source at one land tile.
 * @param min - Minimum runoff admitted into the drainage graph.
 * @returns The larger of the source value and configured floor.
 */
export function clampMin(value: number, min: number): number {
  return value < min ? min : value;
}
