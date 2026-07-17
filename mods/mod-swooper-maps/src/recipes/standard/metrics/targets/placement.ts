import type { CountMetric, MetricTarget } from "@swooper/mapgen-metrics";

import type { StandardMapMetricCohort } from "../sample.js";
import { equalTo } from "./support.js";

/**
 * Earthlike placement budgets evaluated across twenty stable Standard-preset seeds.
 * Standard integrity owns structural seating and evidence closure; this target owns Earthlike's
 * modeled/headless freshwater, fertility, fairness, fallback, climate, and resource-support behavior.
 */
export const EARTHLIKE_PLACEMENT_TARGET = {
  id: "swooper-earthlike/placement",
  description:
    "Earthlike starts retain modeled/headless freshwater opportunity, fertility, regional seating, resource support, and climate-comfort budgets across stable seeds.",
  expectations: [
    equalTo<StandardMapMetricCohort>(
      "freshwater-access-share",
      "At least 80% of starts have a modeled river or observed headless lake on or adjacent to their tile.",
      (samples) =>
        cohortShareSatisfies(
          samples,
          (sample) => sample.metrics.placement.freshwaterAccess,
          (share) => share >= 0.8
        ),
      true
    ),
    equalTo<StandardMapMetricCohort>(
      "fertility-advantage",
      "Every scenario's radius-two start fertility mean is at least 1.05 times its land mean.",
      (samples) =>
        samples.every(({ metrics }) => {
          const advantage = metrics.placement.startFertilityAdvantage;
          return advantage !== null && advantage >= 1.05;
        }),
      true
    ),
    equalTo<StandardMapMetricCohort>(
      "worst-pair-fairness-gap",
      "Every cohort map keeps its published 0..1 start-score gap at or below 0.3.",
      (samples) =>
        samples.every(({ metrics }) => {
          const gap = metrics.placement.worstPairScoreGap;
          return gap !== null && gap <= 0.3;
        }),
      true
    ),
    equalTo<StandardMapMetricCohort>(
      "non-regional-fallback-share",
      "Non-regional assignment rungs account for at most 5% of seated starts across the cohort.",
      (samples) =>
        cohortShareSatisfies(
          samples,
          (sample) => sample.metrics.placement.fallbackAssignments,
          (share) => share <= 0.05
        ),
      true
    ),
    equalTo<StandardMapMetricCohort>(
      "landmass-modeled-land-share",
      "No landmass with less than one quarter of modeled land seats half or more of the players.",
      (samples) =>
        samples.every((sample) =>
          sample.metrics.placement.homelandDistribution.landmasses.every(
            (row) =>
              row.startShare !== null &&
              row.landShare !== null &&
              (row.startShare < 0.5 || row.landShare >= 0.25)
          )
        ),
      true
    ),
    equalTo<StandardMapMetricCohort>(
      "global-start-dispersion",
      "Mean nearest-neighbor start spacing remains at least 85% of even dispersion over modeled land.",
      (samples) =>
        cohortMeanSatisfies(
          samples.map(
            (sample) => sample.metrics.placement.homelandDistribution.globalSpread?.index ?? null
          ),
          (mean) => mean >= 0.85
        ),
      true
    ),
    equalTo<StandardMapMetricCohort>(
      "regional-start-dispersion",
      "Every homeland with multiple starts retains at least 40% of even dispersion over its modeled land.",
      (samples) =>
        samples.every((sample) =>
          sample.metrics.placement.homelandDistribution.regionalSpread.every(
            ({ spread }) => spread === null || spread.index >= 0.4
          )
        ),
      true
    ),
    equalTo<StandardMapMetricCohort>(
      "region-relaxation-share",
      "Unique recorded homeland-region relaxations remain at or below five percent of seated starts.",
      (samples) =>
        cohortShareSatisfies(
          samples,
          (sample) => sample.metrics.placement.regionRelaxations,
          (share) => share <= 0.05
        ),
      true
    ),
    equalTo<StandardMapMetricCohort>(
      "climate-extreme-start-share",
      "At most 10% of starts occupy the driest or outer-temperature land deciles.",
      (samples) =>
        cohortShareSatisfies(
          samples,
          (sample) => sample.metrics.placement.climateExtremeStarts,
          (share) => share <= 0.1
        ),
      true
    ),
    equalTo<StandardMapMetricCohort>(
      "start-resource-support-contract",
      "Every cohort map measures start support at radius four with floor two and equity tolerance two.",
      (samples) =>
        samples.every(({ metrics }) => {
          const support = metrics.placement.support;
          return (
            support.radiusTiles === 4 &&
            support.configuredFloor === 2 &&
            support.configuredEquityTolerance === 2
          );
        }),
      true
    ),
    equalTo<StandardMapMetricCohort>(
      "realized-start-resource-floor",
      "Every cohort start realizes at least two resources within the configured radius.",
      (samples) =>
        samples.every(({ metrics }) => {
          const support = metrics.placement.support.realizedCounts;
          return support !== null && support.minimum >= 2;
        }),
      true
    ),
    equalTo<StandardMapMetricCohort>(
      "realized-start-resource-equity",
      "Every cohort map keeps its realized start-support gap at or below two.",
      (samples) =>
        samples.every(({ metrics }) => {
          const gap = metrics.placement.support.realizedGap;
          return gap !== null && gap <= 2;
        }),
      true
    ),
    equalTo<StandardMapMetricCohort>(
      "start-resource-shortfalls",
      "No cohort map leaves configured start support absent or records a planning shortfall.",
      (samples) =>
        samples.every(
          ({ metrics }) =>
            metrics.placement.support.startsBelowConfiguredFloor.population > 0 &&
            metrics.placement.support.startsBelowConfiguredFloor.count === 0 &&
            metrics.placement.support.recordedSupportShortfallUnits === 0
        ),
      true
    ),
  ],
} satisfies MetricTarget<StandardMapMetricCohort>;

function cohortShareSatisfies<T>(
  subjects: readonly T[],
  observe: (subject: T) => CountMetric,
  predicate: (share: number) => boolean
): boolean {
  let count = 0;
  let population = 0;
  for (const subject of subjects) {
    const metric = observe(subject);
    count += metric.count;
    population += metric.population;
  }
  return population > 0 && predicate(count / population);
}

function cohortMeanSatisfies(
  observations: readonly (number | null)[],
  predicate: (mean: number) => boolean
): boolean {
  if (observations.length === 0) return false;
  let sum = 0;
  for (const value of observations) {
    if (value === null) return false;
    sum += value;
  }
  return predicate(sum / observations.length);
}
