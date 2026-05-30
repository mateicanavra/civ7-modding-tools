import { createMockAdapter } from "@civ7/adapter";
import { createExtendedMapContext } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";

import standardRecipe, { type StandardRecipeConfig } from "../../src/recipes/standard/recipe.js";
import { initializeStandardRuntime } from "../../src/recipes/standard/runtime.js";
import { ecologyArtifacts } from "../../src/recipes/standard/stages/ecology/artifacts.js";
import { hydrologyHydrographyArtifacts } from "../../src/recipes/standard/stages/hydrology-hydrography/artifacts.js";
import { mapHydrologyArtifacts } from "../../src/recipes/standard/stages/map-hydrology/artifacts.js";
import { morphologyArtifacts } from "../../src/recipes/standard/stages/morphology/artifacts.js";
import { placementArtifacts } from "../../src/recipes/standard/stages/placement/artifacts.js";

export type WorldBalanceStats = Readonly<{
  label: string;
  width: number;
  height: number;
  seed: number;
  preLakeLandTiles: number;
  postProjectionLandTiles: number;
  waterTiles: number;
  lakeTiles: number;
  lakeShareOfPreLakeLand: number;
  engineLakeTiles: number;
  lakeComponentCount: number;
  singleTileLakeCount: number;
  singleTileLakeShare: number;
  largestLakeComponentSize: number;
  lakeWaterDriftCount: number;
  finalLakeWaterDriftCount: number;
  finalLakeClassificationDriftCount: number;
  lakeProjectionMismatchCount: number;
  wetlandTiles: number;
  wetlandShareOfPreLakeLand: number;
  reefFamilyTiles: number;
  reefFamilyShareOfWater: number;
  vegetationFamilyTiles: number;
  vegetationFamilyShareOfPreLakeLand: number;
  vegetationFeatureFamiliesPresent: number;
  invalidFeatureSurfaceCount: number;
  featureHabitatMismatchCounts: Readonly<Record<string, number>>;
  featureCounts: Readonly<Record<string, number>>;
}>;

const FEATURE_KEYS = [
  "FEATURE_FOREST",
  "FEATURE_RAINFOREST",
  "FEATURE_TAIGA",
  "FEATURE_SAVANNA_WOODLAND",
  "FEATURE_SAGEBRUSH_STEPPE",
  "FEATURE_MARSH",
  "FEATURE_TUNDRA_BOG",
  "FEATURE_MANGROVE",
  "FEATURE_OASIS",
  "FEATURE_WATERING_HOLE",
  "FEATURE_REEF",
  "FEATURE_COLD_REEF",
  "FEATURE_ATOLL",
  "FEATURE_LOTUS",
  "FEATURE_ICE",
] as const;

const WETLAND_FEATURES = new Set([
  "FEATURE_MARSH",
  "FEATURE_TUNDRA_BOG",
  "FEATURE_MANGROVE",
  "FEATURE_OASIS",
  "FEATURE_WATERING_HOLE",
]);

const REEF_FEATURES = new Set([
  "FEATURE_REEF",
  "FEATURE_COLD_REEF",
  "FEATURE_ATOLL",
  "FEATURE_LOTUS",
]);

const VEGETATION_FEATURES = new Set([
  "FEATURE_FOREST",
  "FEATURE_RAINFOREST",
  "FEATURE_TAIGA",
  "FEATURE_SAVANNA_WOODLAND",
  "FEATURE_SAGEBRUSH_STEPPE",
]);

type BiomeClassificationStatsInput = Readonly<{
  vegetationDensity: Float32Array;
  effectiveMoisture: Float32Array;
  surfaceTemperature: Float32Array;
  aridityIndex: Float32Array;
  freezeIndex: Float32Array;
  treeLine01: Float32Array;
}>;

function countMask(mask: Uint8Array): number {
  let count = 0;
  for (const value of mask) {
    if (value === 1) count += 1;
  }
  return count;
}

/**
 * Uses the same odd-row hex adjacency that map stages visualize so lake shape
 * metrics describe player-visible connected water bodies, not square-grid blobs.
 */
function hexOddRNeighbors(index: number, width: number, height: number): number[] {
  const x = index % width;
  const y = (index / width) | 0;
  const offsets =
    y % 2 === 0
      ? [
          [1, 0],
          [-1, 0],
          [0, -1],
          [-1, -1],
          [0, 1],
          [-1, 1],
        ]
      : [
          [1, 0],
          [-1, 0],
          [1, -1],
          [0, -1],
          [1, 1],
          [0, 1],
        ];
  const neighbors: number[] = [];
  for (const [dx, dy] of offsets) {
    const nx = x + dx;
    const ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
    neighbors.push(ny * width + nx);
  }
  return neighbors;
}

/**
 * Connected-component metrics catch the failure mode where total lake area looks
 * acceptable but the map is covered in one-tile circular basins.
 */
function computeMaskComponents(mask: Uint8Array, width: number, height: number): {
  componentCount: number;
  singleTileCount: number;
  largestComponentSize: number;
} {
  const visited = new Uint8Array(mask.length);
  let componentCount = 0;
  let singleTileCount = 0;
  let largestComponentSize = 0;

  for (let i = 0; i < mask.length; i++) {
    if (mask[i] !== 1 || visited[i] === 1) continue;
    componentCount += 1;
    let componentSize = 0;
    const queue = [i];
    visited[i] = 1;

    while (queue.length > 0) {
      const current = queue.pop()!;
      componentSize += 1;
      for (const neighbor of hexOddRNeighbors(current, width, height)) {
        if (mask[neighbor] !== 1 || visited[neighbor] === 1) continue;
        visited[neighbor] = 1;
        queue.push(neighbor);
      }
    }

    if (componentSize === 1) singleTileCount += 1;
    largestComponentSize = Math.max(largestComponentSize, componentSize);
  }

  return { componentCount, singleTileCount, largestComponentSize };
}

/**
 * Habitat gates are intentionally broad product checks, not copies of the
 * scoring strategies. They catch categorical inversions like "taiga only scores
 * in warm wet biomass" while leaving each feature op free to own detailed
 * placement physics.
 */
function isFeatureHabitatMismatch(
  feature: string,
  idx: number,
  classification: BiomeClassificationStatsInput
): boolean {
  const temp = classification.surfaceTemperature[idx] ?? 0;
  const moisture = classification.effectiveMoisture[idx] ?? 0;
  const aridity = classification.aridityIndex[idx] ?? 0;
  const vegetation = classification.vegetationDensity[idx] ?? 0;
  const freeze = classification.freezeIndex[idx] ?? 0;
  const treeLine = classification.treeLine01[idx] ?? 0;

  if (feature === "FEATURE_FOREST") {
    return temp < -5 || temp > 30 || moisture < 45 || aridity > 0.82 || vegetation < 0.08;
  }
  if (feature === "FEATURE_RAINFOREST") {
    return temp < 16 || moisture < 85 || aridity > 0.72 || vegetation < 0.18;
  }
  if (feature === "FEATURE_TAIGA") {
    return temp > 16 || freeze < 0.08 || moisture < 35;
  }
  if (feature === "FEATURE_SAVANNA_WOODLAND") {
    return temp < 12 || moisture < 35 || aridity < 0.12 || aridity > 0.9 || vegetation > 0.78;
  }
  if (feature === "FEATURE_SAGEBRUSH_STEPPE") {
    return temp < -12 || temp > 32 || aridity < 0.2 || aridity > 0.95 || vegetation > 0.72;
  }
  return false;
}

/**
 * Runs the full standard recipe through the public recipe/runtime boundary so
 * world-balance tests exercise the same artifact chain and adapter projection
 * users see in a deployed map. The returned metrics intentionally describe
 * product-visible geography instead of internals like a single score layer.
 */
export function collectWorldBalanceStats(args: Readonly<{
  label: string;
  config: StandardRecipeConfig;
  width?: number;
  height?: number;
  seed?: number;
}>): WorldBalanceStats {
  const width = args.width ?? 106;
  const height = args.height ?? 66;
  const seed = args.seed ?? 1018;
  const mapInfo = {
    GridWidth: width,
    GridHeight: height,
    MinLatitude: -80,
    MaxLatitude: 80,
    PlayersLandmass1: 4,
    PlayersLandmass2: 4,
    StartSectorRows: 4,
    StartSectorCols: 4,
  };
  const env = {
    seed,
    dimensions: { width, height },
    latitudeBounds: { topLatitude: mapInfo.MaxLatitude, bottomLatitude: mapInfo.MinLatitude },
  };

  const adapter = createMockAdapter({
    width,
    height,
    mapInfo,
    mapSizeId: 1,
    rng: createLabelRng(seed),
  });
  const context = createExtendedMapContext({ width, height }, adapter, env);
  initializeStandardRuntime(context, { mapInfo, logPrefix: "[world-balance]", storyEnabled: false });
  standardRecipe.run(context, env, args.config, { log: () => {} });

  const topography = context.artifacts.get(morphologyArtifacts.topography.id) as
    | { landMask?: Uint8Array }
    | undefined;
  const lakePlan = context.artifacts.get(hydrologyHydrographyArtifacts.lakePlan.id) as
    | { lakeMask?: Uint8Array }
    | undefined;
  const engineLakeProjection = context.artifacts.get(mapHydrologyArtifacts.engineProjectionLakes.id) as
    | { lakeMask?: Uint8Array; sinkMismatchCount?: number }
    | undefined;
  const placementSurface = context.artifacts.get(placementArtifacts.placementSurfacePreparation.id) as
    | { finalLakeWaterDriftCount?: number; finalLakeClassificationDriftCount?: number }
    | undefined;
  const classification = context.artifacts.get(ecologyArtifacts.biomeClassification.id) as
    | Partial<BiomeClassificationStatsInput>
    | undefined;
  if (!(topography?.landMask instanceof Uint8Array)) throw new Error("Missing topography.landMask.");
  if (!(lakePlan?.lakeMask instanceof Uint8Array)) throw new Error("Missing hydrology.lakePlan.");
  if (!(engineLakeProjection?.lakeMask instanceof Uint8Array)) {
    throw new Error("Missing map-hydrology engine lake projection.");
  }
  if (
    !(classification?.vegetationDensity instanceof Float32Array) ||
    !(classification.effectiveMoisture instanceof Float32Array) ||
    !(classification.surfaceTemperature instanceof Float32Array) ||
    !(classification.aridityIndex instanceof Float32Array) ||
    !(classification.freezeIndex instanceof Float32Array) ||
    !(classification.treeLine01 instanceof Float32Array)
  ) {
    throw new Error("Missing ecology biome classification fields.");
  }

  let waterTiles = 0;
  let postProjectionLandTiles = 0;
  let lakeWaterDriftCount = 0;
  let invalidFeatureSurfaceCount = 0;
  const featureCounts: Record<string, number> = Object.fromEntries(
    FEATURE_KEYS.map((key) => [key, 0])
  );
  const featureHabitatMismatchCounts: Record<string, number> = Object.fromEntries(
    FEATURE_KEYS.map((key) => [key, 0])
  );
  const featureTypeByKey = Object.fromEntries(
    FEATURE_KEYS.map((key) => [key, adapter.getFeatureTypeIndex(key)])
  );
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const isWater = adapter.isWater(x, y);
      if (isWater) waterTiles += 1;
      else postProjectionLandTiles += 1;
      if (engineLakeProjection.lakeMask[idx] === 1 && !isWater) lakeWaterDriftCount += 1;

      const feature = adapter.getFeatureType(x, y);
      for (const key of FEATURE_KEYS) {
        const featureType = featureTypeByKey[key] ?? -1;
        if (featureType < 0 || feature !== featureType) continue;
        featureCounts[key] += 1;
        if ((VEGETATION_FEATURES.has(key) || WETLAND_FEATURES.has(key)) && isWater) {
          invalidFeatureSurfaceCount += 1;
        }
        if (REEF_FEATURES.has(key) && !isWater) {
          invalidFeatureSurfaceCount += 1;
        }
        if (isFeatureHabitatMismatch(key, idx, classification)) {
          featureHabitatMismatchCounts[key] += 1;
        }
      }
    }
  }

  const preLakeLandTiles = countMask(topography.landMask);
  const lakeTiles = countMask(lakePlan.lakeMask);
  const engineLakeTiles = countMask(engineLakeProjection.lakeMask);
  const lakeComponents = computeMaskComponents(engineLakeProjection.lakeMask, width, height);
  let wetlandTiles = 0;
  let reefFamilyTiles = 0;
  let vegetationFamilyTiles = 0;
  let vegetationFeatureFamiliesPresent = 0;
  for (const [feature, count] of Object.entries(featureCounts)) {
    if (WETLAND_FEATURES.has(feature)) wetlandTiles += count;
    if (REEF_FEATURES.has(feature)) reefFamilyTiles += count;
    if (VEGETATION_FEATURES.has(feature)) {
      vegetationFamilyTiles += count;
      if (count > 0) vegetationFeatureFamiliesPresent += 1;
    }
  }

  return {
    label: args.label,
    width,
    height,
    seed,
    preLakeLandTiles,
    postProjectionLandTiles,
    waterTiles,
    lakeTiles,
    lakeShareOfPreLakeLand: preLakeLandTiles === 0 ? 0 : lakeTiles / preLakeLandTiles,
    engineLakeTiles,
    lakeComponentCount: lakeComponents.componentCount,
    singleTileLakeCount: lakeComponents.singleTileCount,
    singleTileLakeShare: engineLakeTiles === 0 ? 0 : lakeComponents.singleTileCount / engineLakeTiles,
    largestLakeComponentSize: lakeComponents.largestComponentSize,
    lakeWaterDriftCount,
    finalLakeWaterDriftCount: placementSurface?.finalLakeWaterDriftCount ?? 0,
    finalLakeClassificationDriftCount: placementSurface?.finalLakeClassificationDriftCount ?? 0,
    lakeProjectionMismatchCount: engineLakeProjection.sinkMismatchCount ?? 0,
    wetlandTiles,
    wetlandShareOfPreLakeLand: preLakeLandTiles === 0 ? 0 : wetlandTiles / preLakeLandTiles,
    reefFamilyTiles,
    reefFamilyShareOfWater: waterTiles === 0 ? 0 : reefFamilyTiles / waterTiles,
    vegetationFamilyTiles,
    vegetationFamilyShareOfPreLakeLand:
      preLakeLandTiles === 0 ? 0 : vegetationFamilyTiles / preLakeLandTiles,
    vegetationFeatureFamiliesPresent,
    invalidFeatureSurfaceCount,
    featureHabitatMismatchCounts,
    featureCounts,
  };
}
