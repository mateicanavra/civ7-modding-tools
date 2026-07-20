import type { MetricTarget } from "@swooper/mapgen-metrics";
import type { NonEmptyTuple } from "type-fest";

import type { StandardMapMetricCohort, StandardMapProductSample } from "../sample.js";
import type { StandardPresetMetricScenario } from "../scenario.js";
import type { StandardMetricCohortStudy, StandardMetricSampleStudy } from "./model.js";
import {
  SHIPPED_STANDARD_CONFIGURATIONS,
  type ShippedStandardConfigurationId,
  standardProductMetricScenario,
} from "./scenarios.js";

/** Defines one immutable single-map study without weakening its nonempty target contract. */
export function defineStandardMetricSampleStudy(
  id: string,
  scenario: StandardPresetMetricScenario,
  targets: NonEmptyTuple<MetricTarget<StandardMapProductSample>>
): StandardMetricSampleStudy {
  return Object.freeze({ kind: "sample", id, scenario, targets: Object.freeze(targets) });
}

/** Defines one immutable cohort study whose sample and population targets are both explicit. */
export function defineStandardMetricCohortStudy(
  id: string,
  scenarios: NonEmptyTuple<StandardPresetMetricScenario>,
  sampleTargets: NonEmptyTuple<MetricTarget<StandardMapProductSample>>,
  cohortTargets: NonEmptyTuple<MetricTarget<StandardMapMetricCohort>>
): StandardMetricCohortStudy {
  return Object.freeze({
    kind: "cohort",
    id,
    scenarios: Object.freeze(scenarios),
    sampleTargets: Object.freeze(sampleTargets),
    cohortTargets: Object.freeze(cohortTargets),
  });
}

/** Admits a runtime-built tuple only when the logical study actually has an observation. */
export function requireNonEmptyMetricStudyValues<T>(
  values: readonly T[],
  label: string
): NonEmptyTuple<T> {
  if (values.length === 0) throw new Error(`Standard metrics requires at least one ${label}.`);
  return values as NonEmptyTuple<T>;
}

/** Builds a stable scenario cohort for one shipped config and one named Civ7 preset. */
export function standardMetricScenariosForSeeds(
  config: Parameters<typeof standardProductMetricScenario>[0],
  preset: StandardPresetMetricScenario["preset"],
  seeds: readonly number[]
): NonEmptyTuple<StandardPresetMetricScenario> {
  return requireNonEmptyMetricStudyValues(
    seeds.map((seed) => standardProductMetricScenario(config, preset, seed)),
    `${preset.id} seed scenarios`
  );
}

/** Resolves one admitted shipped configuration or fails before a study can be declared. */
export function requireShippedStandardConfig(configurationId: ShippedStandardConfigurationId) {
  const entry = SHIPPED_STANDARD_CONFIGURATIONS.find(({ id }) => id === configurationId);
  if (!entry) throw new Error(`Missing shipped Standard config ${configurationId}.`);
  return entry.config;
}
