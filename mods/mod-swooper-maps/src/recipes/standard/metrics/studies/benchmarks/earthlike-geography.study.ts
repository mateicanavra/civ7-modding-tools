import { EARTHLIKE_GEOGRAPHY_TARGET } from "../../targets/geography.js";
import { STANDARD_INTEGRITY_TARGET } from "../../targets/integrity.js";
import { defineStandardMetricSampleStudy, requireShippedStandardConfig } from "../define.js";
import { STANDARD_METRIC_PRESETS, standardProductMetricScenario } from "../scenarios.js";

/** Proves one representative Earthlike Standard map retains broad land, water, river, and biome coverage. */
export const EARTHLIKE_GEOGRAPHY_STUDY = defineStandardMetricSampleStudy(
  "earthlike/geography",
  standardProductMetricScenario(
    requireShippedStandardConfig("swooper-earthlike"),
    STANDARD_METRIC_PRESETS.standard,
    1337
  ),
  [STANDARD_INTEGRITY_TARGET, EARTHLIKE_GEOGRAPHY_TARGET]
);
