import {
  isAnyRiverClass,
  isMajorRiverClass,
  isMinorRiverClass,
} from "../../../../../domain/hydrology/modules/hydrography/model/policy/river-class.js";
import { type CountMetric, measureMetricCount } from "@swooper/mapgen-metrics";

import type { StandardMapCapture } from "../../capture.js";
import { BASIN_TERMINAL } from "../../../../../domain/hydrology/modules/hydrography/model/atoms/basin-network.schema.js";
import { measureStandardBasinNetwork, type StandardBasinNetworkMetrics } from "./basin-network.js";
import { measureStandardNetworkCoherence } from "./network-coherence.js";
import {
  measureStandardClimateStructure,
  type StandardClimateStructureMetrics,
} from "./climate-structure.js";
import {
  measureStandardPressureStructure,
  type StandardPressureStructureMetrics,
} from "./pressure-structure.js";
import {
  measureStandardWindStructure,
  type StandardWindStructureMetrics,
} from "./wind-structure.js";

/** Hydrology model, atmospheric structure, navigable-river, and engine readback facts. */
export type StandardHydrologyMetrics = Readonly<{
  riverTiles: CountMetric;
  minorRiverTiles: CountMetric;
  majorRiverTiles: CountMetric;
  outletTiles: CountMetric;
  terminalOceanTiles: CountMetric;
  model: StandardMapCapture["model"]["physicalHydrology"]["model"];
  basinNetwork: StandardBasinNetworkMetrics | null;
  networkCoherence: ReturnType<typeof measureStandardNetworkCoherence>;
  networkSummary: StandardMapCapture["model"]["riverNetworkSummary"];
  navigable: StandardMapCapture["projection"]["navigableRivers"] &
    StandardMapCapture["projection"]["riverReadback"];
  windStructure: StandardWindStructureMetrics;
  pressureStructure: StandardPressureStructureMetrics;
  climateStructure: StandardClimateStructureMetrics;
}>;

/** Measures Hydrology structure and projection/readback evidence without deciding product budgets. */
export function measureStandardHydrology(capture: StandardMapCapture): StandardHydrologyMetrics {
  const physical = capture.model.physicalHydrology;
  const tileCount = capture.provenance.width * capture.provenance.height;
  let riverTiles = 0;
  let minorRiverTiles = 0;
  let majorRiverTiles = 0;
  let outletTiles = physical.model === "certified-sill-spill" ? physical.marineExits.length + physical.boundaryExits.length : 0;
  let terminalOceanTiles = 0;

  for (let index = 0; index < tileCount; index += 1) {
    const riverClass = capture.model.riverClass[index];
    if (isAnyRiverClass(riverClass)) riverTiles += 1;
    if (isMinorRiverClass(riverClass)) minorRiverTiles += 1;
    if (isMajorRiverClass(riverClass)) majorRiverTiles += 1;
    if (physical.model === "legacy-sink-budget" && physical.outletMask[index] === 1)
      outletTiles += 1;
    if (capture.model.terminalType[index] === BASIN_TERMINAL.marine) terminalOceanTiles += 1;
  }

  return Object.freeze({
    model: physical.model,
    basinNetwork: measureStandardBasinNetwork(capture),
    networkCoherence: measureStandardNetworkCoherence(capture),
    riverTiles: measureMetricCount(riverTiles, tileCount),
    minorRiverTiles: measureMetricCount(minorRiverTiles, tileCount),
    majorRiverTiles: measureMetricCount(majorRiverTiles, tileCount),
    outletTiles: measureMetricCount(outletTiles, tileCount),
    terminalOceanTiles: measureMetricCount(terminalOceanTiles, tileCount),
    networkSummary: capture.model.riverNetworkSummary,
    navigable: Object.freeze({
      ...capture.projection.navigableRivers,
      ...capture.projection.riverReadback,
    }),
    windStructure: measureStandardWindStructure(capture),
    pressureStructure: measureStandardPressureStructure(capture),
    climateStructure: measureStandardClimateStructure(capture),
  });
}
