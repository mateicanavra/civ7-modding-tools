import morphology from "@mapgen/domain/morphology/router";
import { TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../../../../setup.js";

const { computeIslandTopography } = morphology.landforms.ops;

/** Admitted operation input used to probe island formation over a real Civ7 map extent. */
export type IslandTopographyInput = Parameters<typeof computeIslandTopography.run>[0];

/**
 * Builds coherent post-erosion topography with enough open ocean for deterministic island growth.
 *
 * Sparse land in the polar padding gives preservation checks both land and water observations,
 * while all authored island candidates remain away from those fixed cells.
 */
export function createIslandTopographyInput(): IslandTopographyInput {
  const { width, height } = TEST_MAP_SIZE.dimensions;
  const cellCount = width * height;
  const seaLevel = 0;
  const elevation = new Int16Array(cellCount);
  const landMask = new Uint8Array(cellCount);
  const bathymetry = new Int16Array(cellCount);

  for (let index = 0; index < cellCount; index += 1) {
    const x = index % width;
    const y = Math.floor(index / width);
    const isFixedLand = (y === 0 || y === height - 1) && x % 11 === 0;
    elevation[index] = isFixedLand ? 4 : -4 - (index % 5);
    landMask[index] = isFixedLand ? 1 : 0;
    bathymetry[index] = isFixedLand ? 0 : elevation[index] - seaLevel;
  }

  return {
    width,
    height,
    elevation,
    seaLevel,
    landMask,
    bathymetry,
    distanceToCoast: new Uint16Array(cellCount).fill(8),
    boundaryCloseness: new Uint8Array(cellCount),
    boundaryType: new Uint8Array(cellCount),
    volcanism: new Uint8Array(cellCount),
    rngSeed: TEST_MAP_SEED,
  };
}

/**
 * Selects sparse ordinary-island controls while allowing one test to vary microcontinent admission.
 */
export function createIslandTopographySelection(microcontinentChance: number) {
  return {
    ...computeIslandTopography.defaultConfig,
    config: {
      ...computeIslandTopography.defaultConfig.config,
      fractalThresholdPercent: 0,
      minDistFromLandRadius: 0,
      baseIslandDenNearActive: 256,
      baseIslandDenElse: 256,
      hotspotSeedDenom: 256,
      clusterMax: 8,
      microcontinentChance,
    },
  };
}
