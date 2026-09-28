import { EARTHLIKE_CLIMATE_BIOME_STRUCTURE_TARGET } from "../../targets/ecology.js";
import { EARTHLIKE_CLIMATE_STRUCTURE_TARGET } from "../../targets/hydrology.js";
import { STANDARD_INTEGRITY_TARGET } from "../../targets/integrity.js";
import {
  defineStandardMetricCohortStudy,
  requireShippedStandardConfig,
  standardMetricScenariosForSeedPairs,
} from "../define.js";
import {
  STANDARD_METRIC_PRESETS,
  standardMetricScenarioIdentity,
  standardProductMetricScenario,
} from "../scenarios.js";

const earthlike = requireShippedStandardConfig("swooper-earthlike");

/** Holds the reported Huge map and three Standard rolls to independent climate structure bounds. */
export const EARTHLIKE_CLIMATE_STRUCTURE_STUDY = defineStandardMetricCohortStudy(
  "earthlike/climate-structure",
  [
    standardProductMetricScenario(
      earthlike,
      STANDARD_METRIC_PRESETS.huge,
      standardMetricScenarioIdentity(STANDARD_METRIC_PRESETS.huge, 1018, 1018)
    ),
    ...standardMetricScenariosForSeedPairs(earthlike, STANDARD_METRIC_PRESETS.standard, [
      [1018, 1018],
      [1, 1],
      [42, 42],
    ]),
  ],
  [STANDARD_INTEGRITY_TARGET],
  [EARTHLIKE_CLIMATE_STRUCTURE_TARGET, EARTHLIKE_CLIMATE_BIOME_STRUCTURE_TARGET]
);
