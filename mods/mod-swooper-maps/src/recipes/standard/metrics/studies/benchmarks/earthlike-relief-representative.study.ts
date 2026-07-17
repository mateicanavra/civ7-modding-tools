import { STANDARD_INTEGRITY_TARGET } from "../../targets/integrity.js";
import { EARTHLIKE_RELIEF_REPRESENTATIVE_TARGET } from "../../targets/relief.js";
import {
  defineStandardMetricSampleStudy,
  requireShippedStandardConfig,
} from "../define.js";
import { STANDARD_METRIC_PRESETS, standardProductMetricScenario } from "../scenarios.js";

/** Proves one representative Earthlike Huge map balances foothills, rough uplands, hills, and flats. */
export const EARTHLIKE_RELIEF_REPRESENTATIVE_STUDY = defineStandardMetricSampleStudy(
  "earthlike/relief-representative",
  standardProductMetricScenario(
    requireShippedStandardConfig("swooper-earthlike"),
    STANDARD_METRIC_PRESETS.huge,
    1018
  ),
  [STANDARD_INTEGRITY_TARGET, EARTHLIKE_RELIEF_REPRESENTATIVE_TARGET]
);
