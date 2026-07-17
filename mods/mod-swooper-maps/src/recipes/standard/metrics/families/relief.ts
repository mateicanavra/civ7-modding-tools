import { collectMaskComponentsOddQ } from "@swooper/mapgen-core/lib/grid";
import {
  type ComponentMetricSummary,
  type CountMetric,
  countMetricMask,
  measureMetricCount,
  summarizeMetricComponents,
} from "@swooper/mapgen-metrics";

import type { StandardMapCapture } from "../capture.js";

/** Relief facts for authored landforms, orographic interiors, and realized Civ7 terrain. */
export type StandardReliefMetrics = Readonly<{
  plannedMountains: CountMetric;
  plannedMountainComponents: ComponentMetricSummary;
  mountainRegion: Readonly<{
    tiles: number;
    components: ComponentMetricSummary;
    mountains: CountMetric;
    foothills: CountMetric;
    roughLand: CountMetric;
    nonMountains: CountMetric;
    flatInterior: CountMetric;
    flatInteriorComponents: ComponentMetricSummary;
  }>;
  plannedHills: CountMetric;
  plannedHillComponents: ComponentMetricSummary;
  plannedFoothills: CountMetric;
  plannedRoughLandHills: CountMetric;
  plannedRoughLandComponents: ComponentMetricSummary;
  plannedRoughTerrain: CountMetric;
  plannedVolcanoes: number;
  volcanoKindCounts: Readonly<Record<"subductionArc" | "rift" | "hotspot", number>>;
  finalMountains: CountMetric;
  finalMountainComponents: ComponentMetricSummary;
  finalNonVolcanoMountains: CountMetric;
  finalVolcanoMountains: number;
  volcanoFeatures: number;
  finalHills: CountMetric;
  finalHillComponents: ComponentMetricSummary;
  finalRoughTerrain: CountMetric;
  finalNonVolcanoRoughTerrain: CountMetric;
  finalFlatTerrain: CountMetric;
}>;

/** Measures relief relationships from one closed Standard capture without applying thresholds. */
export function measureStandardRelief(capture: StandardMapCapture): StandardReliefMetrics {
  const { width, height } = capture.provenance;
  const population = countMetricMask(capture.model.landMask).count;
  const finalMountainMask = new Uint8Array(width * height);
  const finalHillMask = new Uint8Array(width * height);
  let finalMountainCount = 0;
  let finalHillCount = 0;
  let finalFlatCount = 0;
  let volcanoFeatureCount = 0;
  let finalVolcanoMountainCount = 0;

  for (let index = 0; index < width * height; index += 1) {
    if (capture.observation.isWater[index] === 1) continue;
    const terrain = capture.observation.terrain[index];
    const feature = capture.observation.feature[index];
    if (terrain === capture.observation.mountainTerrain) {
      finalMountainMask[index] = 1;
      finalMountainCount += 1;
    } else if (terrain === capture.observation.hillTerrain) {
      finalHillMask[index] = 1;
      finalHillCount += 1;
    } else if (terrain === capture.observation.flatTerrain) {
      finalFlatCount += 1;
    }
    if (feature === capture.observation.volcanoFeature) {
      volcanoFeatureCount += 1;
      if (terrain === capture.observation.mountainTerrain) finalVolcanoMountainCount += 1;
    }
  }

  const plannedMountainCount = countMetricMask(capture.model.mountainMask).count;
  const plannedHillCount = countMetricMask(capture.model.hillMask).count;
  const plannedFoothillCount = countMetricMask(capture.model.foothillMask).count;
  const plannedRoughLandCount = countMetricMask(capture.model.roughLandMask).count;
  const region = measureMountainRegion(capture);
  const finalNonVolcanoMountainCount = finalMountainCount - finalVolcanoMountainCount;

  const volcanoKindCounts = { subductionArc: 0, rift: 0, hotspot: 0 };
  for (const volcano of capture.model.volcanoes) volcanoKindCounts[volcano.kind] += 1;

  return Object.freeze({
    plannedMountains: measureMetricCount(plannedMountainCount, population),
    plannedMountainComponents: summarizeMask(capture.model.mountainMask, width, height),
    mountainRegion: region,
    plannedHills: measureMetricCount(plannedHillCount, population),
    plannedHillComponents: summarizeMask(capture.model.hillMask, width, height),
    plannedFoothills: measureMetricCount(plannedFoothillCount, population),
    plannedRoughLandHills: measureMetricCount(plannedRoughLandCount, population),
    plannedRoughLandComponents: summarizeMask(capture.model.roughLandMask, width, height),
    plannedRoughTerrain: measureMetricCount(plannedMountainCount + plannedHillCount, population),
    plannedVolcanoes: countMetricMask(capture.model.volcanoMask).count,
    volcanoKindCounts: Object.freeze(volcanoKindCounts),
    finalMountains: measureMetricCount(finalMountainCount, population),
    finalMountainComponents: summarizeMask(finalMountainMask, width, height),
    finalNonVolcanoMountains: measureMetricCount(finalNonVolcanoMountainCount, population),
    finalVolcanoMountains: finalVolcanoMountainCount,
    volcanoFeatures: volcanoFeatureCount,
    finalHills: measureMetricCount(finalHillCount, population),
    finalHillComponents: summarizeMask(finalHillMask, width, height),
    finalRoughTerrain: measureMetricCount(finalMountainCount + finalHillCount, population),
    finalNonVolcanoRoughTerrain: measureMetricCount(
      finalNonVolcanoMountainCount + finalHillCount,
      population
    ),
    finalFlatTerrain: measureMetricCount(finalFlatCount, population),
  });
}

function measureMountainRegion(
  capture: StandardMapCapture
): StandardReliefMetrics["mountainRegion"] {
  const { width, height } = capture.provenance;
  const flatInteriorMask = new Uint8Array(width * height);
  let regionTiles = 0;
  let mountainTiles = 0;
  let foothillTiles = 0;
  let roughLandTiles = 0;
  let flatInteriorTiles = 0;

  for (let index = 0; index < width * height; index += 1) {
    if (capture.model.landMask[index] !== 1 || capture.model.mountainRegionMask[index] !== 1) {
      continue;
    }
    regionTiles += 1;
    if (capture.model.mountainMask[index] === 1) mountainTiles += 1;
    if (capture.model.foothillMask[index] === 1) foothillTiles += 1;
    if (capture.model.roughLandMask[index] === 1) roughLandTiles += 1;
    if (capture.model.mountainMask[index] !== 1 && capture.model.hillMask[index] !== 1) {
      flatInteriorMask[index] = 1;
      flatInteriorTiles += 1;
    }
  }

  return Object.freeze({
    tiles: regionTiles,
    components: summarizeMask(capture.model.mountainRegionMask, width, height),
    mountains: measureMetricCount(mountainTiles, regionTiles),
    foothills: measureMetricCount(foothillTiles, regionTiles),
    roughLand: measureMetricCount(roughLandTiles, regionTiles),
    nonMountains: measureMetricCount(regionTiles - mountainTiles, regionTiles),
    flatInterior: measureMetricCount(flatInteriorTiles, regionTiles),
    flatInteriorComponents: summarizeMask(flatInteriorMask, width, height),
  });
}

function summarizeMask(mask: Uint8Array, width: number, height: number): ComponentMetricSummary {
  return summarizeMetricComponents(collectMaskComponentsOddQ({ mask, width, height }));
}
