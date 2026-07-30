import type { MetricExpectation, MetricTarget } from "@swooper/mapgen-metrics";
import type { NonEmptyTuple } from "type-fest";

import type { StandardMapProductSample } from "../sample.js";
import { atLeast, atMost, equalTo, requiredShare } from "./support.js";

type WorldIdentityTargetSpec = Readonly<{
  wetlandShareMaximum: number;
  reefShareMaximum: number;
  deepOceanShareMinimum: number | null;
  largestLakeComponentMinimum: number;
  requiredFeatures: readonly string[];
  vegetationFamilyMinimum: number;
  requiresAtolls: boolean;
  rainforestVegetationShareMaximum: number | null;
  rainforestTileMaximum: number | null;
}>;

const IDENTITY_SPECS = {
  "swooper-earthlike": {
    wetlandShareMaximum: 0.08,
    reefShareMaximum: 0.13,
    deepOceanShareMinimum: 0.4,
    largestLakeComponentMinimum: 4,
    requiredFeatures: [
      "FEATURE_FOREST",
      "FEATURE_RAINFOREST",
      "FEATURE_TAIGA",
      "FEATURE_SAVANNA_WOODLAND",
      "FEATURE_SAGEBRUSH_STEPPE",
    ],
    vegetationFamilyMinimum: 5,
    requiresAtolls: false,
    rainforestVegetationShareMaximum: 0.65,
    rainforestTileMaximum: null,
  },
  "shattered-ring": {
    wetlandShareMaximum: 0.12,
    reefShareMaximum: 0.04,
    deepOceanShareMinimum: null,
    largestLakeComponentMinimum: 4,
    requiredFeatures: ["FEATURE_FOREST", "FEATURE_RAINFOREST", "FEATURE_SAGEBRUSH_STEPPE"],
    vegetationFamilyMinimum: 3,
    requiresAtolls: true,
    rainforestVegetationShareMaximum: null,
    rainforestTileMaximum: null,
  },
  "sundered-archipelago": {
    wetlandShareMaximum: 0.22,
    reefShareMaximum: 0.02,
    deepOceanShareMinimum: null,
    largestLakeComponentMinimum: 2,
    requiredFeatures: ["FEATURE_FOREST", "FEATURE_RAINFOREST", "FEATURE_MANGROVE"],
    vegetationFamilyMinimum: 2,
    requiresAtolls: true,
    rainforestVegetationShareMaximum: null,
    rainforestTileMaximum: null,
  },
  "swooper-desert-mountains": {
    wetlandShareMaximum: 0.08,
    reefShareMaximum: 0.047,
    deepOceanShareMinimum: null,
    largestLakeComponentMinimum: 4,
    requiredFeatures: ["FEATURE_SAVANNA_WOODLAND", "FEATURE_SAGEBRUSH_STEPPE"],
    vegetationFamilyMinimum: 2,
    requiresAtolls: true,
    rainforestVegetationShareMaximum: null,
    rainforestTileMaximum: 20,
  },
} as const satisfies Readonly<Record<string, WorldIdentityTargetSpec>>;

/** Product-identity targets keyed by the exact shipped Standard configuration ID. */
export const SHIPPED_IDENTITY_TARGETS: Readonly<
  Record<keyof typeof IDENTITY_SPECS, MetricTarget<StandardMapProductSample>>
> = Object.freeze({
  "swooper-earthlike": createIdentityTarget(
    "swooper-earthlike",
    IDENTITY_SPECS["swooper-earthlike"]
  ),
  "shattered-ring": createIdentityTarget("shattered-ring", IDENTITY_SPECS["shattered-ring"]),
  "sundered-archipelago": createIdentityTarget(
    "sundered-archipelago",
    IDENTITY_SPECS["sundered-archipelago"]
  ),
  "swooper-desert-mountains": createIdentityTarget(
    "swooper-desert-mountains",
    IDENTITY_SPECS["swooper-desert-mountains"]
  ),
});

const DESERT_MOUNTAINS_ARID_CLIMATE_EXPECTATIONS = [
  equalTo(
    "configuration-identity",
    "The sample belongs to the Desert Mountains configuration.",
    (sample: StandardMapProductSample) => sample.provenance.configurationId,
    "swooper-desert-mountains"
  ),
  atMost(
    "wetland-share",
    "Wetlands remain a bounded accent on the arid land surface.",
    (sample: StandardMapProductSample) =>
      requiredShare(sample.metrics.ecology.wetlandTiles, "Wetland share"),
    IDENTITY_SPECS["swooper-desert-mountains"].wetlandShareMaximum
  ),
  atLeast(
    "vegetation-family-variety",
    "The arid map retains both savanna woodland and sagebrush-steppe families.",
    (sample: StandardMapProductSample) => sample.metrics.ecology.vegetationFamiliesPresent,
    IDENTITY_SPECS["swooper-desert-mountains"].vegetationFamilyMinimum
  ),
  requiredFeatureExpectation("FEATURE_SAVANNA_WOODLAND"),
  requiredFeatureExpectation("FEATURE_SAGEBRUSH_STEPPE"),
  atMost(
    "rainforest-tile-count",
    "Rainforest remains below the Desert Mountains tropical-drift budget.",
    (sample: StandardMapProductSample) =>
      sample.metrics.ecology.featureCounts.FEATURE_RAINFOREST ?? 0,
    IDENTITY_SPECS["swooper-desert-mountains"].rainforestTileMaximum ?? 0
  ),
  atLeast(
    "dry-flow-presence",
    "Desert Mountains retains land with no sustained modeled flow.",
    (sample: StandardMapProductSample) => sample.metrics.hydrology.networkSummary.dryFlowTileCount,
    1
  ),
] satisfies NonEmptyTuple<MetricExpectation<StandardMapProductSample>>;

/**
 * Multi-seed climate identity for Desert Mountains.
 *
 * The shipped identity target remains a representative full-map benchmark because atolls and
 * some resource outcomes legitimately vary by seed. This narrower target owns the arid ecology
 * invariants that the Desert Mountains climate calibration must preserve on every admitted roll.
 */
export const DESERT_MOUNTAINS_ARID_CLIMATE_TARGET: MetricTarget<StandardMapProductSample> =
  Object.freeze({
    id: "swooper-desert-mountains/arid-climate",
    description:
      "Desert Mountains preserves dry land and varied vegetation without tropical drift across seeds.",
    expectations: Object.freeze(DESERT_MOUNTAINS_ARID_CLIMATE_EXPECTATIONS),
  });

function createIdentityTarget(
  configurationId: string,
  spec: WorldIdentityTargetSpec
): MetricTarget<StandardMapProductSample> {
  const expectations: [
    MetricExpectation<StandardMapProductSample>,
    ...MetricExpectation<StandardMapProductSample>[],
  ] = [
    equalTo(
      "configuration-identity",
      "The sample belongs to the configuration whose identity this target defines.",
      (sample: StandardMapProductSample) => sample.provenance.configurationId,
      configurationId
    ),
  ];
  expectations.push(
    atLeast(
      "largest-lake-component",
      "At least one projected lake forms the basin scale required by this map identity.",
      (sample: StandardMapProductSample) =>
        sample.metrics.geography.projectedLakeComponents.largestComponentSize,
      spec.largestLakeComponentMinimum
    ),
    atMost(
      "wetland-share",
      "Wetlands remain a bounded accent on playable land.",
      (sample: StandardMapProductSample) =>
        requiredShare(sample.metrics.ecology.wetlandTiles, "Wetland share"),
      spec.wetlandShareMaximum
    ),
    atMost(
      "reef-family-share",
      "Reef-family features remain ocean accents rather than carpeting water.",
      (sample: StandardMapProductSample) =>
        requiredShare(sample.metrics.ecology.reefFamilyTiles, "Reef-family share"),
      spec.reefShareMaximum
    ),
    atLeast(
      "vegetation-family-variety",
      "The map retains the vegetation-family variety declared by its product identity.",
      (sample: StandardMapProductSample) => sample.metrics.ecology.vegetationFamiliesPresent,
      spec.vegetationFamilyMinimum
    )
  );

  if (spec.deepOceanShareMinimum !== null) {
    expectations.push(
      atLeast(
        "deep-ocean-share",
        "The map preserves the deep-ocean geography declared by its identity.",
        (sample: StandardMapProductSample) =>
          requiredShare(sample.metrics.geography.deepOceanWater, "Deep-ocean share"),
        spec.deepOceanShareMinimum
      )
    );
  }
  if (spec.requiresAtolls) {
    expectations.push(requiredFeatureExpectation("FEATURE_ATOLL"));
  }
  for (const feature of spec.requiredFeatures) {
    expectations.push(requiredFeatureExpectation(feature));
  }
  if (spec.rainforestVegetationShareMaximum !== null) {
    expectations.push(
      atMost(
        "rainforest-vegetation-share",
        "Rainforest remains inside the vegetation mix declared by this map identity.",
        (sample: StandardMapProductSample) =>
          (sample.metrics.ecology.featureCounts.FEATURE_RAINFOREST ?? 0) /
          Math.max(1, sample.metrics.ecology.vegetationTiles.count),
        spec.rainforestVegetationShareMaximum
      )
    );
  }
  if (spec.rainforestTileMaximum !== null) {
    expectations.push(
      atMost(
        "rainforest-tile-count",
        "Rainforest remains below this map identity's absolute tile budget.",
        (sample: StandardMapProductSample) =>
          sample.metrics.ecology.featureCounts.FEATURE_RAINFOREST ?? 0,
        spec.rainforestTileMaximum
      )
    );
  }

  return Object.freeze({
    id: `${configurationId}/identity`,
    description: `The ${configurationId} configuration preserves its shipped map identity.`,
    expectations: Object.freeze(expectations),
  });
}

function requiredFeatureExpectation(feature: string): MetricExpectation<StandardMapProductSample> {
  return atLeast(
    `required-feature/${feature.toLowerCase()}`,
    `${feature} remains present where the shipped map identity requires it.`,
    (sample: StandardMapProductSample) => sample.metrics.ecology.featureCounts[feature] ?? 0,
    1
  );
}
