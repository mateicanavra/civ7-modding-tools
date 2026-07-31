import { STANDARD_INTEGRITY_TARGET } from "../../targets/integrity.js";
import {
  MOUNTAIN_DRAMA_COHORT_IDENTITY,
  MOUNTAIN_DRAMA_ELEVATION_TARGET,
} from "../../targets/relief.js";
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

const MOUNTAIN_DRAMA_CONFIGURATIONS = [
  {
    config: requireShippedStandardConfig(MOUNTAIN_DRAMA_COHORT_IDENTITY.referenceConfigurationId),
    plateActivity: 0.5,
  },
  ...MOUNTAIN_DRAMA_COHORT_IDENTITY.mountainConfigurationIds.map((configurationId) => ({
    config: requireShippedStandardConfig(configurationId),
    plateActivity: 0.85,
  })),
];

for (const { config, plateActivity } of MOUNTAIN_DRAMA_CONFIGURATIONS) {
  const observed = config.config["foundation-tectonics"].knobs.plateActivity;
  if (observed !== plateActivity) {
    throw new Error(
      `Mountain drama requires ${config.id} plateActivity=${plateActivity}; received ${observed}.`
    );
  }
}

/** Compares retained mountain products with Earthlike on identical Huge-map seeds. */
export const MOUNTAIN_DRAMA_STUDY = defineStandardMetricCohortStudy(
  "shipped/mountain-drama",
  requireNonEmptyMetricStudyValues(
    MOUNTAIN_DRAMA_CONFIGURATIONS.flatMap(({ config }) =>
      MOUNTAIN_DRAMA_COHORT_IDENTITY.seeds.map((seed) =>
        standardProductMetricScenario(
          config,
          STANDARD_METRIC_PRESETS.huge,
          standardMetricScenarioIdentity(STANDARD_METRIC_PRESETS.huge, seed, seed)
        )
      )
    ),
    "matched mountain-drama scenarios"
  ),
  [STANDARD_INTEGRITY_TARGET],
  [MOUNTAIN_DRAMA_ELEVATION_TARGET]
);
