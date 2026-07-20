import type { MetricTarget } from "@swooper/mapgen-metrics";

import type { StandardMapMetricCohort, StandardMapProductSample } from "../sample.js";
import { atLeast, atMost, equalTo, requiredShare, summarizeCohort } from "./support.js";

/** Product-wide geography target for the shipped configuration and seed matrix. */
export const SHIPPED_GEOGRAPHY_TARGET = {
  id: "standard/shipped-geography",
  description: "Every shipped Standard scenario produces nondegenerate land and water geography.",
  expectations: [
    atLeast<StandardMapMetricCohort>(
      "planned-land",
      "Every scenario retains modeled pre-lake land.",
      (samples) =>
        summarizeCohort(samples, (sample) => sample.metrics.geography.plannedLand.count).minimum,
      1
    ),
    atLeast<StandardMapMetricCohort>(
      "observed-land",
      "Every scenario retains observed playable land.",
      (samples) =>
        summarizeCohort(samples, (sample) => sample.metrics.geography.realizedLand.count).minimum,
      1
    ),
    atLeast<StandardMapMetricCohort>(
      "observed-water",
      "Every scenario retains observed water.",
      (samples) =>
        summarizeCohort(samples, (sample) => sample.metrics.geography.realizedWater.count).minimum,
      1
    ),
    atLeast<StandardMapMetricCohort>(
      "land-share-floor",
      "No shipped scenario collapses into an effectively water-only map.",
      (samples) =>
        summarizeCohort(samples, (sample) =>
          requiredShare(sample.metrics.geography.realizedLand, "Observed land share")
        ).minimum,
      0.075
    ),
    atMost<StandardMapMetricCohort>(
      "land-share-ceiling",
      "No shipped scenario collapses into an effectively land-only map.",
      (samples) =>
        summarizeCohort(samples, (sample) =>
          requiredShare(sample.metrics.geography.realizedLand, "Observed land share")
        ).maximum,
      0.95
    ),
  ],
} satisfies MetricTarget<StandardMapMetricCohort>;

/** Representative Earthlike target for broad geography, hydrology, and biome coverage. */
export const EARTHLIKE_GEOGRAPHY_TARGET = {
  id: "swooper-earthlike/geography",
  description: "Earthlike preserves broad terrestrial, hydrologic, and biome coverage.",
  expectations: [
    atLeast<StandardMapProductSample>(
      "land-share-floor",
      "Earthlike retains a meaningful terrestrial surface.",
      (sample) => requiredShare(sample.metrics.geography.plannedLand, "Earthlike land share"),
      0.15
    ),
    atMost<StandardMapProductSample>(
      "land-share-ceiling",
      "Earthlike retains meaningful ocean coverage.",
      (sample) => requiredShare(sample.metrics.geography.plannedLand, "Earthlike land share"),
      0.9
    ),
    atMost<StandardMapProductSample>(
      "lake-share",
      "Lakes do not dominate Earthlike land.",
      (sample) => requiredShare(sample.metrics.geography.plannedLakes, "Earthlike lake share"),
      0.2
    ),
    atLeast<StandardMapProductSample>(
      "river-coverage",
      "Earthlike contains modeled rivers.",
      (sample) => sample.metrics.hydrology.riverTiles.count,
      1
    ),
    equalTo<StandardMapProductSample>(
      "hydrology-receiver-integrity",
      "The river network contains no invalid receiver tiles.",
      (sample) => sample.metrics.hydrology.networkSummary.invalidReceiverTileCount,
      0
    ),
    atLeast<StandardMapProductSample>(
      "biome-diversity",
      "Earthlike contains more than one modeled biome family.",
      (sample) => sample.metrics.ecology.biomeDiversity,
      2
    ),
    equalTo<StandardMapProductSample>(
      "dominant-biome",
      "Earthlike yields an observable dominant biome.",
      (sample) => sample.metrics.ecology.dominantBiome !== null,
      true
    ),
  ],
} satisfies MetricTarget<StandardMapProductSample>;

/** Earthlike cohort target preventing the drowned-ocean regression across sizes and seeds. */
export const EARTHLIKE_DEEP_OCEAN_TARGET = {
  id: "swooper-earthlike/deep-ocean-cohort",
  description: "Earthlike water remains deep-ocean dominant across Civ7 sizes and seed rolls.",
  expectations: [
    atLeast<StandardMapMetricCohort>(
      "deep-ocean-floor",
      "Every Earthlike scenario retains the admitted deep-ocean floor.",
      (samples) =>
        summarizeCohort(samples, (sample) =>
          requiredShare(sample.metrics.geography.deepOceanWater, "Earthlike deep-ocean share")
        ).minimum,
      0.4
    ),
  ],
} satisfies MetricTarget<StandardMapMetricCohort>;
