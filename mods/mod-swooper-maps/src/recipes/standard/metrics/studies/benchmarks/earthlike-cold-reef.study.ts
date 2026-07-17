import { EARTHLIKE_COLD_REEF_TARGET } from "../../targets/ecology.js";
import { STANDARD_INTEGRITY_TARGET } from "../../targets/integrity.js";
import {
  defineStandardMetricCohortStudy,
  requireShippedStandardConfig,
  standardMetricScenariosForSeeds,
} from "../define.js";
import { STANDARD_METRIC_PRESETS } from "../scenarios.js";

const REPRESENTATIVE_COLD_REEF_SEEDS = [1018, 1, 2, 3, 42, 99, 1234, 7777] as const;

/** Proves Earthlike Huge maps retain cold-reef accents without carpeting coastal water. */
export const EARTHLIKE_COLD_REEF_STUDY = defineStandardMetricCohortStudy(
  "earthlike/cold-reef",
  standardMetricScenariosForSeeds(
    requireShippedStandardConfig("swooper-earthlike"),
    STANDARD_METRIC_PRESETS.huge,
    REPRESENTATIVE_COLD_REEF_SEEDS
  ),
  [STANDARD_INTEGRITY_TARGET],
  [EARTHLIKE_COLD_REEF_TARGET]
);
