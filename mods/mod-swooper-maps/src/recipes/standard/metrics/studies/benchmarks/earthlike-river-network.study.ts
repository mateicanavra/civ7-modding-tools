import { EARTHLIKE_RIVER_NETWORK_TARGET } from "../../targets/hydrology.js";
import { STANDARD_INTEGRITY_TARGET } from "../../targets/integrity.js";
import {
  defineStandardMetricCohortStudy,
  requireShippedStandardConfig,
  standardMetricScenariosForSeeds,
} from "../define.js";
import { STANDARD_METRIC_PRESETS } from "../scenarios.js";

const REPRESENTATIVE_RIVER_NETWORK_SEEDS = [1018, 1, 42] as const;

/** Proves Earthlike river hierarchy and flow classification across representative Standard maps. */
export const EARTHLIKE_RIVER_NETWORK_STUDY = defineStandardMetricCohortStudy(
  "earthlike/river-network",
  standardMetricScenariosForSeeds(
    requireShippedStandardConfig("swooper-earthlike"),
    STANDARD_METRIC_PRESETS.standard,
    REPRESENTATIVE_RIVER_NETWORK_SEEDS
  ),
  [STANDARD_INTEGRITY_TARGET],
  [EARTHLIKE_RIVER_NETWORK_TARGET]
);
