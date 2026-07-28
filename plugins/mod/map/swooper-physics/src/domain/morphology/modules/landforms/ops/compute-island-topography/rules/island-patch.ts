import { getHexNeighborIndicesOddQ } from "@swooper/mapgen-core/lib/grid";
import { ISLAND_FORMATION_CLASS } from "../../../model/policy/island-formation.js";

type LabelRng = (range: number, label: string) => number;
type FormedIslandClass =
  | typeof ISLAND_FORMATION_CLASS.islandChain
  | typeof ISLAND_FORMATION_CLASS.microcontinent;

/**
 * Grows one connected, duplicate-free island formation over eligible base water.
 *
 * Each loop either admits one tile or retires one exhausted frontier tile, so bounded completion
 * follows from the requested patch size without an independent iteration cap. A formation whose
 * connected capacity cannot satisfy its declared floor is rolled back atomically.
 */
export function growIslandPatch(params: {
  seedIndex: number;
  formationClass: FormedIslandClass;
  minimumTiles: number;
  targetTiles: number;
  width: number;
  height: number;
  baseLandMask: ArrayLike<number>;
  distanceToCoast: ArrayLike<number>;
  minimumCoastDistance: number;
  islandClass: Uint8Array;
  rng: LabelRng;
  label: string;
}): number {
  const {
    seedIndex,
    formationClass,
    width,
    height,
    baseLandMask,
    distanceToCoast,
    minimumCoastDistance,
    islandClass,
    rng,
    label,
  } = params;
  const size = width * height;

  const isEligible = (index: number): boolean =>
    index >= 0 &&
    index < size &&
    baseLandMask[index] !== 1 &&
    islandClass[index] === ISLAND_FORMATION_CLASS.unchanged &&
    distanceToCoast[index] >= minimumCoastDistance;

  if (!isEligible(seedIndex) || params.targetTiles < params.minimumTiles) return 0;

  islandClass[seedIndex] = formationClass;
  const admittedIndices = [seedIndex];
  const frontier = [seedIndex];
  const targetTiles = params.targetTiles;
  let admittedTiles = 1;

  while (frontier.length > 0 && admittedTiles < targetTiles) {
    const frontierPosition = rng(frontier.length, `${label}:frontier`);
    const fromIndex = frontier[frontierPosition];
    if (fromIndex === undefined) break;

    const fromY = Math.floor(fromIndex / width);
    const fromX = fromIndex - fromY * width;
    const neighbors = getHexNeighborIndicesOddQ(fromX, fromY, width, height);
    const neighborStart = rng(neighbors.length, `${label}:neighbor-start`);
    let selectedIndex = -1;

    for (let offset = 0; offset < neighbors.length; offset += 1) {
      const candidateIndex = neighbors[(neighborStart + offset) % neighbors.length];
      if (candidateIndex !== undefined && isEligible(candidateIndex)) {
        selectedIndex = candidateIndex;
        break;
      }
    }

    if (selectedIndex < 0) {
      const last = frontier.pop();
      if (frontierPosition < frontier.length && last !== undefined) {
        frontier[frontierPosition] = last;
      }
      continue;
    }

    islandClass[selectedIndex] = formationClass;
    admittedIndices.push(selectedIndex);
    frontier.push(selectedIndex);
    admittedTiles += 1;
  }

  if (admittedTiles < params.minimumTiles) {
    for (const index of admittedIndices) {
      islandClass[index] = ISLAND_FORMATION_CLASS.unchanged;
    }
    return 0;
  }

  return admittedTiles;
}
