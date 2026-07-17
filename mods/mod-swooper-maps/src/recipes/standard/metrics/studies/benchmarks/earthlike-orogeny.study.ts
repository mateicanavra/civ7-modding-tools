import { STANDARD_INTEGRITY_TARGET } from "../../targets/integrity.js";
import { EARTHLIKE_OROGENY_TARGET } from "../../targets/relief.js";
import {
  defineStandardMetricCohortStudy,
  requireShippedStandardConfig,
  standardMetricScenariosForSeeds,
} from "../define.js";
import { STANDARD_METRIC_PRESETS } from "../scenarios.js";

/** Proves Earthlike Huge maps form long mountain systems with traversable interior structure. */
export const EARTHLIKE_OROGENY_STUDY = defineStandardMetricCohortStudy(
  "earthlike/orogeny",
  standardMetricScenariosForSeeds(
    requireShippedStandardConfig("swooper-earthlike"),
    STANDARD_METRIC_PRESETS.huge,
    [1018, 2024, 5050]
  ),
  [STANDARD_INTEGRITY_TARGET],
  [EARTHLIKE_OROGENY_TARGET]
);
