import { DESERT_MOUNTAINS_ARID_CLIMATE_TARGET } from "../../targets/identities.js";
import {
  defineStandardMetricSampleStudy,
  requireNonEmptyMetricStudyValues,
  requireShippedStandardConfig,
} from "../define.js";
import { STANDARD_METRIC_PRESETS, standardProductMetricScenario } from "../scenarios.js";

const DESERT_MOUNTAINS = requireShippedStandardConfig("swooper-desert-mountains");
const ARID_CLIMATE_SEEDS = [123, 1337, 1538316415, 1538316523] as const;

/** Proves Desert Mountains stays dry and ecologically distinct across four stable Huge seeds. */
export const SHIPPED_ARID_CLIMATE_STUDIES = requireNonEmptyMetricStudyValues(
  ARID_CLIMATE_SEEDS.map((seed) => {
    const scenario = standardProductMetricScenario(
      DESERT_MOUNTAINS,
      STANDARD_METRIC_PRESETS.huge,
      seed
    );
    return defineStandardMetricSampleStudy(
      `shipped/arid-climate/${scenario.preset.id}/seed-${scenario.seed}`,
      scenario,
      [DESERT_MOUNTAINS_ARID_CLIMATE_TARGET]
    );
  }),
  "Desert Mountains climate studies"
);
