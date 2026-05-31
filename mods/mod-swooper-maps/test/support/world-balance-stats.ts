import { createMockAdapter } from "@civ7/adapter";
import { createExtendedMapContext } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";

import standardRecipe, { type StandardRecipeConfig } from "../../src/recipes/standard/recipe.js";
import { initializeStandardRuntime } from "../../src/recipes/standard/runtime.js";
import { ecologyArtifacts } from "../../src/recipes/standard/stages/ecology/artifacts.js";
import { hydrologyClimateRefineArtifacts } from "../../src/recipes/standard/stages/hydrology-climate-refine/artifacts.js";
import { hydrologyHydrographyArtifacts } from "../../src/recipes/standard/stages/hydrology-hydrography/artifacts.js";
import { mapHydrologyArtifacts } from "../../src/recipes/standard/stages/map-hydrology/artifacts.js";
import { morphologyArtifacts } from "../../src/recipes/standard/stages/morphology/artifacts.js";
import { placementArtifacts } from "../../src/recipes/standard/stages/placement/artifacts.js";
import { getEngineFeatureLegality } from "../../src/domain/ecology/feature-engine-legality.js";
import { biomeSymbolFromIndex } from "../../src/domain/ecology/types.js";

export type WorldBalanceStats = Readonly<{
  label: string;
  width: number;
  height: number;
  seed: number;
  preLakeLandTiles: number;
  postProjectionLandTiles: number;
  waterTiles: number;
  plannedMountainTiles: number;
  plannedMountainShareOfPreLakeLand: number;
  plannedMountainComponentCount: number;
  plannedLargestMountainComponentSize: number;
  plannedHillTiles: number;
  plannedHillShareOfPreLakeLand: number;
  plannedHillComponentCount: number;
  plannedLargestHillComponentSize: number;
  plannedRoughTerrainTiles: number;
  plannedRoughTerrainShareOfPreLakeLand: number;
  plannedMountainToHillRatio: number;
  plannedVolcanoTiles: number;
  plannedVolcanoShareOfPreLakeLand: number;
  volcanoKindCounts: Readonly<Record<string, number>>;
  finalMountainTiles: number;
  finalMountainShareOfPreLakeLand: number;
  finalMountainComponentCount: number;
  finalLargestMountainComponentSize: number;
  finalNonVolcanoMountainTiles: number;
  finalNonVolcanoMountainShareOfPreLakeLand: number;
  finalVolcanoMountainTiles: number;
  volcanoFeatureTiles: number;
  finalHillTiles: number;
  finalHillShareOfPreLakeLand: number;
  finalHillComponentCount: number;
  finalLargestHillComponentSize: number;
  finalRoughTerrainTiles: number;
  finalRoughTerrainShareOfPreLakeLand: number;
  finalNonVolcanoRoughTerrainTiles: number;
  finalNonVolcanoRoughTerrainShareOfPreLakeLand: number;
  finalMountainToHillRatio: number;
  finalNonVolcanoMountainToHillRatio: number;
  finalFlatToRoughRatio: number;
  finalFlatToNonVolcanoRoughRatio: number;
  finalFlatTiles: number;
  finalFlatShareOfPreLakeLand: number;
  plainsTiles: number;
  plainsShareOfPreLakeLand: number;
  meanAridity: number;
  highAridityLandShare: number;
  meanEffectiveMoisture: number;
  meanFertility: number;
  soilCounts: Readonly<Record<string, number>>;
  biomeSymbolCounts: Readonly<Record<string, number>>;
  meanVegetationDensity: number;
  elevationP10: number;
  elevationP50: number;
  elevationP90: number;
  elevationStdDev: number;
  meanLocalRelief: number;
  elevationByCoastDistance: readonly number[];
  centralBulgeGradient: number;
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
  featureAttemptCounts: Readonly<Record<string, number>>;
  featureRejectCounts: Readonly<Record<string, number>>;
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

const SOIL_NAMES = ["rocky", "sandy", "loam", "wet"] as const;

type BiomeClassificationStatsInput = Readonly<{
  biomeIndex: Uint8Array;
  vegetationDensity: Float32Array;
  effectiveMoisture: Float32Array;
  surfaceTemperature: Float32Array;
  aridityIndex: Float32Array;
  freezeIndex: Float32Array;
  treeLine01: Float32Array;
}>;

type MockAdapter = ReturnType<typeof createMockAdapter>;

type VolcanoKind = "subductionArc" | "rift" | "hotspot";

type VolcanoStatsInput = Readonly<{
  volcanoMask: Uint8Array;
  volcanoes: ReadonlyArray<
    Readonly<{
      tileIndex: number;
      kind: VolcanoKind;
      strength01: number;
    }>
  >;
}>;

function countMask(mask: Uint8Array): number {
  let count = 0;
  for (const value of mask) {
    if (value === 1) count += 1;
  }
  return count;
}

function mean(values: readonly number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function percentile(values: readonly number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.floor((sorted.length - 1) * p)));
  return sorted[index] ?? 0;
}

function roundMetric(value: number): number {
  return Number(value.toFixed(4));
}

function shareOf(count: number, total: number): number {
  return total === 0 ? 0 : count / total;
}

function safeRatio(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : roundMetric(numerator / denominator);
}

function standardDeviation(values: readonly number[]): number {
  if (values.length === 0) return 0;
  const average = mean(values);
  const variance = mean(values.map((value) => (value - average) ** 2));
  return Math.sqrt(variance);
}

function computeMeanLocalRelief(
  elevation: Int16Array,
  landMask: Uint8Array,
  width: number,
  height: number
): number {
  let sum = 0;
  let comparisons = 0;
  for (let idx = 0; idx < landMask.length; idx++) {
    if (landMask[idx] !== 1) continue;
    for (const neighbor of hexOddRNeighbors(idx, width, height)) {
      if (neighbor <= idx || landMask[neighbor] !== 1) continue;
      sum += Math.abs((elevation[idx] ?? 0) - (elevation[neighbor] ?? 0));
      comparisons += 1;
    }
  }
  return comparisons === 0 ? 0 : sum / comparisons;
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
  const symbol = biomeSymbolFromIndex(classification.biomeIndex[idx] ?? 255);

  if (feature === "FEATURE_FOREST") {
    return symbol !== "temperateHumid" || vegetation < 0.08;
  }
  if (feature === "FEATURE_RAINFOREST") {
    return symbol !== "tropicalRainforest" || temp < 16 || moisture < 85 || vegetation < 0.18;
  }
  if (feature === "FEATURE_TAIGA") {
    return symbol !== "snow" && symbol !== "tundra" && symbol !== "boreal";
  }
  if (feature === "FEATURE_SAVANNA_WOODLAND") {
    return symbol !== "tropicalSeasonal" || temp < 12 || aridity > 0.9 || vegetation > 0.78;
  }
  if (feature === "FEATURE_SAGEBRUSH_STEPPE") {
    return symbol !== "desert" || temp < -12 || temp > 32 || vegetation > 0.72;
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

  let adapter: MockAdapter;
  adapter = createMockAdapter({
    width,
    height,
    mapInfo,
    mapSizeId: 1,
    rng: createLabelRng(seed),
    canHaveFeature: (x, y, featureType) => {
      const featureByType = Object.fromEntries(
        FEATURE_KEYS.map((key) => [adapter.getFeatureTypeIndex(key), key])
      );
      const feature = featureByType[featureType];
      if (!feature) return true;
      const legality = getEngineFeatureLegality(feature);
      if (!legality) return true;
      const terrain = adapter.getTerrainType(x, y);
      const biome = adapter.getBiomeType(x, y);
      const isWater = adapter.isWater(x, y);
      const expectedTerrain = adapter.getTerrainTypeIndex(legality.terrain);
      const expectedBiome = adapter.getBiomeGlobal(legality.biome);
      const waterExpected = legality.terrain === "TERRAIN_COAST" || legality.terrain === "TERRAIN_OCEAN";
      return (
        terrain === expectedTerrain &&
        biome === expectedBiome &&
        (waterExpected ? isWater : !isWater)
      );
    },
  });
  const context = createExtendedMapContext({ width, height }, adapter, env);
  initializeStandardRuntime(context, { mapInfo, logPrefix: "[world-balance]", storyEnabled: false });
  standardRecipe.run(context, env, args.config, { log: () => {} });

  const topography = context.artifacts.get(morphologyArtifacts.topography.id) as
    | { elevation?: Int16Array; landMask?: Uint8Array }
    | undefined;
  const mountains = context.artifacts.get(morphologyArtifacts.mountains.id) as
    | { mountainMask?: Uint8Array; hillMask?: Uint8Array }
    | undefined;
  const volcanoes = context.artifacts.get(morphologyArtifacts.volcanoes.id) as
    | Partial<VolcanoStatsInput>
    | undefined;
  const coastlineMetrics = context.artifacts.get(morphologyArtifacts.coastlineMetrics.id) as
    | { distanceToCoast?: Uint16Array }
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
  const climateIndices = context.artifacts.get(hydrologyClimateRefineArtifacts.climateIndices.id) as
    | { aridityIndex?: Float32Array; effectiveMoisture?: Float32Array }
    | undefined;
  const pedology = context.artifacts.get(ecologyArtifacts.pedology.id) as
    | { soilType?: Uint8Array; fertility?: Float32Array }
    | undefined;
  const classification = context.artifacts.get(ecologyArtifacts.biomeClassification.id) as
    | Partial<BiomeClassificationStatsInput>
    | undefined;
  if (!(topography?.landMask instanceof Uint8Array) || !(topography.elevation instanceof Int16Array)) {
    throw new Error("Missing topography fields.");
  }
  if (!(mountains?.mountainMask instanceof Uint8Array) || !(mountains.hillMask instanceof Uint8Array)) {
    throw new Error("Missing morphology mountain fields.");
  }
  if (!(volcanoes?.volcanoMask instanceof Uint8Array) || !Array.isArray(volcanoes.volcanoes)) {
    throw new Error("Missing morphology volcano fields.");
  }
  if (!(coastlineMetrics?.distanceToCoast instanceof Uint16Array)) {
    throw new Error("Missing morphology coastline metrics.");
  }
  if (!(lakePlan?.lakeMask instanceof Uint8Array)) throw new Error("Missing hydrology.lakePlan.");
  if (!(engineLakeProjection?.lakeMask instanceof Uint8Array)) {
    throw new Error("Missing map-hydrology engine lake projection.");
  }
  if (
    !(climateIndices?.aridityIndex instanceof Float32Array) ||
    !(climateIndices.effectiveMoisture instanceof Float32Array)
  ) {
    throw new Error("Missing hydrology climate indices.");
  }
  if (!(pedology?.soilType instanceof Uint8Array) || !(pedology.fertility instanceof Float32Array)) {
    throw new Error("Missing ecology pedology fields.");
  }
  if (
    !(classification?.vegetationDensity instanceof Float32Array) ||
    !(classification.biomeIndex instanceof Uint8Array) ||
    !(classification.effectiveMoisture instanceof Float32Array) ||
    !(classification.surfaceTemperature instanceof Float32Array) ||
    !(classification.aridityIndex instanceof Float32Array) ||
    !(classification.freezeIndex instanceof Float32Array) ||
    !(classification.treeLine01 instanceof Float32Array)
  ) {
    throw new Error("Missing ecology biome classification fields.");
  }
  const featureApplyDiagnostics = context.artifacts.get(ecologyArtifacts.featureApplyDiagnostics.id) as
    | {
        attemptedByFeature?: Record<string, number>;
        rejectedCanHaveFeatureByFeature?: Record<string, number>;
      }
    | undefined;

  let waterTiles = 0;
  let postProjectionLandTiles = 0;
  let finalMountainTiles = 0;
  let finalHillTiles = 0;
  let finalFlatTiles = 0;
  let finalVolcanoMountainTiles = 0;
  let volcanoFeatureTiles = 0;
  let plainsTiles = 0;
  let lakeWaterDriftCount = 0;
  let invalidFeatureSurfaceCount = 0;
  const finalMountainMask = new Uint8Array(width * height);
  const finalHillMask = new Uint8Array(width * height);
  const landElevations: number[] = [];
  const landAridity: number[] = [];
  const landMoisture: number[] = [];
  const landFertility: number[] = [];
  const landVegetationDensity: number[] = [];
  const elevationBins: number[][] = [[], [], [], [], []];
  const soilCounts: Record<string, number> = Object.fromEntries(SOIL_NAMES.map((name) => [name, 0]));
  const biomeSymbolCounts: Record<string, number> = {};
  const mountainTerrain = adapter.getTerrainTypeIndex("TERRAIN_MOUNTAIN");
  const hillTerrain = adapter.getTerrainTypeIndex("TERRAIN_HILL");
  const flatTerrain = adapter.getTerrainTypeIndex("TERRAIN_FLAT");
  const plainsBiome = adapter.getBiomeGlobal("BIOME_PLAINS");
  const volcanoFeatureType = adapter.getFeatureTypeIndex("FEATURE_VOLCANO");
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
      const terrain = adapter.getTerrainType(x, y);
      const feature = adapter.getFeatureType(x, y);
      if (isWater) waterTiles += 1;
      else {
        postProjectionLandTiles += 1;
        if (terrain === mountainTerrain) {
          finalMountainTiles += 1;
          finalMountainMask[idx] = 1;
        }
        if (terrain === hillTerrain) {
          finalHillTiles += 1;
          finalHillMask[idx] = 1;
        }
        if (terrain === flatTerrain) finalFlatTiles += 1;
        if (adapter.getBiomeType(x, y) === plainsBiome) plainsTiles += 1;
      }
      if (feature === volcanoFeatureType) {
        volcanoFeatureTiles += 1;
        if (!isWater && terrain === mountainTerrain) finalVolcanoMountainTiles += 1;
      }
      if (topography.landMask[idx] === 1) {
        const elevation = topography.elevation[idx] ?? 0;
        landElevations.push(elevation);
        landAridity.push(climateIndices.aridityIndex[idx] ?? 0);
        landMoisture.push(climateIndices.effectiveMoisture[idx] ?? 0);
        landFertility.push(pedology.fertility[idx] ?? 0);
        landVegetationDensity.push(classification.vegetationDensity[idx] ?? 0);
        const soilName = SOIL_NAMES[pedology.soilType[idx] ?? 0] ?? "unknown";
        soilCounts[soilName] = (soilCounts[soilName] ?? 0) + 1;
        const biomeIndex = classification.biomeIndex?.[idx] ?? 255;
        if (biomeIndex !== 255) {
          const biomeSymbol = biomeSymbolFromIndex(biomeIndex);
          biomeSymbolCounts[biomeSymbol] = (biomeSymbolCounts[biomeSymbol] ?? 0) + 1;
        }

        const distance = coastlineMetrics.distanceToCoast[idx] ?? 0;
        const binIndex = distance <= 1 ? 0 : distance <= 3 ? 1 : distance <= 5 ? 2 : distance <= 8 ? 3 : 4;
        elevationBins[binIndex]?.push(elevation);
      }
      if (engineLakeProjection.lakeMask[idx] === 1 && !isWater) lakeWaterDriftCount += 1;

      for (const key of FEATURE_KEYS) {
        const featureType = featureTypeByKey[key] ?? -1;
        if (featureType < 0 || feature !== featureType) continue;
        featureCounts[key] += 1;
        const legality = getEngineFeatureLegality(key);
        if (legality) {
          const expectedTerrain = adapter.getTerrainTypeIndex(legality.terrain);
          const expectedBiome = adapter.getBiomeGlobal(legality.biome);
          const expectedWater =
            legality.terrain === "TERRAIN_COAST" || legality.terrain === "TERRAIN_OCEAN";
          if (
            terrain !== expectedTerrain ||
            adapter.getBiomeType(x, y) !== expectedBiome ||
            (expectedWater ? !isWater : isWater)
          ) {
            invalidFeatureSurfaceCount += 1;
          }
        }
        if (isFeatureHabitatMismatch(key, idx, classification)) {
          featureHabitatMismatchCounts[key] += 1;
        }
      }
    }
  }

  const preLakeLandTiles = countMask(topography.landMask);
  const plannedMountainTiles = countMask(mountains.mountainMask);
  const plannedMountainComponents = computeMaskComponents(mountains.mountainMask, width, height);
  const finalMountainComponents = computeMaskComponents(finalMountainMask, width, height);
  const plannedHillTiles = countMask(mountains.hillMask);
  const plannedHillComponents = computeMaskComponents(mountains.hillMask, width, height);
  const finalHillComponents = computeMaskComponents(finalHillMask, width, height);
  const plannedRoughTerrainTiles = plannedMountainTiles + plannedHillTiles;
  const finalNonVolcanoMountainTiles = Math.max(0, finalMountainTiles - finalVolcanoMountainTiles);
  const finalRoughTerrainTiles = finalMountainTiles + finalHillTiles;
  const finalNonVolcanoRoughTerrainTiles = finalNonVolcanoMountainTiles + finalHillTiles;
  const plannedVolcanoTiles = countMask(volcanoes.volcanoMask);
  const volcanoKindCounts: Record<VolcanoKind, number> = {
    subductionArc: 0,
    rift: 0,
    hotspot: 0,
  };
  for (const entry of volcanoes.volcanoes) {
    volcanoKindCounts[entry.kind] += 1;
  }
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
  const elevationByCoastDistance = elevationBins.map((bin) => roundMetric(mean(bin)));
  const centralBulgeGradient = roundMetric(
    (elevationByCoastDistance[elevationByCoastDistance.length - 1] ?? 0) -
      (elevationByCoastDistance[0] ?? 0)
  );

  return {
    label: args.label,
    width,
    height,
    seed,
    preLakeLandTiles,
    postProjectionLandTiles,
    waterTiles,
    plannedMountainTiles,
    plannedMountainShareOfPreLakeLand: preLakeLandTiles === 0 ? 0 : plannedMountainTiles / preLakeLandTiles,
    plannedMountainComponentCount: plannedMountainComponents.componentCount,
    plannedLargestMountainComponentSize: plannedMountainComponents.largestComponentSize,
    plannedHillTiles,
    plannedHillShareOfPreLakeLand: shareOf(plannedHillTiles, preLakeLandTiles),
    plannedHillComponentCount: plannedHillComponents.componentCount,
    plannedLargestHillComponentSize: plannedHillComponents.largestComponentSize,
    plannedRoughTerrainTiles,
    plannedRoughTerrainShareOfPreLakeLand: shareOf(plannedRoughTerrainTiles, preLakeLandTiles),
    plannedMountainToHillRatio: safeRatio(plannedMountainTiles, plannedHillTiles),
    plannedVolcanoTiles,
    plannedVolcanoShareOfPreLakeLand: shareOf(plannedVolcanoTiles, preLakeLandTiles),
    volcanoKindCounts,
    finalMountainTiles,
    finalMountainShareOfPreLakeLand: shareOf(finalMountainTiles, preLakeLandTiles),
    finalMountainComponentCount: finalMountainComponents.componentCount,
    finalLargestMountainComponentSize: finalMountainComponents.largestComponentSize,
    finalNonVolcanoMountainTiles,
    finalNonVolcanoMountainShareOfPreLakeLand: shareOf(
      finalNonVolcanoMountainTiles,
      preLakeLandTiles
    ),
    finalVolcanoMountainTiles,
    volcanoFeatureTiles,
    finalHillTiles,
    finalHillShareOfPreLakeLand: shareOf(finalHillTiles, preLakeLandTiles),
    finalHillComponentCount: finalHillComponents.componentCount,
    finalLargestHillComponentSize: finalHillComponents.largestComponentSize,
    finalRoughTerrainTiles,
    finalRoughTerrainShareOfPreLakeLand: shareOf(finalRoughTerrainTiles, preLakeLandTiles),
    finalNonVolcanoRoughTerrainTiles,
    finalNonVolcanoRoughTerrainShareOfPreLakeLand: shareOf(
      finalNonVolcanoRoughTerrainTiles,
      preLakeLandTiles
    ),
    finalMountainToHillRatio: safeRatio(finalMountainTiles, finalHillTiles),
    finalNonVolcanoMountainToHillRatio: safeRatio(finalNonVolcanoMountainTiles, finalHillTiles),
    finalFlatToRoughRatio: safeRatio(finalFlatTiles, finalRoughTerrainTiles),
    finalFlatToNonVolcanoRoughRatio: safeRatio(finalFlatTiles, finalNonVolcanoRoughTerrainTiles),
    finalFlatTiles,
    finalFlatShareOfPreLakeLand: shareOf(finalFlatTiles, preLakeLandTiles),
    plainsTiles,
    plainsShareOfPreLakeLand: shareOf(plainsTiles, preLakeLandTiles),
    meanAridity: roundMetric(mean(landAridity)),
    highAridityLandShare:
      preLakeLandTiles === 0
        ? 0
        : landAridity.filter((value) => value > 0.65).length / preLakeLandTiles,
    meanEffectiveMoisture: roundMetric(mean(landMoisture)),
    meanFertility: roundMetric(mean(landFertility)),
    soilCounts,
    biomeSymbolCounts,
    meanVegetationDensity: roundMetric(mean(landVegetationDensity)),
    elevationP10: percentile(landElevations, 0.1),
    elevationP50: percentile(landElevations, 0.5),
    elevationP90: percentile(landElevations, 0.9),
    elevationStdDev: roundMetric(standardDeviation(landElevations)),
    meanLocalRelief: roundMetric(
      computeMeanLocalRelief(topography.elevation, topography.landMask, width, height)
    ),
    elevationByCoastDistance,
    centralBulgeGradient,
    lakeTiles,
    lakeShareOfPreLakeLand: shareOf(lakeTiles, preLakeLandTiles),
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
    featureAttemptCounts: featureApplyDiagnostics?.attemptedByFeature ?? {},
    featureRejectCounts: featureApplyDiagnostics?.rejectedCanHaveFeatureByFeature ?? {},
    featureCounts,
  };
}
