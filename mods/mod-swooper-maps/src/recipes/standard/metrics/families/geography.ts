import { collectMaskComponentsOddQ } from "@swooper/mapgen-core/lib/grid";
import {
  type ComponentMetricSummary,
  type CountMetric,
  countMetricMask,
  measureMetricCount,
  summarizeMetricComponents,
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
  plannedLakes: CountMetric;
  projectedLakes: CountMetric;
  projectedLakeComponents: ComponentMetricSummary;
  singleTileLakeTiles: CountMetric;
  lakeWaterDriftCount: number;
  finalLakeWaterDriftCount: number;
  finalLakeClassificationDriftCount: number;
  lakeProjectionMismatchCount: number;
}>;

/** Measures geography from copied recipe-model and observed engine evidence without judgment. */
export function measureStandardGeography(capture: StandardMapCapture): StandardGeographyMetrics {
  const { width, height } = capture.provenance;
  const tileCount = width * height;
  const plannedLand = countMetricMask(capture.model.landMask);
  const projectedLakeCount = countMetricMask(capture.projection.lakeMask).count;
  let realizedWaterCount = 0;
  let coastWaterCount = 0;
  let deepOceanCount = 0;
  let lakeWaterDriftCount = 0;

  for (let index = 0; index < tileCount; index += 1) {
    const water = capture.observation.isWater[index] === 1;
    const terrain = capture.observation.terrain[index];
    if (water) {
      realizedWaterCount += 1;
      if (terrain === capture.observation.coastTerrain) coastWaterCount += 1;
      if (terrain === capture.observation.oceanTerrain) deepOceanCount += 1;
    }
    if (capture.projection.lakeMask[index] === 1 && !water) lakeWaterDriftCount += 1;
  }

  const projectedLakeComponents = summarizeMetricComponents(
    collectMaskComponentsOddQ({ mask: capture.projection.lakeMask, width, height })
  );
  const realizedLandCount = tileCount - realizedWaterCount;
  return Object.freeze({
    tileCount,
    plannedLand,
    realizedLand: measureMetricCount(realizedLandCount, tileCount),
    realizedWater: measureMetricCount(realizedWaterCount, tileCount),
    coastWater: measureMetricCount(coastWaterCount, realizedWaterCount),
    deepOceanWater: measureMetricCount(deepOceanCount, realizedWaterCount),
    plannedLakes: measureMetricCount(
      countMetricMask(capture.model.plannedLakeMask).count,
      plannedLand.count
    ),
    projectedLakes: measureMetricCount(projectedLakeCount, plannedLand.count),
    projectedLakeComponents,
    singleTileLakeTiles: measureMetricCount(
      projectedLakeComponents.singleTileComponentCount,
      projectedLakeCount
    ),
    lakeWaterDriftCount,
    finalLakeWaterDriftCount: capture.projection.finalLakeWaterDriftCount,
    finalLakeClassificationDriftCount: capture.projection.finalLakeClassificationDriftCount,
    lakeProjectionMismatchCount: capture.projection.lakeSinkMismatchCount,
  });
}
