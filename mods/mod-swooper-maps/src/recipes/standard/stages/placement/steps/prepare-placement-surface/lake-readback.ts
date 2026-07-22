import type { CurrentEngineTerrainClassification } from "../../../../current-engine-surface.js";

/** Final drift counts for lake tiles previously accepted by map-hydrology projection. */
export type FinalLakeReadback = Readonly<{
  acceptedLakeTileCount: number;
  finalLakeWaterDriftCount: number;
  finalLakeClassificationDriftCount: number;
}>;

/**
 * Placement surface preparation is the final engine-maintenance boundary before
 * starts/resources/discoveries consume the map. Lake truth still belongs to
 * Hydrology and lake projection still belongs to map-hydrology; this readback
 * only proves that later Civ7 terrain validation, area recalculation, and water
 * cache refresh did not dry the already accepted lake tiles.
 */
export function readFinalLakeProjection(
  currentSurface: CurrentEngineTerrainClassification,
  acceptedLakeMask: Uint8Array
): FinalLakeReadback {
  const { width, height } = currentSurface;
  const size = width * height;
  if (acceptedLakeMask.length !== size) {
    throw new Error(
      `[Placement] Invalid accepted lake mask length for final lake readback (expected ${size}, got ${acceptedLakeMask.length}).`
    );
  }

  let acceptedLakeTileCount = 0;
  let finalLakeWaterDriftCount = 0;
  let finalLakeClassificationDriftCount = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (acceptedLakeMask[idx] !== 1) continue;
      acceptedLakeTileCount += 1;
      if (currentSurface.waterMask[idx] !== 1) finalLakeWaterDriftCount += 1;
      if (currentSurface.lakeMask[idx] !== 1) finalLakeClassificationDriftCount += 1;
    }
  }

  return {
    acceptedLakeTileCount,
    finalLakeWaterDriftCount,
    finalLakeClassificationDriftCount,
  };
}
