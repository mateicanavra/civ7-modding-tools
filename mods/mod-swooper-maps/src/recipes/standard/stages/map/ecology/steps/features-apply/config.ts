import ecology, { artifacts as ecologyArtifacts } from "@mapgen/domain/ecology";
import { artifacts as morphologyArtifacts } from "@mapgen/domain/morphology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
import {
  MAP_PROJECTION_EFFECT_TAGS,
  STANDARD_ENGINE_EFFECT_TAGS,
} from "../../../../../tag-contracts.js";
import { artifacts as mapEcologyArtifacts } from "../../artifacts/index.js";

/**
 * Defines the sole map-ecology boundary that applies all planned feature-family intents to
 * Civ7. It publishes immutable post-Ecology surface evidence, effect tags, and rejection diagnostics
 * while preserving upstream intent evidence.
 */
export const FeaturesApplyStepContract = defineStep({
  id: "features-apply",
  engine: [
    "getFeatureTypeIndex",
    "canHaveFeature",
    "setFeatureType",
    "validateAndFixTerrain",
    "getFeatureType",
    "getTerrainType",
    "isWater",
    "recalculateAreas",
  ] as const,
  requires: [],
  provides: [
    STANDARD_ENGINE_EFFECT_TAGS.engine.featuresApplied,
    MAP_PROJECTION_EFFECT_TAGS.map.ecologyFeaturesParityCaptured,
  ],
  artifacts: {
    requires: [
      ecologyArtifacts.featureIntentsVegetation,
      ecologyArtifacts.featureIntentsWetlands,
      ecologyArtifacts.featureIntentsFloodplains,
      ecologyArtifacts.featureIntentsReefs,
      ecologyArtifacts.featureIntentsIce,
      morphologyArtifacts.topography,
    ],
    provides: [
      mapEcologyArtifacts.featureApplyDiagnostics,
      mapEcologyArtifacts.featureEngineSnapshot,
    ],
  },
  ops: {
    apply: ecology.ops.applyFeatures,
  },
  schema: Type.Object(
    {},
    {
      description: "Configuration for applying planned feature placements to the map.",
    }
  ),
});
