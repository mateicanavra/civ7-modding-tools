import { SHIPPED_GEOGRAPHY_TARGET } from "../../targets/geography.js";
import { STANDARD_INTEGRITY_TARGET } from "../../targets/integrity.js";
import {
  defineStandardMetricCohortStudy,
  requireNonEmptyMetricStudyValues,
} from "../define.js";
import {
  SHIPPED_STANDARD_CONFIGURATIONS,
  STANDARD_METRIC_PRESETS,
  standardProductMetricScenario,
} from "../scenarios.js";

const SHIPPED_GEOGRAPHY_SEEDS = [123, 1337, 1538316415, 1538316523] as const;

/** Proves every shipped Standard product produces nondegenerate Huge-map geography. */
export const SHIPPED_GEOGRAPHY_STUDY = defineStandardMetricCohortStudy(
  "shipped/geography",
  requireNonEmptyMetricStudyValues(
    SHIPPED_STANDARD_CONFIGURATIONS.flatMap(({ config }) =>
      SHIPPED_GEOGRAPHY_SEEDS.map((seed) =>
        standardProductMetricScenario(config, STANDARD_METRIC_PRESETS.huge, seed)
      )
    ),
    "shipped geography scenarios"
  ),
  [STANDARD_INTEGRITY_TARGET],
  [SHIPPED_GEOGRAPHY_TARGET]
);
