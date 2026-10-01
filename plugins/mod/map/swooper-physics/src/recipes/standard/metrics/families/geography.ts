import {
  type ComponentMetricSummary,
  type CountMetric,
  countMetricMask,
  measureMetricCount,
} from "@swooper/mapgen-metrics";

import type { StandardMapCapture } from "../capture.js";

/** Geography facts that distinguish authored land/water intent from realized Civ7 surface. */
export type StandardGeographyMetrics = Readonly<{
  tileCount: number;
  plannedLand: CountMetric;
  realizedLand: CountMetric;
  realizedWater: CountMetric;
  coastWater: CountMetric;
  deepOceanWater: CountMetric;
  shelfBeyondShoreline: CountMetric;
  plannedLakes: CountMetric;
  projectedLakes: CountMetric;
  lakeProjectionCandidateCount: number;
  projectedLakeComponents: ComponentMetricSummary;
  singleTileLakeTiles: CountMetric;
  lakeProjectionRejectedCount: number;
  waterDriftCount: number;
  finalLakeWaterDriftCount: number;
  finalLakeClassificationDriftCount: number;
}>;

/** Measures geography from copied recipe-model and observed engine evidence without judgment. */
export function measureStandardGeography(capture: StandardMapCapture): StandardGeographyMetrics {
  const { width, height } = capture.provenance;
  const tileCount = width * height;
  const plannedLand = countMetricMask(capture.model.exposedLandMask);
  const finiteTileCount = tileCount - countMetricMask(capture.model.externalWaterMask).count;
  const projectedLakeCount = capture.projection.placementParity.acceptedLakeTileCount;
  let realizedWaterCount = 0;
  let coastWaterCount = 0;
  let deepOceanCount = 0;
  let shelfBeyondShorelineCount = 0;

  for (let index = 0; index < tileCount; index += 1) {
    const water = capture.observation.isWater[index] === 1;
    const terrain = capture.observation.terrain[index];
    if (water) {
      realizedWaterCount += 1;
      if (terrain === capture.observation.coastTerrain) coastWaterCount += 1;
      if (terrain === capture.observation.oceanTerrain) deepOceanCount += 1;
    }
    if (
      capture.model.externalWaterMask[index] === 1 &&
      capture.model.shelfMask[index] === 1 &&
      capture.model.coastalWater[index] === 0 &&
      (capture.model.distanceToCoast[index] ?? 0) >= 2
    ) {
      shelfBeyondShorelineCount += 1;
    }
  }

  const projectedLakeComponents = capture.projection.lakes.components;
  const realizedLandCount = tileCount - realizedWaterCount;
  return Object.freeze({
    tileCount,
    plannedLand,
    realizedLand: measureMetricCount(realizedLandCount, tileCount),
    realizedWater: measureMetricCount(realizedWaterCount, tileCount),
    coastWater: measureMetricCount(coastWaterCount, realizedWaterCount),
    deepOceanWater: measureMetricCount(deepOceanCount, realizedWaterCount),
    shelfBeyondShoreline: measureMetricCount(shelfBeyondShorelineCount, realizedWaterCount),
    plannedLakes: measureMetricCount(
      countMetricMask(capture.model.plannedLakeMask).count,
      finiteTileCount
    ),
    projectedLakes: measureMetricCount(projectedLakeCount, finiteTileCount),
    lakeProjectionCandidateCount: capture.projection.lakes.plannedLakeTileCount,
    projectedLakeComponents,
    singleTileLakeTiles: measureMetricCount(
      projectedLakeComponents.singleTileComponentCount,
      projectedLakeCount
    ),
    lakeProjectionRejectedCount: capture.projection.lakes.rejectedLakeTileCount,
    waterDriftCount: capture.projection.placementParity.waterDriftCount,
    finalLakeWaterDriftCount: capture.projection.placementParity.finalLakeWaterDriftCount,
    finalLakeClassificationDriftCount:
      capture.projection.placementParity.finalLakeClassificationDriftCount,
  });
}
