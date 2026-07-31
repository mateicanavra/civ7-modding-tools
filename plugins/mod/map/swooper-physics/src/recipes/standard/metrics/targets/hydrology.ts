import { metricShare, type MetricTarget } from "@swooper/mapgen-metrics";

import type { StandardMapMetricCohort } from "../sample.js";
import { atLeast, atMost, equalTo, summarizeCohort } from "./support.js";

/** Earthlike cohort target for a meaningful river hierarchy and a closed permanence partition. */
export const EARTHLIKE_RIVER_NETWORK_TARGET = {
  id: "swooper-earthlike/river-network",
  description:
    "Earthlike produces hierarchical river networks whose admitted river tiles carry active flow evidence.",
  expectations: [
    atLeast<StandardMapMetricCohort>(
      "stream-order-hierarchy",
      "Every representative map develops at least a second-order river branch.",
      (samples) =>
        summarizeCohort(
          samples,
          (sample) => sample.metrics.hydrology.networkSummary.maxStreamOrderProxy
        ).minimum,
      2
    ),
    equalTo<StandardMapMetricCohort>(
      "river-permanence-partition",
      "Every river tile belongs to exactly one ephemeral, intermittent, or perennial class.",
      (samples) =>
        samples.every(({ metrics }) => {
          const summary = metrics.hydrology.networkSummary;
          return (
            summary.riverEphemeralTileCount +
              summary.riverIntermittentTileCount +
              summary.riverPerennialTileCount ===
            summary.riverTileCount
          );
        }),
      true
    ),
    equalTo<StandardMapMetricCohort>(
      "river-active-flow",
      "Every classified river tile carries non-dry flow evidence.",
      (samples) =>
        samples.every(({ metrics }) => metrics.hydrology.networkSummary.riverDryTileCount === 0),
      true
    ),
    equalTo<StandardMapMetricCohort>(
      "river-flow-mix",
      "Every representative map retains non-perennial rivers within its active flow network.",
      (samples) =>
        samples.every(
          ({ metrics }) => metrics.hydrology.networkSummary.nonPerennialRiverShareOfRiverTiles > 0
        ),
      true
    ),
  ],
} satisfies MetricTarget<StandardMapMetricCohort>;

/**
 * Earthlike product bounds for broad atmospheric circulation structure.
 *
 * The target evaluates aggregate signs and ratios rather than reproducing the circulation
 * algorithm. Further tightening should follow measured product improvements, not implementation
 * constants.
 */
export const EARTHLIKE_WIND_STRUCTURE_TARGET = {
  id: "swooper-earthlike/wind-structure",
  description:
    "Earthlike retains recognizable wind bands, equatorward tropical flow, mirrored hemispheric curl, and bounded texture and quantization.",
  expectations: [
    atMost<StandardMapMetricCohort>(
      "wind-saturation-bounded",
      "At most two percent of published wind vectors reach the signed-byte magnitude ceiling.",
      (samples) =>
        summarizeCohort(
          samples,
          (sample) => metricShare(sample.metrics.hydrology.windStructure.saturatedTiles) ?? 1
        ).maximum,
      0.02
    ),
    atMost<StandardMapMetricCohort>(
      "wind-deviation-dominance-bounded",
      "At most eighty percent of tiles let local deviation dominate the row-mean wind signal.",
      (samples) =>
        summarizeCohort(
          samples,
          (sample) =>
            metricShare(sample.metrics.hydrology.windStructure.deviationDominantTiles) ?? 1
        ).maximum,
      0.8
    ),
    atLeast<StandardMapMetricCohort>(
      "wind-zonal-band-sign-floor",
      "At least ninety percent of scored latitude rows retain the expected broad zonal sign.",
      (samples) =>
        summarizeCohort(
          samples,
          (sample) => metricShare(sample.metrics.hydrology.windStructure.zonalBandSignRows) ?? 0
        ).minimum,
      0.9
    ),
    atMost<StandardMapMetricCohort>(
      "wind-eddy-to-band-rms-ratio-bounded",
      "Mean within-row zonal RMS remains below the broad zonal band signal.",
      (samples) =>
        summarizeCohort(samples, (sample) => {
          const wind = sample.metrics.hydrology.windStructure;
          return wind.withinRowRmsU.mean / Math.max(1e-6, wind.rowMeanAbsU.mean);
        }).maximum,
      0.85
    ),
    atMost<StandardMapMetricCohort>(
      "wind-meridional-zonal-dominance",
      "Mean meridional row flow remains directionally subordinate to mean zonal flow.",
      (samples) =>
        summarizeCohort(samples, (sample) => {
          const wind = sample.metrics.hydrology.windStructure;
          return wind.rowMeanAbsV.mean / Math.max(1e-6, wind.rowMeanAbsU.mean);
        }).maximum,
      0.35
    ),
    atLeast<StandardMapMetricCohort>(
      "wind-tropical-north-equatorward",
      "Northern tropical mean flow remains equatorward in the declared vector frame.",
      (samples) =>
        summarizeCohort(
          samples,
          (sample) => sample.metrics.hydrology.windStructure.tropicalMeridional.northMeanV ?? -128
        ).minimum,
      2
    ),
    atMost<StandardMapMetricCohort>(
      "wind-tropical-south-equatorward",
      "Southern tropical mean flow remains equatorward in the declared vector frame.",
      (samples) =>
        summarizeCohort(
          samples,
          (sample) => sample.metrics.hydrology.windStructure.tropicalMeridional.southMeanV ?? 128
        ).maximum,
      -1
    ),
    atMost<StandardMapMetricCohort>(
      "wind-hemispheric-curl-mirror",
      "Temperate-band mean curl keeps opposite hemispheric signs with bounded asymmetry.",
      (samples) =>
        summarizeCohort(samples, (sample) => {
          const { northMeanCurl, southMeanCurl } =
            sample.metrics.hydrology.windStructure.hemisphericCurl;
          if (northMeanCurl === null || southMeanCurl === null) return 1;
          if (Math.sign(northMeanCurl) === Math.sign(southMeanCurl)) return 1;
          const magnitude = Math.abs(northMeanCurl) + Math.abs(southMeanCurl);
          return magnitude > 1e-9 ? Math.abs(northMeanCurl + southMeanCurl) / magnitude : 1;
        }).maximum,
      0.35
    ),
  ],
} satisfies MetricTarget<StandardMapMetricCohort>;

/**
 * Achieved-level structure floors for the annual-mean circulation-pressure anomaly field.
 *
 * The belt and row-sign checks establish a shared coordinate/scaffold frame between pressure and
 * wind; they do not claim that annual-mean pressure reconstructs the complete circulation. The
 * anomaly floor is a product measurement: it keeps a non-zonal pressure signal in the published
 * field without encoding an operation parameter.
 */
export const EARTHLIKE_PRESSURE_STRUCTURE_TARGET = {
  id: "swooper-earthlike/pressure-structure",
  description:
    "Earthlike pressure retains the declared latitude belts, hemispheric mirror, shared wind frame, and a measurable non-zonal anomaly signal.",
  expectations: [
    equalTo<StandardMapMetricCohort>(
      "pressure-belt-ridge-above-trough",
      "The subtropical ridge band mean exceeds the equatorial trough band mean in both hemispheres.",
      (samples) =>
        samples.every(({ metrics }) => {
          const bands = metrics.hydrology.pressureStructure.bandMeans;
          if (
            bands.northRidge === null ||
            bands.northItcz === null ||
            bands.southRidge === null ||
            bands.southItcz === null
          ) {
            return false;
          }
          return bands.northRidge > bands.northItcz && bands.southRidge > bands.southItcz;
        }),
      true
    ),
    equalTo<StandardMapMetricCohort>(
      "pressure-belt-ridge-above-subpolar",
      "The subtropical ridge band mean exceeds the subpolar low band mean in both hemispheres.",
      (samples) =>
        samples.every(({ metrics }) => {
          const bands = metrics.hydrology.pressureStructure.bandMeans;
          if (
            bands.northRidge === null ||
            bands.northSubpolar === null ||
            bands.southRidge === null ||
            bands.southSubpolar === null
          ) {
            return false;
          }
          return (
            bands.northRidge > bands.northSubpolar && bands.southRidge > bands.southSubpolar
          );
        }),
      true
    ),
    atMost<StandardMapMetricCohort>(
      "pressure-hemispheric-mirror",
      "North and south pressure-belt profiles stay within the achieved normalized asymmetry.",
      (samples) =>
        summarizeCohort(
          samples,
          (sample) => sample.metrics.hydrology.pressureStructure.mirrorAsymmetry ?? 1
        ).maximum,
      0.1
    ),
    atLeast<StandardMapMetricCohort>(
      "pressure-wind-scaffold-frame-agreement",
      "Extratropical pressure belts and zonal-mean wind agree on the declared coordinate and circulation frame in both hemispheres.",
      (samples) =>
        summarizeCohort(samples, (sample) => {
          const agreement = sample.metrics.hydrology.pressureStructure.scaffoldFrameSign;
          const north = metricShare(agreement.north);
          const south = metricShare(agreement.south);
          if (north === null || south === null) return 0;
          return Math.min(north, south);
        }).minimum,
      0.8
    ),
    atLeast<StandardMapMetricCohort>(
      "pressure-zonal-anomaly-rms-floor",
      "The published pressure field retains a measurable non-zonal anomaly signal after removing each row mean.",
      (samples) =>
        summarizeCohort(
          samples,
          (sample) => sample.metrics.hydrology.pressureStructure.zonalAnomalyRmsHpa
        ).minimum,
      4
    ),
  ],
} satisfies MetricTarget<StandardMapMetricCohort>;
