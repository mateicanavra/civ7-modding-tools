import { SHIPPED_GEOGRAPHY_TARGET } from "../../targets/geography.js";
import { STANDARD_INTEGRITY_TARGET } from "../../targets/integrity.js";
import {
  defineStandardMetricCohortStudy,
  requireNonEmptyMetricStudyValues,
  requireShippedStandardConfig,
} from "../define.js";
import {
  SHIPPED_STANDARD_CONFIGURATIONS,
  STANDARD_METRIC_PRESETS,
  standardMetricScenarioIdentity,
  standardProductMetricScenario,
} from "../scenarios.js";

const SHIPPED_GEOGRAPHY_SEEDS = [123, 1337, 1538316415, 1538316523] as const;

/** Qualifies core Earthlike geography on the existing four-seed Huge matrix. */
export const EARTHLIKE_GEOGRAPHY_COHORT_STUDY = defineStandardMetricCohortStudy(
  "earthlike/geography-cohort",
  requireNonEmptyMetricStudyValues(
    SHIPPED_GEOGRAPHY_SEEDS.map((mapSeed) =>
      standardProductMetricScenario(
        requireShippedStandardConfig("swooper-earthlike"),
        STANDARD_METRIC_PRESETS.huge,
        standardMetricScenarioIdentity(STANDARD_METRIC_PRESETS.huge, mapSeed, mapSeed)
      )
    ),
    "Earthlike geography scenarios"
  ),
  [STANDARD_INTEGRITY_TARGET],
  [SHIPPED_GEOGRAPHY_TARGET]
);

/** Opt-in configuration-stress cohort covering every shipped Standard product. */
export const SHIPPED_GEOGRAPHY_STUDY = defineStandardMetricCohortStudy(
  "shipped/geography",
  requireNonEmptyMetricStudyValues(
    SHIPPED_STANDARD_CONFIGURATIONS.flatMap(({ config }) =>
      SHIPPED_GEOGRAPHY_SEEDS.map((mapSeed) =>
        standardProductMetricScenario(
          config,
          STANDARD_METRIC_PRESETS.huge,
          standardMetricScenarioIdentity(STANDARD_METRIC_PRESETS.huge, mapSeed, mapSeed)
        )
      )
    ),
    "shipped geography scenarios"
  ),
  [STANDARD_INTEGRITY_TARGET],
  [SHIPPED_GEOGRAPHY_TARGET]
);
