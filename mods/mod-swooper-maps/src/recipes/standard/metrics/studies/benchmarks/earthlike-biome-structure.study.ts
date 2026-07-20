import { EARTHLIKE_BIOME_STRUCTURE_TARGET } from "../../targets/ecology.js";
import { STANDARD_INTEGRITY_TARGET } from "../../targets/integrity.js";
import { defineStandardMetricSampleStudy, requireShippedStandardConfig } from "../define.js";
import { STANDARD_METRIC_PRESETS, standardProductMetricScenario } from "../scenarios.js";

/** Proves one representative Earthlike Huge map avoids biome stripes and latitude cutoffs. */
export const EARTHLIKE_BIOME_STRUCTURE_STUDY = defineStandardMetricSampleStudy(
  "earthlike/biome-structure",
  standardProductMetricScenario(
    requireShippedStandardConfig("swooper-earthlike"),
    STANDARD_METRIC_PRESETS.huge,
    1337
  ),
  [STANDARD_INTEGRITY_TARGET, EARTHLIKE_BIOME_STRUCTURE_TARGET]
);
