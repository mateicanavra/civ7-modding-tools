import { hexDistanceOddQPeriodicX } from "@swooper/mapgen-core/lib/grid";

/**
 * Reports whether a candidate preserves the authored wrapped-hex spacing from every placement.
 */
export function admitsVolcanoSpacing(
  candidateIndex: number,
  placedIndices: readonly number[],
  minimumSpacing: number,
  mapWidth: number
): boolean {
  return placedIndices.every(
    (placedIndex) =>
      hexDistanceOddQPeriodicX(candidateIndex, placedIndex, mapWidth) >= minimumSpacing
  );
}
