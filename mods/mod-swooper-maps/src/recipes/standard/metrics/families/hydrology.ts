import { isAnyRiverClass, isMajorRiverClass, isMinorRiverClass } from "@mapgen/domain/hydrology";
import { type CountMetric, measureMetricCount } from "@swooper/mapgen-metrics";

import type { StandardMapCapture } from "../capture.js";

/** Hydrology model, navigable-river selection, and engine readback closure facts. */
export type StandardHydrologyMetrics = Readonly<{
  riverTiles: CountMetric;
  minorRiverTiles: CountMetric;
  majorRiverTiles: CountMetric;
  outletTiles: CountMetric;
  terminalOceanTiles: CountMetric | null;
  networkSummary: StandardMapCapture["model"]["riverNetworkSummary"];
  navigable: StandardMapCapture["projection"]["navigableRivers"] &
    StandardMapCapture["projection"]["riverReadback"];
}>;

/** Measures modeled rivers and projection/readback evidence without deciding product budgets. */
export function measureStandardHydrology(capture: StandardMapCapture): StandardHydrologyMetrics {
  const tileCount = capture.provenance.width * capture.provenance.height;
  let riverTiles = 0;
  let minorRiverTiles = 0;
  let majorRiverTiles = 0;
  let outletTiles = 0;
  let terminalOceanTiles = 0;

  for (let index = 0; index < tileCount; index += 1) {
    const riverClass = capture.model.riverClass[index];
    if (isAnyRiverClass(riverClass)) riverTiles += 1;
    if (isMinorRiverClass(riverClass)) minorRiverTiles += 1;
    if (isMajorRiverClass(riverClass)) majorRiverTiles += 1;
    if (capture.model.outletMask[index] === 1) outletTiles += 1;
    if (capture.model.terminalType?.[index] === 1) terminalOceanTiles += 1;
  }

  return Object.freeze({
    riverTiles: measureMetricCount(riverTiles, tileCount),
    minorRiverTiles: measureMetricCount(minorRiverTiles, tileCount),
    majorRiverTiles: measureMetricCount(majorRiverTiles, tileCount),
    outletTiles: measureMetricCount(outletTiles, tileCount),
    terminalOceanTiles:
      capture.model.terminalType === null
        ? null
        : measureMetricCount(terminalOceanTiles, tileCount),
    networkSummary: capture.model.riverNetworkSummary,
    navigable: Object.freeze({
      ...capture.projection.navigableRivers,
      ...capture.projection.riverReadback,
    }),
  });
}
