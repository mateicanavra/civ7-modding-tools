import {
  EARTHLIKE_PRESSURE_STRUCTURE_TARGET,
  EARTHLIKE_WIND_STRUCTURE_TARGET,
} from "../../targets/hydrology.js";
import { STANDARD_INTEGRITY_TARGET } from "../../targets/integrity.js";
import {
  defineStandardMetricCohortStudy,
  requireShippedStandardConfig,
  standardMetricScenariosForSeedPairs,
} from "../define.js";
import { STANDARD_METRIC_PRESETS } from "../scenarios.js";

const REPRESENTATIVE_WIND_STRUCTURE_SEED_PAIRS = [
  [1018, 1018],
  [1, 1],
  [42, 42],
] as const;

/** Proves broad Earthlike wind structure across representative Standard maps. */
export const EARTHLIKE_WIND_STRUCTURE_STUDY = defineStandardMetricCohortStudy(
  "earthlike/wind-structure",
  standardMetricScenariosForSeedPairs(
    requireShippedStandardConfig("swooper-earthlike"),
    STANDARD_METRIC_PRESETS.standard,
    REPRESENTATIVE_WIND_STRUCTURE_SEED_PAIRS
  ),
  [STANDARD_INTEGRITY_TARGET],
  [EARTHLIKE_WIND_STRUCTURE_TARGET, EARTHLIKE_PRESSURE_STRUCTURE_TARGET]
);

/** Proves the same Earthlike wind posture on the shipped Latest Juicy live-feel oracle. */
export const LATEST_JUICY_WIND_STRUCTURE_STUDY = defineStandardMetricCohortStudy(
  "latest-juicy/wind-structure",
  standardMetricScenariosForSeedPairs(
    requireShippedStandardConfig("latest-juicy"),
    STANDARD_METRIC_PRESETS.standard,
    REPRESENTATIVE_WIND_STRUCTURE_SEED_PAIRS
  ),
  [STANDARD_INTEGRITY_TARGET],
  [EARTHLIKE_WIND_STRUCTURE_TARGET, EARTHLIKE_PRESSURE_STRUCTURE_TARGET]
);
