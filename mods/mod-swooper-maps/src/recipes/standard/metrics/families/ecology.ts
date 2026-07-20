import { BIOME_SYMBOL_TO_INDEX, biomeSymbolFromIndex } from "@mapgen/domain/ecology";
import { type CountMetric, measureMetricCount } from "@swooper/mapgen-metrics";

import type { StandardFeatureRuntime, StandardMapCapture } from "../capture.js";
import { isStandardFeatureHabitatMismatch } from "../policy/feature-habitat.js";

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
const MINIMUM_LAND_TILES_PER_LATITUDE_ROW = 20;

/** Neutral row-wise biome measurements retained for latitude and banding studies. */
export type StandardBiomeRowMetrics = Readonly<{
  landRowCount: number;
  medianBiomeDiversity: number | null;
  maximumBiomeDiversity: number | null;
  qualifiedRainforestRowCount: number;
  adjacentRainforestRowPairCount: number;
  maximumAdjacentRainforestShareDelta: number | null;
}>;

/** Ecology facts for biome diversity, feature families, legality, and broad habitat fidelity. */
export type StandardEcologyMetrics = Readonly<{
  biomeDiversity: number;
  dominantBiome: string | null;
  biomeRows: StandardBiomeRowMetrics;
  coldBiomeTiles: CountMetric;
  unclassifiedModeledLand: CountMetric;
  featureCounts: Readonly<Record<string, number>>;
  wetlandTiles: CountMetric;
  reefFamilyTiles: CountMetric;
  coldReefCoastTiles: CountMetric;
  vegetationTiles: CountMetric;
  vegetationFamiliesPresent: number;
  invalidFeatureSurfaceCount: number;
  featureHabitatMismatchCounts: Readonly<Record<string, number>>;
  featureAttemptCounts: Readonly<Record<string, number>>;
  featureRejectCounts: Readonly<Record<string, number>>;
}>;

/** Measures realized Ecology product evidence without applying identity thresholds. */
export function measureStandardEcology(capture: StandardMapCapture): StandardEcologyMetrics {
  const { width, height } = capture.provenance;
  const tileCount = capture.provenance.width * capture.provenance.height;
  const plannedLandCount = countBinary(capture.model.landMask);
  const realizedWaterCount = countBinary(capture.observation.isWater);
  const coastWaterCount = countTerrain(capture, capture.observation.coastTerrain, true);
  const featureByType = new Map(
    capture.observation.features.map((feature) => [feature.typeId, feature])
  );
  const featureCounts: Record<string, number> = Object.fromEntries(
    capture.observation.features.map(({ key }) => [key, 0])
  );
  const mismatchCounts: Record<string, number> = Object.fromEntries(
    capture.observation.features.map(({ key }) => [key, 0])
  );
  const biomeCounts = new Map<string, number>();
  const rowBiomeDiversity: number[] = [];
  const rainforestShareByRow: Array<number | null> = [];
  let invalidFeatureSurfaceCount = 0;
  let unclassifiedModeledLandCount = 0;

  for (let index = 0; index < tileCount; index += 1) {
    if (capture.model.landMask[index] === 1) {
      const biomeIndex = capture.model.biomeIndex[index]!;
      if (biomeIndex === 255) {
        unclassifiedModeledLandCount += 1;
      } else {
        const biome = biomeSymbolFromIndex(biomeIndex);
        biomeCounts.set(biome, (biomeCounts.get(biome) ?? 0) + 1);
      }
    }
    const feature = featureByType.get(capture.observation.feature[index]!);
    if (!feature) continue;
    featureCounts[feature.key] = (featureCounts[feature.key] ?? 0) + 1;
    if (!isSurfaceLegal(capture, feature, index)) invalidFeatureSurfaceCount += 1;
    if (isStandardFeatureHabitatMismatch(feature.key, index, capture.model)) {
      mismatchCounts[feature.key] = (mismatchCounts[feature.key] ?? 0) + 1;
    }
  }

  for (let y = 0; y < height; y += 1) {
    let landTiles = 0;
    let rainforestTiles = 0;
    const rowBiomes = new Set<number>();
    for (let x = 0; x < width; x += 1) {
      const index = y * width + x;
      if (capture.model.landMask[index] !== 1) continue;
      landTiles += 1;
      const biomeIndex = capture.model.biomeIndex[index]!;
      if (biomeIndex !== 255) rowBiomes.add(biomeIndex);
      if (biomeIndex === BIOME_SYMBOL_TO_INDEX.tropicalRainforest) rainforestTiles += 1;
    }
    if (landTiles > 0) rowBiomeDiversity.push(rowBiomes.size);
    rainforestShareByRow.push(
      landTiles >= MINIMUM_LAND_TILES_PER_LATITUDE_ROW ? rainforestTiles / landTiles : null
    );
  }

  const adjacentRainforestShareDeltas: number[] = [];
  for (let y = 1; y < rainforestShareByRow.length; y += 1) {
    const previous = rainforestShareByRow[y - 1];
    const current = rainforestShareByRow[y];
    if (previous === null || current === null) continue;
    adjacentRainforestShareDeltas.push(Math.abs(current - previous));
  }

  let dominantBiome: string | null = null;
  let dominantCount = -1;
  for (const [biome, count] of biomeCounts) {
    if (count > dominantCount) {
      dominantBiome = biome;
      dominantCount = count;
    }
  }

  const wetlandCount = sumFeatureFamily(featureCounts, WETLAND_FEATURES);
  const reefCount = sumFeatureFamily(featureCounts, REEF_FEATURES);
  const vegetationCount = sumFeatureFamily(featureCounts, VEGETATION_FEATURES);
  const vegetationFamiliesPresent = [...VEGETATION_FEATURES].filter(
    (key) => (featureCounts[key] ?? 0) > 0
  ).length;

  return Object.freeze({
    biomeDiversity: biomeCounts.size,
    dominantBiome,
    biomeRows: Object.freeze({
      landRowCount: rowBiomeDiversity.length,
      medianBiomeDiversity: medianOrNull(rowBiomeDiversity),
      maximumBiomeDiversity: rowBiomeDiversity.length === 0 ? null : Math.max(...rowBiomeDiversity),
      qualifiedRainforestRowCount: rainforestShareByRow.filter((value) => value !== null).length,
      adjacentRainforestRowPairCount: adjacentRainforestShareDeltas.length,
      maximumAdjacentRainforestShareDelta:
        adjacentRainforestShareDeltas.length === 0
          ? null
          : Math.max(...adjacentRainforestShareDeltas),
    }),
    coldBiomeTiles: measureMetricCount(
      (biomeCounts.get("tundra") ?? 0) + (biomeCounts.get("boreal") ?? 0),
      plannedLandCount
    ),
    unclassifiedModeledLand: measureMetricCount(unclassifiedModeledLandCount, plannedLandCount),
    featureCounts: Object.freeze(featureCounts),
    wetlandTiles: measureMetricCount(wetlandCount, plannedLandCount),
    reefFamilyTiles: measureMetricCount(reefCount, realizedWaterCount),
    coldReefCoastTiles: measureMetricCount(featureCounts.FEATURE_COLD_REEF ?? 0, coastWaterCount),
    vegetationTiles: measureMetricCount(vegetationCount, plannedLandCount),
    vegetationFamiliesPresent,
    invalidFeatureSurfaceCount,
    featureHabitatMismatchCounts: Object.freeze(mismatchCounts),
    featureAttemptCounts: capture.projection.featureAttempts,
    featureRejectCounts: capture.projection.featureRejections,
  });
}

function medianOrNull(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = values.slice().sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[middle]! : (sorted[middle - 1]! + sorted[middle]!) / 2;
}

function isSurfaceLegal(
  capture: StandardMapCapture,
  feature: StandardFeatureRuntime,
  index: number
): boolean {
  if (feature.legalTerrainIds.length === 0 && feature.legalBiomeIds.length === 0) return true;
  const water = capture.observation.isWater[index] === 1;
  return (
    feature.legalTerrainIds.includes(capture.observation.terrain[index]!) &&
    feature.legalBiomeIds.includes(capture.observation.biome[index]!) &&
    (feature.expectsWater ? water : !water)
  );
}

function countBinary(values: ArrayLike<number>): number {
  let count = 0;
  for (let index = 0; index < values.length; index += 1) if (values[index] === 1) count += 1;
  return count;
}

function countTerrain(capture: StandardMapCapture, terrain: number, water: boolean): number {
  let count = 0;
  for (let index = 0; index < capture.observation.terrain.length; index += 1) {
    if (
      capture.observation.terrain[index] === terrain &&
      (capture.observation.isWater[index] === 1) === water
    ) {
      count += 1;
    }
  }
  return count;
}

function sumFeatureFamily(
  counts: Readonly<Record<string, number>>,
  family: ReadonlySet<string>
): number {
  let count = 0;
  for (const feature of family) count += counts[feature] ?? 0;
  return count;
}
