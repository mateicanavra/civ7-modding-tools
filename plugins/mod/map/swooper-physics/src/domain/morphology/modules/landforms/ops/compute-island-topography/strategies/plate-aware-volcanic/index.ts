import { clamp01, createLabelRng } from "@swooper/mapgen-core";
import { createStrategy } from "@swooper/mapgen-core/authoring";
import { PerlinNoise } from "@swooper/mapgen-core/lib/noise";

import { ISLAND_FORMATION_CLASS } from "../../../../model/policy/island-formation.js";
import ComputeIslandTopographyContract from "../../contract.js";
import { resolveIslandPatchSize, shouldSeedIsland } from "../../rules/island-admission.js";
import { growIslandPatch } from "../../rules/island-patch.js";
import { materializeIslandTopography } from "../../rules/island-topography.js";
import StrategyDefinition from "./config.js";

const BOUNDARY_CONVERGENT = 1;
const BOUNDARY_TRANSFORM = 3;
const ACTIVE_BOUNDARY_CLOSENESS = 0.4;
const NORMALIZED_BYTE_MAXIMUM = 255;
const PERCENT_MAXIMUM = 100;
const PERLIN_SEED_XOR = 0x5f356495;
const NOISE_SCALE = 0.1;
const MAP_EDGE_PADDING = 2;
const MICROCONTINENT_ROLL_RESOLUTION = 1_000;
const MICROCONTINENT_MINIMUM_TILES = 20;
const MICROCONTINENT_MAXIMUM_TILES = 450;
const MICROCONTINENT_AREA_FACTOR = 0.75;

/** Binds complete island topography to the shared Morphology operation contract. */
export default createStrategy(ComputeIslandTopographyContract, StrategyDefinition, {
  run: (input, config) => {
    const {
      width,
      height,
      elevation,
      seaLevel,
      landMask,
      bathymetry,
      distanceToCoast,
      boundaryCloseness,
      boundaryType,
      volcanism,
    } = input;
    const size = width * height;
    const islandClass = new Uint8Array(size);
    const rng = createLabelRng(input.rngSeed | 0);
    const perlin = new PerlinNoise((input.rngSeed | 0) ^ PERLIN_SEED_XOR);
    const noiseThreshold = config.fractalThresholdPercent / PERCENT_MAXIMUM;

    const isEligibleBaseWater = (index: number): boolean =>
      landMask[index] !== 1 &&
      islandClass[index] === ISLAND_FORMATION_CLASS.unchanged &&
      distanceToCoast[index] >= config.minDistFromLandRadius;

    const isNearActiveBoundary = (index: number): boolean => {
      const boundaryClass = boundaryType[index]!;
      return (
        boundaryClass === BOUNDARY_CONVERGENT ||
        boundaryClass === BOUNDARY_TRANSFORM ||
        boundaryCloseness[index]! / NORMALIZED_BYTE_MAXIMUM >= ACTIVE_BOUNDARY_CLOSENESS
      );
    };

    const admitsMicrocontinent =
      config.microcontinentChance > 0 &&
      rng(MICROCONTINENT_ROLL_RESOLUTION, "microcontinent:roll") / MICROCONTINENT_ROLL_RESOLUTION <
        config.microcontinentChance;

    if (admitsMicrocontinent) {
      let candidateCount = 0;
      let seedIndex = -1;

      for (let y = MAP_EDGE_PADDING; y < height - MAP_EDGE_PADDING; y += 1) {
        for (let x = 0; x < width; x += 1) {
          const index = y * width + x;
          if (!isEligibleBaseWater(index) || isNearActiveBoundary(index)) continue;
          const noise = perlin.noise2D(x * NOISE_SCALE, y * NOISE_SCALE);
          if (clamp01((noise + 1) / 2) < noiseThreshold) continue;
          candidateCount += 1;
          if (rng(candidateCount, "microcontinent:pick") === 0) seedIndex = index;
        }
      }

      if (seedIndex >= 0) {
        const derivedTiles = Math.round(
          config.clusterMax * config.clusterMax * MICROCONTINENT_AREA_FACTOR
        );
        const targetTiles = Math.max(
          MICROCONTINENT_MINIMUM_TILES,
          Math.min(MICROCONTINENT_MAXIMUM_TILES, derivedTiles)
        );
        growIslandPatch({
          seedIndex,
          formationClass: ISLAND_FORMATION_CLASS.microcontinent,
          minimumTiles: MICROCONTINENT_MINIMUM_TILES,
          targetTiles,
          width,
          height,
          baseLandMask: landMask,
          distanceToCoast,
          minimumCoastDistance: config.minDistFromLandRadius,
          islandClass,
          rng,
          label: "microcontinent",
        });
      }
    }

    for (let y = MAP_EDGE_PADDING; y < height - MAP_EDGE_PADDING; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const index = y * width + x;
        if (!isEligibleBaseWater(index)) continue;

        const noise = perlin.noise2D(x * NOISE_SCALE, y * NOISE_SCALE);
        const noiseValue = clamp01((noise + 1) / 2);
        const nearActiveBoundary = isNearActiveBoundary(index);
        const hotspotSignal = volcanism[index]! / NORMALIZED_BYTE_MAXIMUM;
        const admitted = shouldSeedIsland({
          noiseValue,
          threshold: noiseThreshold,
          baseDenominator: nearActiveBoundary
            ? config.baseIslandDenNearActive
            : config.baseIslandDenElse,
          hotspotSignal,
          hotspotDenominator: config.hotspotSeedDenom,
          rng,
        });
        if (!admitted) continue;

        growIslandPatch({
          seedIndex: index,
          formationClass: ISLAND_FORMATION_CLASS.islandChain,
          minimumTiles: 1,
          targetTiles: resolveIslandPatchSize(config.clusterMax, rng),
          width,
          height,
          baseLandMask: landMask,
          distanceToCoast,
          minimumCoastDistance: config.minDistFromLandRadius,
          islandClass,
          rng,
          label: "island-chain",
        });
      }
    }

    return {
      topography: materializeIslandTopography({
        elevation,
        seaLevel,
        landMask,
        bathymetry,
        islandClass,
      }),
      islandClass,
    };
  },
});
