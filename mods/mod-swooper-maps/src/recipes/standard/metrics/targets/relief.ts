import type { CountMetric, MetricTarget } from "@swooper/mapgen-metrics";

import type { StandardMapMetricCohort, StandardMapProductSample } from "../sample.js";
import { atLeast, atMost, equalTo, requiredShare, summarizeCohort } from "./support.js";

/** Representative Earthlike relief benchmark for varied terrain without rough-upland carpets. */
export const EARTHLIKE_RELIEF_REPRESENTATIVE_TARGET = {
  id: "swooper-earthlike/relief",
  description:
    "Earthlike preserves useful foothills, bounded rough uplands, and varied realized terrain.",
  expectations: [
    atLeast<StandardMapProductSample>(
      "foothill-share",
      "Modeled foothills occupy a meaningful share of land.",
      (sample) => requiredShare(sample.metrics.relief.plannedFoothills, "Foothill land share"),
      0.12
    ),
    equalTo<StandardMapProductSample>(
      "foothills-exceed-rough-uplands",
      "Modeled foothills remain more common than rough-land hills.",
      (sample) =>
        sample.metrics.relief.plannedFoothills.count >
        sample.metrics.relief.plannedRoughLandHills.count,
      true
    ),
    atLeast<StandardMapProductSample>(
      "rough-upland-share-floor",
      "Rough-land hills remain visible in the representative terrain mix.",
      (sample) =>
        requiredShare(sample.metrics.relief.plannedRoughLandHills, "Rough-upland land share"),
      0.04
    ),
    atMost<StandardMapProductSample>(
      "rough-upland-share-ceiling",
      "Rough-land hills do not carpet the representative map.",
      (sample) =>
        requiredShare(sample.metrics.relief.plannedRoughLandHills, "Rough-upland land share"),
      0.08
    ),
    atMost<StandardMapProductSample>(
      "rough-upland-component-size",
      "The largest rough-land hill system remains geographically bounded.",
      (sample) => sample.metrics.relief.plannedRoughLandComponents.largestComponentSize,
      60
    ),
    atLeast<StandardMapProductSample>(
      "modeled-hill-share",
      "Modeled hills retain a meaningful share of land.",
      (sample) => requiredShare(sample.metrics.relief.plannedHills, "Modeled hill land share"),
      0.12
    ),
    atLeast<StandardMapProductSample>(
      "observed-hill-share",
      "Observed Civ7 hills preserve the representative relief floor.",
      (sample) => requiredShare(sample.metrics.relief.finalHills, "Observed hill land share"),
      0.1
    ),
    atMost<StandardMapProductSample>(
      "observed-flat-share",
      "Observed flat terrain leaves enough room for expressed relief.",
      (sample) => requiredShare(sample.metrics.relief.finalFlatTerrain, "Observed flat land share"),
      0.75
    ),
    atLeast<StandardMapProductSample>(
      "observed-non-volcano-relief",
      "Ordinary mountains and hills retain a meaningful realized land share.",
      (sample) =>
        requiredShare(
          sample.metrics.relief.finalNonVolcanoRoughTerrain,
          "Observed non-volcano relief share"
        ),
      0.18
    ),
  ],
} satisfies MetricTarget<StandardMapProductSample>;

/** Huge Earthlike cohort benchmark for stable foothills, broken uplands, and passable interiors. */
export const EARTHLIKE_HUGE_RELIEF_COHORT_TARGET = {
  id: "swooper-earthlike/huge-relief-cohort",
  description:
    "Earthlike relief remains useful and geographically broken across representative Huge-map seed rolls.",
  expectations: [
    atLeast<StandardMapMetricCohort>(
      "modeled-hill-share",
      "Every roll retains the modeled hill floor.",
      (samples) => minimumShare(samples, (sample) => sample.metrics.relief.plannedHills),
      0.12
    ),
    atLeast<StandardMapMetricCohort>(
      "foothill-share",
      "Every roll retains useful foothill coverage.",
      (samples) => minimumShare(samples, (sample) => sample.metrics.relief.plannedFoothills),
      0.08
    ),
    atMost<StandardMapMetricCohort>(
      "rough-upland-share",
      "Rough-land hills remain bounded in every roll.",
      (samples) => maximumShare(samples, (sample) => sample.metrics.relief.plannedRoughLandHills),
      0.08
    ),
    atMost<StandardMapMetricCohort>(
      "rough-upland-component-size",
      "No roll consolidates rough-land hills into an oversized component.",
      (samples) =>
        summarizeCohort(
          samples,
          (sample) => sample.metrics.relief.plannedRoughLandComponents.largestComponentSize
        ).maximum,
      40
    ),
    atLeast<StandardMapMetricCohort>(
      "observed-hill-share",
      "Every roll preserves an observed hill floor.",
      (samples) => minimumShare(samples, (sample) => sample.metrics.relief.finalHills),
      0.08
    ),
    atMost<StandardMapMetricCohort>(
      "observed-flat-share",
      "Every roll retains enough observed relief to avoid flat carpets.",
      (samples) => maximumShare(samples, (sample) => sample.metrics.relief.finalFlatTerrain),
      0.85
    ),
    atLeast<StandardMapMetricCohort>(
      "mountain-region-diameter",
      "Every roll retains a mountain-region system with geographic length.",
      (samples) =>
        summarizeCohort(
          samples,
          (sample) => sample.metrics.relief.mountainRegion.components.maximumComponentDiameter
        ).minimum,
      30
    ),
    atLeast<StandardMapMetricCohort>(
      "mountain-region-non-mountain-share",
      "Every mountain region retains passable non-mountain terrain.",
      (samples) =>
        minimumShare(samples, (sample) => sample.metrics.relief.mountainRegion.nonMountains),
      0.65
    ),
    atLeast<StandardMapMetricCohort>(
      "mountain-region-flat-share",
      "Every mountain region retains flat interior passages.",
      (samples) =>
        minimumShare(samples, (sample) => sample.metrics.relief.mountainRegion.flatInterior),
      0.35
    ),
    atLeast<StandardMapMetricCohort>(
      "mountain-region-flat-pocket",
      "Every roll retains a settlement-scale flat pocket inside its mountain region.",
      (samples) =>
        summarizeCohort(
          samples,
          (sample) =>
            sample.metrics.relief.mountainRegion.flatInteriorComponents.largestComponentSize
        ).minimum,
      50
    ),
  ],
} satisfies MetricTarget<StandardMapMetricCohort>;

/** Earthlike cohort benchmark for long orogenic systems with inhabitable interior structure. */
export const EARTHLIKE_OROGENY_TARGET = {
  id: "swooper-earthlike/orogeny-cohort",
  description:
    "Earthlike preserves long mountain systems whose regions contain passes, valleys, and foothills.",
  expectations: [
    atLeast<StandardMapMetricCohort>(
      "mountain-presence",
      "Every orogeny roll contains modeled mountain tiles.",
      (samples) =>
        summarizeCohort(samples, (sample) => sample.metrics.relief.plannedMountains.count).minimum,
      1
    ),
    atLeast<StandardMapMetricCohort>(
      "mountain-region-diameter",
      "Every roll retains a long mountain-region system.",
      (samples) =>
        summarizeCohort(
          samples,
          (sample) => sample.metrics.relief.mountainRegion.components.maximumComponentDiameter
        ).minimum,
      38
    ),
    atLeast<StandardMapMetricCohort>(
      "mountain-region-size",
      "Every roll retains a region-scale orographic footprint.",
      (samples) =>
        summarizeCohort(
          samples,
          (sample) => sample.metrics.relief.mountainRegion.components.largestComponentSize
        ).minimum,
      450
    ),
    atLeast<StandardMapMetricCohort>(
      "mountain-region-non-mountain-share",
      "Every orogenic region keeps most of its interior below mountain terrain.",
      (samples) =>
        minimumShare(samples, (sample) => sample.metrics.relief.mountainRegion.nonMountains),
      0.65
    ),
    atLeast<StandardMapMetricCohort>(
      "mountain-region-flat-share",
      "Every orogenic region retains broad flat passages and valleys.",
      (samples) =>
        minimumShare(samples, (sample) => sample.metrics.relief.mountainRegion.flatInterior),
      0.35
    ),
    atLeast<StandardMapMetricCohort>(
      "mountain-region-flat-volume",
      "Every roll retains settlement-scale flat terrain inside its mountain region.",
      (samples) =>
        summarizeCohort(
          samples,
          (sample) => sample.metrics.relief.mountainRegion.flatInterior.count
        ).minimum,
      300
    ),
    atMost<StandardMapMetricCohort>(
      "mountain-region-mountain-share",
      "Mountain peaks remain a minority of the broader orogenic region.",
      (samples) =>
        maximumShare(samples, (sample) => sample.metrics.relief.mountainRegion.mountains),
      0.38
    ),
    atLeast<StandardMapMetricCohort>(
      "mountain-region-shoulder-share",
      "Foothills and rough uplands provide a substantial shoulder around mountain spines.",
      (samples) =>
        summarizeCohort(samples, (sample) => {
          const region = sample.metrics.relief.mountainRegion;
          return (
            requiredShare(region.foothills, "Mountain-region foothill share") +
            requiredShare(region.roughLand, "Mountain-region rough-land share")
          );
        }).minimum,
      0.25
    ),
    atLeast<StandardMapMetricCohort>(
      "mountain-spine-diameter",
      "Every roll retains a mountain spine with geographic length.",
      (samples) =>
        summarizeCohort(
          samples,
          (sample) => sample.metrics.relief.plannedMountainComponents.maximumComponentDiameter
        ).minimum,
      25
    ),
  ],
} satisfies MetricTarget<StandardMapMetricCohort>;

function minimumShare(
  samples: StandardMapMetricCohort,
  observe: (sample: StandardMapProductSample) => CountMetric
): number {
  return summarizeCohort(samples, (sample) => requiredShare(observe(sample), "Cohort share"))
    .minimum;
}

function maximumShare(
  samples: StandardMapMetricCohort,
  observe: (sample: StandardMapProductSample) => CountMetric
): number {
  return summarizeCohort(samples, (sample) => requiredShare(observe(sample), "Cohort share"))
    .maximum;
}
