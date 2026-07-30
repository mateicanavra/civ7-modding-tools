import type { MetricTarget } from "@swooper/mapgen-metrics";

import type { StandardMapMetricCohort, StandardMapProductSample } from "../sample.js";
import {
  atLeast,
  atMost,
  equalTo,
  requiredRatio,
  requiredShare,
  summarizeCohort,
} from "./support.js";

const FLOODPLAIN_FEATURE_KEYS = [
  "FEATURE_DESERT_FLOODPLAIN_MINOR",
  "FEATURE_DESERT_FLOODPLAIN_NAVIGABLE",
  "FEATURE_GRASSLAND_FLOODPLAIN_MINOR",
  "FEATURE_GRASSLAND_FLOODPLAIN_NAVIGABLE",
  "FEATURE_PLAINS_FLOODPLAIN_MINOR",
  "FEATURE_PLAINS_FLOODPLAIN_NAVIGABLE",
  "FEATURE_TROPICAL_FLOODPLAIN_MINOR",
  "FEATURE_TROPICAL_FLOODPLAIN_NAVIGABLE",
  "FEATURE_TUNDRA_FLOODPLAIN_MINOR",
  "FEATURE_TUNDRA_FLOODPLAIN_NAVIGABLE",
] as const;

/** Representative Earthlike target for gradual latitude transitions and within-row variety. */
export const EARTHLIKE_BIOME_STRUCTURE_TARGET = {
  id: "swooper-earthlike/biome-structure",
  description:
    "Earthlike avoids abrupt rainforest latitude cuts and horizontally uniform biome bands.",
  expectations: [
    atLeast<StandardMapProductSample>(
      "rainforest-latitude-row-evidence",
      "The representative map contains adjacent latitude rows with enough land to compare rainforest share.",
      (sample) => sample.metrics.ecology.biomeRows.adjacentRainforestRowPairCount,
      1
    ),
    atMost<StandardMapProductSample>(
      "rainforest-latitude-transition",
      "Adjacent well-sampled latitude rows avoid an abrupt rainforest-share cutoff.",
      (sample) =>
        sample.metrics.ecology.biomeRows.maximumAdjacentRainforestShareDelta ??
        Number.MAX_SAFE_INTEGER,
      0.61
    ),
    atLeast<StandardMapProductSample>(
      "cold-biome-presence",
      "Tundra or boreal biome tiles remain present across the configured latitude span.",
      (sample) => sample.metrics.ecology.coldBiomeTiles.count,
      1
    ),
    atLeast<StandardMapProductSample>(
      "land-row-evidence",
      "The representative map contains at least one land-bearing latitude row.",
      (sample) => sample.metrics.ecology.biomeRows.landRowCount,
      1
    ),
    atLeast<StandardMapProductSample>(
      "median-row-biome-diversity",
      "A typical land-bearing row contains at least one classified biome.",
      (sample) => sample.metrics.ecology.biomeRows.medianBiomeDiversity ?? -1,
      1
    ),
    atLeast<StandardMapProductSample>(
      "maximum-row-biome-diversity",
      "At least one land-bearing row contains multiple biome families.",
      (sample) => sample.metrics.ecology.biomeRows.maximumBiomeDiversity ?? -1,
      2
    ),
    atLeast<StandardMapProductSample>(
      "land-biome-diversity",
      "The representative land surface contains at least three biome families.",
      (sample) => sample.metrics.ecology.biomeDiversity,
      3
    ),
  ],
} satisfies MetricTarget<StandardMapProductSample>;

/** Earthlike cohort benchmark for vegetation variety and biome balance. */
export const EARTHLIKE_ECOLOGY_TARGET = {
  id: "swooper-earthlike/ecology-cohort",
  description: "Earthlike retains varied vegetation and biome balance across representative seeds.",
  expectations: [
    atLeast<StandardMapMetricCohort>(
      "vegetation-presence",
      "Every Earthlike roll materializes vegetation-family features.",
      (samples) =>
        summarizeCohort(samples, (sample) => sample.metrics.ecology.vegetationTiles.count).minimum,
      1
    ),
    atLeast<StandardMapMetricCohort>(
      "vegetation-family-variety",
      "Every Earthlike roll retains at least four vegetation families.",
      (samples) =>
        summarizeCohort(samples, (sample) => sample.metrics.ecology.vegetationFamiliesPresent)
          .minimum,
      4
    ),
    atLeast<StandardMapMetricCohort>(
      "vegetation-share-floor",
      "Vegetation covers a meaningful share of modeled land in every Earthlike roll.",
      (samples) =>
        summarizeCohort(samples, (sample) =>
          requiredShare(sample.metrics.ecology.vegetationTiles, "Vegetation land share")
        ).minimum,
      0.08
    ),
    atMost<StandardMapMetricCohort>(
      "vegetation-share-ceiling",
      "Vegetation leaves room for open terrain in every Earthlike roll.",
      (samples) =>
        summarizeCohort(samples, (sample) =>
          requiredShare(sample.metrics.ecology.vegetationTiles, "Vegetation land share")
        ).maximum,
      0.55
    ),
    atMost<StandardMapMetricCohort>(
      "rainforest-vegetation-share",
      "Rainforest remains one part of the vegetation mix rather than displacing other families.",
      (samples) =>
        summarizeCohort(samples, (sample) =>
          requiredRatio(
            sample.metrics.ecology.featureCounts.FEATURE_RAINFOREST ?? 0,
            sample.metrics.ecology.vegetationTiles.count,
            "Rainforest vegetation share"
          )
        ).maximum,
      0.7
    ),
    atMost<StandardMapMetricCohort>(
      "rainforest-land-share",
      "Rainforest remains below the admitted share of modeled land in every Earthlike roll.",
      (samples) =>
        summarizeCohort(samples, (sample) =>
          requiredRatio(
            sample.metrics.ecology.featureCounts.FEATURE_RAINFOREST ?? 0,
            sample.metrics.geography.plannedLand.count,
            "Rainforest land share"
          )
        ).maximum,
      0.35
    ),
    equalTo<StandardMapMetricCohort>(
      "forest-presence",
      "Forest appears in every representative Earthlike roll.",
      (samples) => featurePresenceCount(samples, "FEATURE_FOREST") === samples.length,
      true
    ),
    equalTo<StandardMapMetricCohort>(
      "rainforest-presence",
      "Rainforest appears in every representative Earthlike roll.",
      (samples) => featurePresenceCount(samples, "FEATURE_RAINFOREST") === samples.length,
      true
    ),
    equalTo<StandardMapMetricCohort>(
      "taiga-presence",
      "Taiga appears in every representative Earthlike roll.",
      (samples) => featurePresenceCount(samples, "FEATURE_TAIGA") === samples.length,
      true
    ),
    atLeast<StandardMapMetricCohort>(
      "savanna-presence",
      "Savanna woodland remains visible across most representative Earthlike rolls.",
      (samples) => featurePresenceCount(samples, "FEATURE_SAVANNA_WOODLAND"),
      6
    ),
    atLeast<StandardMapMetricCohort>(
      "sagebrush-presence",
      "Sagebrush steppe remains visible across most representative Earthlike rolls.",
      (samples) => featurePresenceCount(samples, "FEATURE_SAGEBRUSH_STEPPE"),
      6
    ),
  ],
} satisfies MetricTarget<StandardMapMetricCohort>;

/** Earthlike cohort benchmark for visible cold-reef accents without shelf carpeting. */
export const EARTHLIKE_COLD_REEF_TARGET = {
  id: "swooper-earthlike/cold-reef-cohort",
  description: "Earthlike retains cold-reef accents on deep-ocean-dominant water surfaces.",
  expectations: [
    atLeast<StandardMapMetricCohort>(
      "cold-reef-presence",
      "Cold reefs appear in at least half of the representative seed rolls.",
      (samples) => featurePresenceCount(samples, "FEATURE_COLD_REEF"),
      4
    ),
    atLeast<StandardMapMetricCohort>(
      "deep-ocean-floor",
      "Every cold-reef cohort roll also retains the Earthlike deep-ocean floor.",
      (samples) =>
        summarizeCohort(samples, (sample) =>
          requiredShare(sample.metrics.geography.deepOceanWater, "Deep-ocean water share")
        ).minimum,
      0.4
    ),
    atMost<StandardMapMetricCohort>(
      "coast-water-carpet-ceiling",
      "Cold reefs remain accents rather than carpeting shallow coast water.",
      (samples) =>
        summarizeCohort(samples, (sample) =>
          requiredShare(sample.metrics.ecology.coldReefCoastTiles, "Cold-reef coast share")
        ).maximum,
      0.15
    ),
  ],
} satisfies MetricTarget<StandardMapMetricCohort>;

/** Earthlike representative benchmark for an active, rejection-free floodplain product row. */
export const EARTHLIKE_FLOODPLAIN_TARGET = {
  id: "swooper-earthlike/floodplain",
  description:
    "The representative Earthlike run produces floodplain intent without soft surface rejection.",
  expectations: [
    atLeast<StandardMapProductSample>(
      "floodplain-attempts",
      "The floodplain feature family receives enough admitted placements to exercise the row.",
      (sample) =>
        sumFeatureCounts(sample.metrics.ecology.featureAttemptCounts, FLOODPLAIN_FEATURE_KEYS),
      8
    ),
    equalTo<StandardMapProductSample>(
      "floodplain-soft-rejections",
      "No admitted floodplain feature is rejected by Civ7 surface legality.",
      (sample) =>
        sumFeatureCounts(sample.metrics.ecology.featureRejectCounts, FLOODPLAIN_FEATURE_KEYS),
      0
    ),
    equalTo<StandardMapProductSample>(
      "feature-surface-legality",
      "The complete observed feature surface contains no illegal placement.",
      (sample) => sample.metrics.ecology.invalidFeatureSurfaceCount,
      0
    ),
  ],
} satisfies MetricTarget<StandardMapProductSample>;

function featurePresenceCount(samples: StandardMapMetricCohort, feature: string): number {
  return samples.filter((sample) => (sample.metrics.ecology.featureCounts[feature] ?? 0) > 0)
    .length;
}

function sumFeatureCounts(
  counts: Readonly<Record<string, number>>,
  features: readonly string[]
): number {
  return features.reduce((sum, feature) => sum + (counts[feature] ?? 0), 0);
}
