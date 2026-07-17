import type { MetricTarget } from "@swooper/mapgen-metrics";
import type { NonEmptyTuple } from "type-fest";

import type { StandardMapMetricCohort, StandardMapProductSample } from "../sample.js";
import type { StandardPresetMetricScenario } from "../scenario.js";
import {
  EARTHLIKE_COLD_REEF_TARGET,
  EARTHLIKE_ECOLOGY_TARGET,
  EARTHLIKE_FLOODPLAIN_TARGET,
} from "../targets/ecology.js";
import {
  EARTHLIKE_DEEP_OCEAN_TARGET,
  EARTHLIKE_GEOGRAPHY_TARGET,
  SHIPPED_GEOGRAPHY_TARGET,
} from "../targets/geography.js";
import {
  DESERT_MOUNTAINS_ARID_CLIMATE_TARGET,
  SHIPPED_IDENTITY_TARGETS,
} from "../targets/identities.js";
import { STANDARD_INTEGRITY_TARGET } from "../targets/integrity.js";
import { STANDARD_PLACEMENT_TARGET } from "../targets/placement.js";
import {
  EARTHLIKE_HUGE_RELIEF_COHORT_TARGET,
  EARTHLIKE_OROGENY_TARGET,
  EARTHLIKE_RELIEF_REPRESENTATIVE_TARGET,
} from "../targets/relief.js";
import type {
  StandardMetricCase,
  StandardMetricCohortCase,
  StandardMetricSampleCase,
} from "./model.js";
import {
  SHIPPED_STANDARD_CONFIGURATIONS,
  STANDARD_METRIC_PRESETS,
  standardProductMetricScenario,
} from "./scenarios.js";

const EARTHLIKE = requireShippedConfig("swooper-earthlike");
const REPRESENTATIVE_SEEDS = [1018, 1, 2, 3, 42, 99, 1234, 7777] as const;

const shippedIdentityCases = SHIPPED_STANDARD_CONFIGURATIONS.map(({ id, config }) =>
  sampleCase(
    `shipped/identity/${id}`,
    standardProductMetricScenario(config, STANDARD_METRIC_PRESETS.huge, 1018),
    [STANDARD_INTEGRITY_TARGET, SHIPPED_IDENTITY_TARGETS[id]]
  )
);

const shippedGeographyScenarioEntries = SHIPPED_STANDARD_CONFIGURATIONS.flatMap(({ id, config }) =>
  [123, 1337, 1538316415, 1538316523].map((seed) => ({
    configurationId: id,
    scenario: standardProductMetricScenario(config, STANDARD_METRIC_PRESETS.huge, seed),
  }))
);
const shippedGeographyScenarios = shippedGeographyScenarioEntries.map(({ scenario }) => scenario);
const desertMountainsClimateCases = shippedGeographyScenarioEntries
  .filter(({ configurationId }) => configurationId === "swooper-desert-mountains")
  .map(({ scenario }) =>
    sampleCase(`shipped/arid-climate/${scenario.preset.id}/seed-${scenario.seed}`, scenario, [
      DESERT_MOUNTAINS_ARID_CLIMATE_TARGET,
    ])
  );

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

/**
 * Closed Standard product-metrics catalog built only from real Civ7 map-size presets.
 * Shared scenario construction lets overlapping cases retain one semantic identity and capture.
 */
export const STANDARD_METRIC_CASES: NonEmptyTuple<StandardMetricCase> = Object.freeze([
  ...asNonEmpty(shippedIdentityCases, "shipped identity cases"),
  ...asNonEmpty(desertMountainsClimateCases, "Desert Mountains climate cases"),
  cohortCase(
    "shipped/geography",
    asNonEmpty(shippedGeographyScenarios, "shipped geography scenarios"),
    [STANDARD_INTEGRITY_TARGET],
    [SHIPPED_GEOGRAPHY_TARGET]
  ),
  sampleCase(
    "earthlike/geography",
    standardProductMetricScenario(EARTHLIKE, STANDARD_METRIC_PRESETS.standard, 1337),
    [STANDARD_INTEGRITY_TARGET, EARTHLIKE_GEOGRAPHY_TARGET]
  ),
  cohortCase(
    "earthlike/deep-ocean",
    asNonEmpty(deepOceanScenarios, "Earthlike deep-ocean scenarios"),
    [STANDARD_INTEGRITY_TARGET],
    [EARTHLIKE_DEEP_OCEAN_TARGET]
  ),
  cohortCase(
    "earthlike/ecology",
    scenariosForSeeds(STANDARD_METRIC_PRESETS.standard, REPRESENTATIVE_SEEDS),
    [STANDARD_INTEGRITY_TARGET],
    [EARTHLIKE_ECOLOGY_TARGET]
  ),
  cohortCase(
    "earthlike/cold-reef",
    scenariosForSeeds(STANDARD_METRIC_PRESETS.huge, REPRESENTATIVE_SEEDS),
    [STANDARD_INTEGRITY_TARGET],
    [EARTHLIKE_COLD_REEF_TARGET]
  ),
  sampleCase(
    "earthlike/floodplain",
    standardProductMetricScenario(EARTHLIKE, STANDARD_METRIC_PRESETS.standard, 1018),
    [STANDARD_INTEGRITY_TARGET, EARTHLIKE_FLOODPLAIN_TARGET]
  ),
  cohortCase(
    "earthlike/orogeny",
    scenariosForSeeds(STANDARD_METRIC_PRESETS.huge, [1018, 2024, 5050]),
    [STANDARD_INTEGRITY_TARGET],
    [EARTHLIKE_OROGENY_TARGET]
  ),
  sampleCase(
    "earthlike/relief-representative",
    standardProductMetricScenario(EARTHLIKE, STANDARD_METRIC_PRESETS.huge, 1018),
    [STANDARD_INTEGRITY_TARGET, EARTHLIKE_RELIEF_REPRESENTATIVE_TARGET]
  ),
  cohortCase(
    "earthlike/huge-relief-cohort",
    scenariosForSeeds(STANDARD_METRIC_PRESETS.huge, [1, 42, 99, 7777]),
    [STANDARD_INTEGRITY_TARGET],
    [EARTHLIKE_HUGE_RELIEF_COHORT_TARGET]
  ),
  cohortCase(
    "earthlike/placement",
    scenariosForSeeds(STANDARD_METRIC_PRESETS.standard, [1337, 4242, 9001]),
    [STANDARD_INTEGRITY_TARGET],
    [STANDARD_PLACEMENT_TARGET]
  ),
] satisfies NonEmptyTuple<StandardMetricCase>);

function sampleCase(
  id: string,
  scenario: StandardPresetMetricScenario,
  targets: NonEmptyTuple<MetricTarget<StandardMapProductSample>>
): StandardMetricSampleCase {
  return Object.freeze({ kind: "sample", id, scenario, targets: Object.freeze(targets) });
}

function cohortCase(
  id: string,
  scenarios: NonEmptyTuple<StandardPresetMetricScenario>,
  sampleTargets: NonEmptyTuple<MetricTarget<StandardMapProductSample>>,
  cohortTargets: NonEmptyTuple<MetricTarget<StandardMapMetricCohort>>
): StandardMetricCohortCase {
  return Object.freeze({
    kind: "cohort",
    id,
    scenarios: Object.freeze(scenarios),
    sampleTargets: Object.freeze(sampleTargets),
    cohortTargets: Object.freeze(cohortTargets),
  });
}

function scenariosForSeeds(
  preset: StandardPresetMetricScenario["preset"],
  seeds: readonly number[]
): NonEmptyTuple<StandardPresetMetricScenario> {
  return asNonEmpty(
    seeds.map((seed) => standardProductMetricScenario(EARTHLIKE, preset, seed)),
    `${preset.id} seed scenarios`
  );
}

function asNonEmpty<T>(values: readonly T[], label: string): NonEmptyTuple<T> {
  if (values.length === 0) throw new Error(`Standard metrics requires at least one ${label}.`);
  return values as NonEmptyTuple<T>;
}

function requireShippedConfig(configurationId: string) {
  const entry = SHIPPED_STANDARD_CONFIGURATIONS.find(({ id }) => id === configurationId);
  if (!entry) throw new Error(`Missing shipped Standard config ${configurationId}.`);
  return entry.config;
}
