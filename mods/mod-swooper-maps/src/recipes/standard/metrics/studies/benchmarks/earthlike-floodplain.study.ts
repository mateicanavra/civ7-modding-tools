import { EARTHLIKE_FLOODPLAIN_TARGET } from "../../targets/ecology.js";
import { STANDARD_INTEGRITY_TARGET } from "../../targets/integrity.js";
import { defineStandardMetricSampleStudy, requireShippedStandardConfig } from "../define.js";
import { STANDARD_METRIC_PRESETS, standardProductMetricScenario } from "../scenarios.js";

/** Proves one representative Earthlike Standard map attempts floodplains without soft rejection. */
export const EARTHLIKE_FLOODPLAIN_STUDY = defineStandardMetricSampleStudy(
  "earthlike/floodplain",
  standardProductMetricScenario(
    requireShippedStandardConfig("swooper-earthlike"),
    STANDARD_METRIC_PRESETS.standard,
    1018
  ),
  [STANDARD_INTEGRITY_TARGET, EARTHLIKE_FLOODPLAIN_TARGET]
);
