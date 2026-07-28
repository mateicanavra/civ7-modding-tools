import { EARTHLIKE_ECOLOGY_TARGET } from "../../targets/ecology.js";
import { STANDARD_INTEGRITY_TARGET } from "../../targets/integrity.js";
import {
  defineStandardMetricCohortStudy,
  requireShippedStandardConfig,
  standardMetricScenariosForSeedPairs,
} from "../define.js";
import { STANDARD_METRIC_PRESETS } from "../scenarios.js";

const REPRESENTATIVE_ECOLOGY_SEED_PAIRS = [
  [1018, 1018],
  [1, 1],
  [2, 2],
  [3, 3],
  [42, 42],
  [99, 99],
  [1234, 1234],
  [7777, 7777],
] as const;

/** Proves Earthlike vegetation variety and biome balance across representative Standard seeds. */
export const EARTHLIKE_ECOLOGY_STUDY = defineStandardMetricCohortStudy(
  "earthlike/ecology",
  standardMetricScenariosForSeedPairs(
    requireShippedStandardConfig("swooper-earthlike"),
    STANDARD_METRIC_PRESETS.standard,
    REPRESENTATIVE_ECOLOGY_SEED_PAIRS
  ),
  [STANDARD_INTEGRITY_TARGET],
  [EARTHLIKE_ECOLOGY_TARGET]
);
