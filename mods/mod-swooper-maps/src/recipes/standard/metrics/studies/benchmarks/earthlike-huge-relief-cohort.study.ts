import { STANDARD_INTEGRITY_TARGET } from "../../targets/integrity.js";
import { EARTHLIKE_HUGE_RELIEF_COHORT_TARGET } from "../../targets/relief.js";
import {
  defineStandardMetricCohortStudy,
  requireShippedStandardConfig,
  standardMetricScenariosForSeeds,
} from "../define.js";
import { STANDARD_METRIC_PRESETS } from "../scenarios.js";

/** Proves useful, broken Earthlike relief persists across representative Huge seed rolls. */
export const EARTHLIKE_HUGE_RELIEF_COHORT_STUDY = defineStandardMetricCohortStudy(
  "earthlike/huge-relief-cohort",
  standardMetricScenariosForSeeds(
    requireShippedStandardConfig("swooper-earthlike"),
    STANDARD_METRIC_PRESETS.huge,
    [1, 42, 99, 7777]
  ),
  [STANDARD_INTEGRITY_TARGET],
  [EARTHLIKE_HUGE_RELIEF_COHORT_TARGET]
);
