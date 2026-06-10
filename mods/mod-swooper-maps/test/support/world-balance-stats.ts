import {
  createMockAdapter,
  type ResourcePlacementMismatchReason,
  type ResourcePlacementRejectionReason,
} from "@civ7/adapter";
import { createExtendedMapContext } from "@swooper/mapgen-core";
import {
  collectMaskComponentsOddQ,
  getHexNeighborIndicesOddQ,
  hexDistanceOddQPeriodicX,
} from "@swooper/mapgen-core/lib/grid";
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
  plannedLargestMountainComponentDiameter: number;
  plannedMountainRegionTiles: number;
  plannedMountainRegionShareOfPreLakeLand: number;
  plannedMountainRegionComponentCount: number;
  plannedLargestMountainRegionComponentSize: number;
  plannedLargestMountainRegionComponentDiameter: number;
  plannedMountainRegionMountainShare: number;
  plannedMountainRegionFoothillShare: number;
  plannedMountainRegionRoughLandShare: number;
  plannedMountainRegionNonMountainShare: number;
  plannedMountainRegionFlatInteriorShare: number;
  plannedLargestMountainRegionFlatPocketSize: number;
  plannedHillTiles: number;
  plannedHillShareOfPreLakeLand: number;
  plannedHillComponentCount: number;
  plannedLargestHillComponentSize: number;
  plannedLargestHillComponentDiameter: number;
  plannedFoothillTiles: number;
  plannedFoothillShareOfPreLakeLand: number;
  plannedRoughLandHillTiles: number;
  plannedRoughLandHillShareOfPreLakeLand: number;
  plannedRoughLandHillComponentCount: number;
  plannedLargestRoughLandHillComponentSize: number;
  plannedLargestRoughLandHillComponentDiameter: number;
  plannedMeanRoughnessPotential: number;
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
  finalLargestMountainComponentDiameter: number;
  finalNonVolcanoMountainTiles: number;
  finalNonVolcanoMountainShareOfPreLakeLand: number;
  finalVolcanoMountainTiles: number;
  volcanoFeatureTiles: number;
  finalHillTiles: number;
  finalHillShareOfPreLakeLand: number;
  finalHillComponentCount: number;
  finalLargestHillComponentSize: number;
  finalLargestHillComponentDiameter: number;
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
  resourcePlannedCount: number;
  resourcePlacedCount: number;
  resourceRejectedCount: number;
  resourceMismatchCount: number;
  resourceSiteSpacingTiles: number;
  resourceDemandTypeCount: number;
  resourceBelowMinTypeCount: number;
  resourceAboveMaxTypeCount: number;
  resourceBelowMinWithoutShortfallCount: number;
  resourceShortfallRecordedCount: number;
  resourceRegionMinimumShortfallCount: number;
  resourceInHabitatShare: number;
  resourceSameTypeSpacingViolationCount: number;
  resourceUniquePlannedTypes: number;
  resourceUniquePlacedTypes: number;
  resourcePlacedCountMinByType: number;
  resourcePlacedCountMaxByType: number;
  resourcePlannedNearestNeighborMin: number;
  resourcePlannedNearestNeighborP10: number;
  resourcePlannedNearestNeighborMedian: number;
  resourcePlacedNearestNeighborMin: number;
  resourcePlacedNearestNeighborP10: number;
  resourcePlacedNearestNeighborMedian: number;
  resourcePlacedMaxLocalDensityRadius2: number;
  resourcePlacedSectorMaxShare: number;
  resourcePlacedSectorEntropy01: number;
  resourcePlacedLatitudeBandMaxOverLandShare: number;
  resourcePlacedPolarBandShare: number;
  resourceOutcomeCountsByResource: readonly ResourceOutcomeResourceStats[];
  resourceOutcomeCountsByReason: readonly ResourceOutcomeReasonStats[];
  resourcePlanTypeCounts: Readonly<Record<string, number>>;
  resourcePlacedTypeCounts: Readonly<Record<string, number>>;
  resourcePlacedBiomeSymbolCounts: Readonly<Record<string, number>>;
  resourceRejectReasonCounts: Readonly<Record<string, number>>;
  finalResourceTypeCounts: Readonly<Record<string, number>>;
}>;

export type ResourceOutcomeReasonStats = Readonly<{
  reason: ResourcePlacementRejectionReason | ResourcePlacementMismatchReason;
  count: number;
}>;

export type ResourceOutcomeResourceStats = Readonly<{
  resourceType: number;
  plannedCount: number;
  placedCount: number;
  rejectedCount: number;
  mismatchCount: number;
  reasons: readonly ResourceOutcomeReasonStats[];
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

function incrementCount(counts: Record<string, number>, key: string | number): void {
  const normalizedKey = String(key);
  counts[normalizedKey] = (counts[normalizedKey] ?? 0) + 1;
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
    const x = idx % width;
    const y = (idx / width) | 0;
    for (const neighbor of getHexNeighborIndicesOddQ(x, y, width, height)) {
      if (neighbor <= idx || landMask[neighbor] !== 1) continue;
      sum += Math.abs((elevation[idx] ?? 0) - (elevation[neighbor] ?? 0));
      comparisons += 1;
    }
  }
  return comparisons === 0 ? 0 : sum / comparisons;
}

/**
 * Connected-component metrics catch the failure mode where total lake area looks
 * acceptable but the map is covered in one-tile circular basins. The canonical
 * odd-q, x-wrapping topology matches the Morphology generators.
 */
function computeMaskComponents(mask: Uint8Array, width: number, height: number): {
  componentCount: number;
  singleTileCount: number;
  largestComponentSize: number;
  largestComponentDiameter: number;
} {
  const components = collectMaskComponentsOddQ({ mask, width, height });
  let singleTileCount = 0;
  let largestComponentSize = 0;
  let largestComponentDiameter = 0;
  for (const component of components) {
    if (component.size === 1) singleTileCount += 1;
    largestComponentSize = Math.max(largestComponentSize, component.size);
    largestComponentDiameter = Math.max(largestComponentDiameter, component.diameter);
  }

  return {
    componentCount: components.length,
    singleTileCount,
    largestComponentSize,
    largestComponentDiameter,
  };
}

function computeMountainRegionMetrics(args: {
  landMask: Uint8Array;
  mountainRegionMask: Uint8Array;
  mountainMask: Uint8Array;
  foothillMask: Uint8Array;
  roughLandMask: Uint8Array;
  hillMask: Uint8Array;
  width: number;
  height: number;
}): {
  tiles: number;
  componentCount: number;
  largestComponentSize: number;
  largestComponentDiameter: number;
  mountainShare: number;
  foothillShare: number;
  roughLandShare: number;
  nonMountainShare: number;
  flatInteriorShare: number;
  largestFlatPocketSize: number;
} {
  const size = Math.max(0, args.width * args.height);
  const flatInteriorMask = new Uint8Array(size);
  let tiles = 0;
  let mountainTiles = 0;
  let foothillTiles = 0;
  let roughLandTiles = 0;
  let flatInteriorTiles = 0;

  for (let i = 0; i < size; i++) {
    if (args.landMask[i] !== 1 || args.mountainRegionMask[i] !== 1) continue;
    tiles += 1;
    if (args.mountainMask[i] === 1) mountainTiles += 1;
    if (args.foothillMask[i] === 1) foothillTiles += 1;
    if (args.roughLandMask[i] === 1) roughLandTiles += 1;
    if (args.mountainMask[i] !== 1 && args.hillMask[i] !== 1) {
      flatInteriorTiles += 1;
      flatInteriorMask[i] = 1;
    }
  }

  const regionComponents = computeMaskComponents(args.mountainRegionMask, args.width, args.height);
  const flatInteriorComponents = computeMaskComponents(flatInteriorMask, args.width, args.height);
  return {
    tiles,
    componentCount: regionComponents.componentCount,
    largestComponentSize: regionComponents.largestComponentSize,
    largestComponentDiameter: regionComponents.largestComponentDiameter,
    mountainShare: shareOf(mountainTiles, tiles),
    foothillShare: shareOf(foothillTiles, tiles),
    roughLandShare: shareOf(roughLandTiles, tiles),
    nonMountainShare: tiles === 0 ? 0 : 1 - mountainTiles / tiles,
    flatInteriorShare: shareOf(flatInteriorTiles, tiles),
    largestFlatPocketSize: flatInteriorComponents.largestComponentSize,
  };
}

function computeNearestNeighborStats(plotIndices: readonly number[], width: number): {
  min: number;
  p10: number;
  median: number;
} {
  if (plotIndices.length < 2) return { min: 0, p10: 0, median: 0 };
  const distances: number[] = [];
  for (let i = 0; i < plotIndices.length; i++) {
    let best = Number.POSITIVE_INFINITY;
    for (let j = 0; j < plotIndices.length; j++) {
      if (i === j) continue;
      best = Math.min(best, hexDistanceOddQPeriodicX(plotIndices[i]!, plotIndices[j]!, width));
    }
    if (Number.isFinite(best)) distances.push(best);
  }
  return {
    min: percentile(distances, 0),
    p10: percentile(distances, 0.1),
    median: percentile(distances, 0.5),
  };
}

function computeMaxLocalDensity(
  plotIndices: readonly number[],
  width: number,
  radius: number
): number {
  if (plotIndices.length === 0) return 0;
  let maxDensity = 0;
  for (const plotIndex of plotIndices) {
    let density = 0;
    for (const other of plotIndices) {
      if (hexDistanceOddQPeriodicX(plotIndex, other, width) <= radius) density += 1;
    }
    maxDensity = Math.max(maxDensity, density);
  }
  return maxDensity;
}

function computeSectorDistributionStats(
  plotIndices: readonly number[],
  width: number,
  height: number,
  sectorCols = 8,
  sectorRows = 4
): { maxShare: number; entropy01: number } {
  if (plotIndices.length === 0) return { maxShare: 0, entropy01: 0 };
  const cols = Math.max(1, Math.min(width, sectorCols));
  const rows = Math.max(1, Math.min(height, sectorRows));
  const counts = new Array(cols * rows).fill(0);
  for (const plotIndex of plotIndices) {
    const x = plotIndex % width;
    const y = (plotIndex / width) | 0;
    const sx = Math.min(cols - 1, Math.floor((x * cols) / width));
    const sy = Math.min(rows - 1, Math.floor((y * rows) / height));
    counts[sy * cols + sx] += 1;
  }

  let entropy = 0;
  let maxShare = 0;
  for (const count of counts) {
    if (count <= 0) continue;
    const share = count / plotIndices.length;
    maxShare = Math.max(maxShare, share);
    entropy -= share * Math.log(share);
  }
  const entropy01 = counts.length <= 1 ? 1 : entropy / Math.log(counts.length);
  return { maxShare: roundMetric(maxShare), entropy01: roundMetric(entropy01) };
}

function computeLatitudeDistributionStats(args: {
  landMask: Uint8Array;
  plotIndices: readonly number[];
  width: number;
  height: number;
  bandCount?: number;
}): { maxOverLandShare: number; polarBandShare: number } {
  const bandCount = Math.max(1, args.bandCount ?? 10);
  if (args.plotIndices.length === 0) return { maxOverLandShare: 0, polarBandShare: 0 };
  const landByBand = new Array(bandCount).fill(0);
  const resourcesByBand = new Array(bandCount).fill(0);
  let landTotal = 0;
  for (let i = 0; i < args.landMask.length; i++) {
    if (args.landMask[i] !== 1) continue;
    const y = (i / args.width) | 0;
    const band = Math.min(bandCount - 1, Math.floor((y * bandCount) / args.height));
    landByBand[band] += 1;
    landTotal += 1;
  }
  for (const plotIndex of args.plotIndices) {
    const y = (plotIndex / args.width) | 0;
    const band = Math.min(bandCount - 1, Math.floor((y * bandCount) / args.height));
    resourcesByBand[band] += 1;
  }

  let maxOverLandShare = 0;
  for (let band = 0; band < bandCount; band++) {
    const landShare = landTotal === 0 ? 0 : landByBand[band] / landTotal;
    if (landShare <= 0) continue;
    const resourceShare = resourcesByBand[band] / args.plotIndices.length;
    maxOverLandShare = Math.max(maxOverLandShare, resourceShare / landShare);
  }

  const polarBandCount = Math.min(2, Math.floor(bandCount / 2));
  let polarCount = 0;
  for (let band = 0; band < polarBandCount; band++) {
    polarCount += resourcesByBand[band] + resourcesByBand[bandCount - 1 - band];
  }

  return {
    maxOverLandShare: roundMetric(maxOverLandShare),
    polarBandShare: roundMetric(polarCount / args.plotIndices.length),
  };
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
      const expectedTerrains = legality.terrains.map((terrainName) =>
        adapter.getTerrainTypeIndex(terrainName)
      );
      const expectedBiomes = legality.biomes.map((biomeName) => adapter.getBiomeGlobal(biomeName));
      const waterExpected = legality.terrains.some(
        (terrainName) => terrainName === "TERRAIN_COAST" || terrainName === "TERRAIN_OCEAN"
      );
      return (
        expectedTerrains.includes(terrain) &&
        expectedBiomes.includes(biome) &&
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
    | {
        mountainMask?: Uint8Array;
        mountainRegionMask?: Uint8Array;
        mountainRegionIdByTile?: Int32Array;
        hillMask?: Uint8Array;
        foothillMask?: Uint8Array;
        roughLandMask?: Uint8Array;
        roughnessPotential?: Uint8Array;
      }
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
  const resourcePlan = context.artifacts.get(placementArtifacts.resourcePlan.id) as
    | {
        plannedCount?: number;
        siteSpacingTiles?: number;
        intents?: ReadonlyArray<
          Readonly<{
            plotIndex?: number;
            resourceTypeId?: number;
            inHabitat?: boolean;
          }>
        >;
        perType?: ReadonlyArray<
          Readonly<{
            resourceType?: string;
            resourceTypeId?: number;
            plannedCount?: number;
            minCount?: number;
            maxCount?: number;
            spacingFloorTiles?: number;
            shortfalls?: ReadonlyArray<Readonly<{ count?: number }>>;
          }>
        >;
        regionMinimums?: ReadonlyArray<Readonly<{ shortfall?: number }>>;
      }
    | undefined;
  const resourcePlacement = context.artifacts.get(placementArtifacts.resourcePlacementOutcomes.id) as
    | {
        summary?: {
          plannedCount?: number;
          placedCount?: number;
          rejectedCount?: number;
          mismatchCount?: number;
          byResource?: ResourceOutcomeResourceStats[];
          byReason?: ResourceOutcomeReasonStats[];
        };
        reconciliation?: {
          plannedCount?: number;
          placedCount?: number;
          rejectedCount?: number;
          shortfalls?: ReadonlyArray<Readonly<{ count?: number }>>;
        };
        outcomes?: ReadonlyArray<
          Readonly<{
            status?: "placed" | "rejected" | "mismatch";
            plotIndex?: number;
            resourceType?: number;
            reason?: string;
          }>
        >;
      }
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
  if (
    !(mountains?.mountainMask instanceof Uint8Array) ||
    !(mountains.mountainRegionMask instanceof Uint8Array) ||
    !(mountains.mountainRegionIdByTile instanceof Int32Array) ||
    !(mountains.hillMask instanceof Uint8Array) ||
    !(mountains.foothillMask instanceof Uint8Array) ||
    !(mountains.roughLandMask instanceof Uint8Array) ||
    !(mountains.roughnessPotential instanceof Uint8Array)
  ) {
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
  if (!Array.isArray(resourcePlan?.intents) || !Array.isArray(resourcePlan?.perType)) {
    throw new Error("Missing placement.resourcePlan.");
  }
  // S5: place-resources stamps the support-ADJUSTED plan, so every per-plot
  // join against placed outcomes must use the adjusted intents (the base plan
  // remains authority for per-type ranges, spacing floors, and shortfalls).
  const resourcePlanAdjusted = context.artifacts.get(placementArtifacts.resourcePlanAdjusted.id) as
    | {
        intents?: ReadonlyArray<
          Readonly<{ plotIndex?: number; resourceTypeId?: number; inHabitat?: boolean }>
        >;
      }
    | undefined;
  const stampedResourceIntents = Array.isArray(resourcePlanAdjusted?.intents)
    ? resourcePlanAdjusted.intents
    : resourcePlan.intents;
  if (!Array.isArray(resourcePlacement?.outcomes)) {
    throw new Error("Missing placement.resourcePlacementOutcomes.");
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
  if (!resourcePlacement.summary) {
    throw new Error("Missing placement resource outcome summary.");
  }
  const resourceOutcomeCountsByResource = resourcePlacement.summary.byResource ?? [];
  const resourcePlacedCounts = resourceOutcomeCountsByResource
    .filter((entry) => entry.placedCount > 0)
    .map((entry) => entry.placedCount);
  const resourcePerTypeRows = resourcePlan.perType ?? [];
  let resourceBelowMinTypeCount = 0;
  let resourceAboveMaxTypeCount = 0;
  let resourceBelowMinWithoutShortfallCount = 0;
  let resourceShortfallRecordedCount = 0;
  for (const row of resourcePerTypeRows) {
    const planned = Math.max(0, Math.trunc(row.plannedCount ?? 0));
    const minCount = Math.max(0, Math.trunc(row.minCount ?? 0));
    const maxCount = Math.max(0, Math.trunc(row.maxCount ?? 0));
    const shortfall = (row.shortfalls ?? []).reduce((sum, item) => sum + (item.count ?? 0), 0);
    resourceShortfallRecordedCount += shortfall;
    if (planned < minCount) {
      resourceBelowMinTypeCount += 1;
      if (shortfall === 0) resourceBelowMinWithoutShortfallCount += 1;
    }
    if (planned > maxCount) resourceAboveMaxTypeCount += 1;
  }
  const resourceRegionMinimumShortfallCount = (resourcePlan.regionMinimums ?? []).reduce(
    (sum, row) => sum + Math.max(0, Math.trunc(row.shortfall ?? 0)),
    0
  );

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
  const resourcePlanTypeCounts: Record<string, number> = {};
  const resourcePlacedTypeCounts: Record<string, number> = {};
  const resourcePlacedBiomeSymbolCounts: Record<string, number> = {};
  const resourceRejectReasonCounts: Record<string, number> = {};
  const finalResourceTypeCounts: Record<string, number> = {};
  const featureTypeByKey = Object.fromEntries(
    FEATURE_KEYS.map((key) => [key, adapter.getFeatureTypeIndex(key)])
  );
  const noResource = adapter.NO_RESOURCE | 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const isWater = adapter.isWater(x, y);
      const terrain = adapter.getTerrainType(x, y);
      const feature = adapter.getFeatureType(x, y);
      const resource = adapter.getResourceType(x, y) | 0;
      if (resource !== noResource) incrementCount(finalResourceTypeCounts, resource);
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
          const expectedTerrains = legality.terrains.map((terrainName) =>
            adapter.getTerrainTypeIndex(terrainName)
          );
          const expectedBiomes = legality.biomes.map((biomeName) => adapter.getBiomeGlobal(biomeName));
          const expectedWater = legality.terrains.some(
            (terrainName) => terrainName === "TERRAIN_COAST" || terrainName === "TERRAIN_OCEAN"
          );
          if (
            !expectedTerrains.includes(terrain) ||
            !expectedBiomes.includes(adapter.getBiomeType(x, y)) ||
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
  const resourceIntentByPlot = new Map<number, { resourceTypeId: number; inHabitat: boolean }>();
  for (const intent of stampedResourceIntents) {
    if (Number.isFinite(intent.resourceTypeId)) {
      incrementCount(resourcePlanTypeCounts, intent.resourceTypeId as number);
    }
    const plotIndex = Number.isFinite(intent.plotIndex) ? Math.trunc(intent.plotIndex as number) : -1;
    if (plotIndex >= 0 && plotIndex < width * height) {
      resourceIntentByPlot.set(plotIndex, {
        resourceTypeId: Math.trunc(intent.resourceTypeId ?? -1),
        inHabitat: intent.inHabitat === true,
      });
    }
  }
  const resourcePlannedPlotIndices = stampedResourceIntents
    .map((intent) =>
      Number.isFinite(intent.plotIndex) ? Math.trunc(intent.plotIndex as number) : -1
    )
    .filter((plotIndex) => plotIndex >= 0 && plotIndex < width * height);
  const resourcePlacedPlotIndices: number[] = [];
  const resourcePlacedPlotsByType = new Map<number, number[]>();
  let resourcePlacedInHabitat = 0;
  for (const outcome of resourcePlacement.outcomes) {
    if (outcome.status === "placed" && Number.isFinite(outcome.resourceType)) {
      incrementCount(resourcePlacedTypeCounts, outcome.resourceType as number);
      const plotIndex = Number.isFinite(outcome.plotIndex)
        ? Math.trunc(outcome.plotIndex as number)
        : -1;
      if (plotIndex >= 0 && plotIndex < width * height) {
        resourcePlacedPlotIndices.push(plotIndex);
        const typeId = Math.trunc(outcome.resourceType as number);
        const typed = resourcePlacedPlotsByType.get(typeId) ?? [];
        typed.push(plotIndex);
        resourcePlacedPlotsByType.set(typeId, typed);
        if (resourceIntentByPlot.get(plotIndex)?.inHabitat) resourcePlacedInHabitat += 1;
        incrementCount(
          resourcePlacedBiomeSymbolCounts,
          biomeSymbolFromIndex(classification.biomeIndex[plotIndex] ?? 255)
        );
      }
    }
    if (outcome.status === "rejected") {
      incrementCount(resourceRejectReasonCounts, outcome.reason ?? "unknown");
    }
  }
  const spacingFloorByTypeId = new Map<number, number>();
  for (const row of resourcePerTypeRows) {
    if (Number.isFinite(row.resourceTypeId)) {
      spacingFloorByTypeId.set(
        Math.trunc(row.resourceTypeId as number),
        Math.max(0, Math.trunc(row.spacingFloorTiles ?? 0))
      );
    }
  }
  let resourceSameTypeSpacingViolationCount = 0;
  for (const [typeId, plots] of resourcePlacedPlotsByType) {
    const floor = spacingFloorByTypeId.get(typeId) ?? 0;
    if (floor <= 0) continue;
    for (let i = 0; i < plots.length; i++) {
      for (let j = i + 1; j < plots.length; j++) {
        if (hexDistanceOddQPeriodicX(plots[i]!, plots[j]!, width) < floor) {
          resourceSameTypeSpacingViolationCount += 1;
        }
      }
    }
  }

  const resourcePlannedNearestNeighbor = computeNearestNeighborStats(resourcePlannedPlotIndices, width);
  const resourcePlacedNearestNeighbor = computeNearestNeighborStats(resourcePlacedPlotIndices, width);
  const resourcePlacedSectors = computeSectorDistributionStats(resourcePlacedPlotIndices, width, height);
  const resourcePlacedLatitude = computeLatitudeDistributionStats({
    landMask: topography.landMask,
    plotIndices: resourcePlacedPlotIndices,
    width,
    height,
  });

  const preLakeLandTiles = countMask(topography.landMask);
  const plannedMountainTiles = countMask(mountains.mountainMask);
  const plannedMountainComponents = computeMaskComponents(mountains.mountainMask, width, height);
  const plannedMountainRegionMetrics = computeMountainRegionMetrics({
    landMask: topography.landMask,
    mountainRegionMask: mountains.mountainRegionMask,
    mountainMask: mountains.mountainMask,
    foothillMask: mountains.foothillMask,
    roughLandMask: mountains.roughLandMask,
    hillMask: mountains.hillMask,
    width,
    height,
  });
  const finalMountainComponents = computeMaskComponents(finalMountainMask, width, height);
  const plannedHillTiles = countMask(mountains.hillMask);
  const plannedFoothillTiles = countMask(mountains.foothillMask);
  const plannedRoughLandHillTiles = countMask(mountains.roughLandMask);
  const plannedRoughLandHillComponents = computeMaskComponents(mountains.roughLandMask, width, height);
  const landRoughnessPotential: number[] = [];
  for (let i = 0; i < mountains.roughnessPotential.length; i++) {
    if (topography.landMask[i] === 1) landRoughnessPotential.push(mountains.roughnessPotential[i] ?? 0);
  }
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
    plannedLargestMountainComponentDiameter: plannedMountainComponents.largestComponentDiameter,
    plannedMountainRegionTiles: plannedMountainRegionMetrics.tiles,
    plannedMountainRegionShareOfPreLakeLand: shareOf(
      plannedMountainRegionMetrics.tiles,
      preLakeLandTiles
    ),
    plannedMountainRegionComponentCount: plannedMountainRegionMetrics.componentCount,
    plannedLargestMountainRegionComponentSize: plannedMountainRegionMetrics.largestComponentSize,
    plannedLargestMountainRegionComponentDiameter:
      plannedMountainRegionMetrics.largestComponentDiameter,
    plannedMountainRegionMountainShare: roundMetric(
      plannedMountainRegionMetrics.mountainShare
    ),
    plannedMountainRegionFoothillShare: roundMetric(
      plannedMountainRegionMetrics.foothillShare
    ),
    plannedMountainRegionRoughLandShare: roundMetric(
      plannedMountainRegionMetrics.roughLandShare
    ),
    plannedMountainRegionNonMountainShare: roundMetric(
      plannedMountainRegionMetrics.nonMountainShare
    ),
    plannedMountainRegionFlatInteriorShare: roundMetric(
      plannedMountainRegionMetrics.flatInteriorShare
    ),
    plannedLargestMountainRegionFlatPocketSize:
      plannedMountainRegionMetrics.largestFlatPocketSize,
    plannedHillTiles,
    plannedHillShareOfPreLakeLand: shareOf(plannedHillTiles, preLakeLandTiles),
    plannedHillComponentCount: plannedHillComponents.componentCount,
    plannedLargestHillComponentSize: plannedHillComponents.largestComponentSize,
    plannedLargestHillComponentDiameter: plannedHillComponents.largestComponentDiameter,
    plannedFoothillTiles,
    plannedFoothillShareOfPreLakeLand: shareOf(plannedFoothillTiles, preLakeLandTiles),
    plannedRoughLandHillTiles,
    plannedRoughLandHillShareOfPreLakeLand: shareOf(
      plannedRoughLandHillTiles,
      preLakeLandTiles
    ),
    plannedRoughLandHillComponentCount: plannedRoughLandHillComponents.componentCount,
    plannedLargestRoughLandHillComponentSize: plannedRoughLandHillComponents.largestComponentSize,
    plannedLargestRoughLandHillComponentDiameter: plannedRoughLandHillComponents.largestComponentDiameter,
    plannedMeanRoughnessPotential: roundMetric(mean(landRoughnessPotential)),
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
    finalLargestMountainComponentDiameter: finalMountainComponents.largestComponentDiameter,
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
    finalLargestHillComponentDiameter: finalHillComponents.largestComponentDiameter,
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
    resourcePlannedCount: Math.max(0, resourcePlacement.summary?.plannedCount ?? 0),
    resourcePlacedCount: Math.max(0, resourcePlacement.summary?.placedCount ?? 0),
    resourceRejectedCount: Math.max(0, resourcePlacement.summary?.rejectedCount ?? 0),
    resourceMismatchCount: Math.max(0, resourcePlacement.summary?.mismatchCount ?? 0),
    resourceSiteSpacingTiles: Math.max(0, resourcePlan.siteSpacingTiles ?? 0),
    resourceDemandTypeCount: resourcePerTypeRows.length,
    resourceBelowMinTypeCount,
    resourceAboveMaxTypeCount,
    resourceBelowMinWithoutShortfallCount,
    resourceShortfallRecordedCount,
    resourceRegionMinimumShortfallCount,
    resourceInHabitatShare:
      resourcePlacedPlotIndices.length === 0
        ? 1
        : roundMetric(resourcePlacedInHabitat / resourcePlacedPlotIndices.length),
    resourceSameTypeSpacingViolationCount,
    resourceUniquePlannedTypes: resourceOutcomeCountsByResource.filter((entry) => entry.plannedCount > 0)
      .length,
    resourceUniquePlacedTypes: resourceOutcomeCountsByResource.filter((entry) => entry.placedCount > 0)
      .length,
    resourcePlacedCountMinByType: resourcePlacedCounts.length === 0 ? 0 : Math.min(...resourcePlacedCounts),
    resourcePlacedCountMaxByType: resourcePlacedCounts.length === 0 ? 0 : Math.max(...resourcePlacedCounts),
    resourcePlannedNearestNeighborMin: resourcePlannedNearestNeighbor.min,
    resourcePlannedNearestNeighborP10: resourcePlannedNearestNeighbor.p10,
    resourcePlannedNearestNeighborMedian: resourcePlannedNearestNeighbor.median,
    resourcePlacedNearestNeighborMin: resourcePlacedNearestNeighbor.min,
    resourcePlacedNearestNeighborP10: resourcePlacedNearestNeighbor.p10,
    resourcePlacedNearestNeighborMedian: resourcePlacedNearestNeighbor.median,
    resourcePlacedMaxLocalDensityRadius2: computeMaxLocalDensity(resourcePlacedPlotIndices, width, 2),
    resourcePlacedSectorMaxShare: resourcePlacedSectors.maxShare,
    resourcePlacedSectorEntropy01: resourcePlacedSectors.entropy01,
    resourcePlacedLatitudeBandMaxOverLandShare: resourcePlacedLatitude.maxOverLandShare,
    resourcePlacedPolarBandShare: resourcePlacedLatitude.polarBandShare,
    resourceOutcomeCountsByResource,
    resourceOutcomeCountsByReason: resourcePlacement.summary.byReason ?? [],
    resourcePlanTypeCounts,
    resourcePlacedTypeCounts,
    resourcePlacedBiomeSymbolCounts,
    resourceRejectReasonCounts,
    finalResourceTypeCounts,
  };
}
