import { SHIPPED_IDENTITY_TARGETS } from "../../targets/identities.js";
import { STANDARD_INTEGRITY_TARGET } from "../../targets/integrity.js";
import { defineStandardMetricSampleStudy, requireNonEmptyMetricStudyValues } from "../define.js";
import {
  SHIPPED_STANDARD_CONFIGURATIONS,
  STANDARD_METRIC_PRESETS,
  standardProductMetricScenario,
} from "../scenarios.js";

/** Proves each shipped Standard configuration retains its identity on one stable Huge map. */
export const SHIPPED_IDENTITY_STUDIES = requireNonEmptyMetricStudyValues(
  SHIPPED_STANDARD_CONFIGURATIONS.map(({ id, config }) =>
    defineStandardMetricSampleStudy(
      `shipped/identity/${id}`,
      standardProductMetricScenario(config, STANDARD_METRIC_PRESETS.huge, 1018),
      [STANDARD_INTEGRITY_TARGET, SHIPPED_IDENTITY_TARGETS[id]]
    )
  ),
  "shipped identity studies"
);
