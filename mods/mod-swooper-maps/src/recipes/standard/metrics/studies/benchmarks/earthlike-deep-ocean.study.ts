import { EARTHLIKE_DEEP_OCEAN_TARGET } from "../../targets/geography.js";
import { STANDARD_INTEGRITY_TARGET } from "../../targets/integrity.js";
import {
  defineStandardMetricCohortStudy,
  requireNonEmptyMetricStudyValues,
  requireShippedStandardConfig,
} from "../define.js";
import { STANDARD_METRIC_PRESETS, standardProductMetricScenario } from "../scenarios.js";

const EARTHLIKE = requireShippedStandardConfig("swooper-earthlike");

const deepOceanScenarios = [
  STANDARD_METRIC_PRESETS.tiny,
  STANDARD_METRIC_PRESETS.small,
  STANDARD_METRIC_PRESETS.standard,
  STANDARD_METRIC_PRESETS.large,
  STANDARD_METRIC_PRESETS.huge,
].map((preset) => standardProductMetricScenario(EARTHLIKE, preset, 1337));
for (const seed of [7, 42]) {
  deepOceanScenarios.push(
    standardProductMetricScenario(EARTHLIKE, STANDARD_METRIC_PRESETS.standard, seed),
    standardProductMetricScenario(EARTHLIKE, STANDARD_METRIC_PRESETS.huge, seed)
  );
}

/** Proves Earthlike water stays deep-ocean dominant across Civ7 sizes and extra seed rolls. */
export const EARTHLIKE_DEEP_OCEAN_STUDY = defineStandardMetricCohortStudy(
  "earthlike/deep-ocean",
  requireNonEmptyMetricStudyValues(deepOceanScenarios, "Earthlike deep-ocean scenarios"),
  [STANDARD_INTEGRITY_TARGET],
  [EARTHLIKE_DEEP_OCEAN_TARGET]
);
