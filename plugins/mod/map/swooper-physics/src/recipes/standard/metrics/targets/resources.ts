import type { MetricTarget } from "@swooper/mapgen-metrics";

import type { StandardMapMetricCohort } from "../sample.js";
import { atLeast, atMost, equalTo } from "./support.js";

const QUALIFYING_LANDMASS_SHARE = 0.1;

/**
 * Source-backed Earthlike resource-distribution budgets over the stable placement cohort.
 * Density equity is conditional: only maps with at least two >=10%-of-modeled-land landmasses
 * are comparable, and a study with no comparable map fails closed rather than passing vacuously.
 */
export const EARTHLIKE_RESOURCE_DISTRIBUTION_TARGET = {
  id: "swooper-earthlike/resources",
  description:
    "Earthlike resources preserve regional geological clustering and large-landmass density equity; provisional authored count ranges remain measurement evidence until calibrated.",
  expectations: [
    equalTo<StandardMapMetricCohort>(
      "geological-aggregation-above-spacing",
      "The nonempty cohort has a finite geological pair-correlation ratio on every map and an arithmetic mean strictly above complete spatial randomness beyond the spacing floor.",
      (samples) => {
        const mean = geologicalAggregationMean(samples);
        return mean !== null && mean > 1;
      },
      true
    ),
    atLeast<StandardMapMetricCohort>(
      "comparable-landmass-sample-evidence",
      "The study includes at least one map with two landmasses each containing ten percent of modeled land.",
      (samples) => comparableLandmassSampleCount(samples),
      1
    ),
    equalTo<StandardMapMetricCohort>(
      "qualifying-landmass-resource-presence",
      "Every qualifying landmass receives at least one successfully placed headless resource.",
      (samples) =>
        samples.every((sample) =>
          qualifyingLandmasses(sample.metrics.resources.landmassDensityRows).every(
            (row) => row.placedCount > 0
          )
        ),
      true
    ),
    atMost<StandardMapMetricCohort>(
      "qualifying-landmass-density-spread",
      "On every comparable map, resource density differs by at most twofold across landmasses containing at least ten percent of modeled land.",
      (samples) => maximumComparableLandmassDensitySpread(samples),
      2
    ),
  ],
} satisfies MetricTarget<StandardMapMetricCohort>;

function geologicalAggregationMean(samples: StandardMapMetricCohort): number | null {
  if (samples.length === 0) return null;
  let sum = 0;
  for (const sample of samples) {
    const ratio =
      sample.metrics.resources.geologicalPairCorrelationAboveSpacing
        .ratioToCompleteSpatialRandomness;
    if (ratio === null || !Number.isFinite(ratio)) return null;
    sum += ratio;
  }
  const mean = sum / samples.length;
  return Number.isFinite(mean) ? mean : null;
}

function qualifyingLandmasses(
  rows: StandardMapMetricCohort[number]["metrics"]["resources"]["landmassDensityRows"]
) {
  return rows.filter((row) => row.landShare >= QUALIFYING_LANDMASS_SHARE);
}

function qualifyingLandmassDensitySpread(
  rows: StandardMapMetricCohort[number]["metrics"]["resources"]["landmassDensityRows"]
): number {
  const densities = qualifyingLandmasses(rows).map((row) => row.densityPerHundredTiles);
  if (densities.length < 2) return Number.MAX_SAFE_INTEGER;
  const minimum = Math.min(...densities);
  return minimum > 0 ? Math.max(...densities) / minimum : Number.MAX_SAFE_INTEGER;
}

function comparableLandmassSampleCount(samples: StandardMapMetricCohort): number {
  return samples.filter(
    (sample) => qualifyingLandmasses(sample.metrics.resources.landmassDensityRows).length >= 2
  ).length;
}

function maximumComparableLandmassDensitySpread(samples: StandardMapMetricCohort): number {
  const spreads = samples
    .filter(
      (sample) => qualifyingLandmasses(sample.metrics.resources.landmassDensityRows).length >= 2
    )
    .map((sample) => qualifyingLandmassDensitySpread(sample.metrics.resources.landmassDensityRows));
  return spreads.length > 0 ? Math.max(...spreads) : Number.MAX_SAFE_INTEGER;
}
