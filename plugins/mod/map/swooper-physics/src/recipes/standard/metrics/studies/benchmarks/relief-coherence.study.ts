import { STANDARD_INTEGRITY_TARGET } from "../../targets/integrity.js";
import {
  RELIEF_COHERENCE_COHORT_IDENTITY,
  RELIEF_COHERENCE_COHORT_TARGET,
} from "../../targets/relief-coherence.js";
import {
  defineStandardMetricCohortStudy,
  requireNonEmptyMetricStudyValues,
  requireShippedStandardConfig,
} from "../define.js";
import {
  STANDARD_METRIC_PRESETS,
  standardMetricScenarioIdentity,
  standardProductMetricScenario,
} from "../scenarios.js";

/** Neutral twelve-map comparison; only cohort coverage and evidence accounting are gated. */
export const RELIEF_COHERENCE_STUDY = defineStandardMetricCohortStudy(
  "shipped/relief-coherence",
  requireNonEmptyMetricStudyValues(
    RELIEF_COHERENCE_COHORT_IDENTITY.configurationIds.flatMap((configurationId) =>
      [STANDARD_METRIC_PRESETS.standard, STANDARD_METRIC_PRESETS.huge].flatMap((preset) =>
        RELIEF_COHERENCE_COHORT_IDENTITY.seeds.map((seed) =>
          standardProductMetricScenario(
            requireShippedStandardConfig(configurationId),
            preset,
            standardMetricScenarioIdentity(preset, seed, seed)
          )
        )
      )
    ),
    "matched relief-coherence scenarios"
  ),
  [STANDARD_INTEGRITY_TARGET],
  [RELIEF_COHERENCE_COHORT_TARGET]
);
