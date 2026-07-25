import ecology from "@mapgen/domain/ecology";
import { artifacts as featureArtifacts } from "@mapgen/domain/ecology/modules/features/artifacts/index.js";
import { artifacts as morphologyLandformsArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
import { STANDARD_ENGINE_EFFECT_TAGS } from "../../../../../tag-contracts.js";

/**
 * Defines the sole map-ecology boundary that applies all planned feature-family intents to
 * Civ7. Current engine observation and rejection measurements leave through step facets rather
 * than becoming stale write-once pipeline state.
 */
export const config = defineStep({
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
  provides: [STANDARD_ENGINE_EFFECT_TAGS.engine.featuresApplied],
  artifacts: {
    requires: [
      featureArtifacts.featureIntentsVegetation,
      featureArtifacts.featureIntentsWetlands,
      featureArtifacts.featureIntentsFloodplains,
      featureArtifacts.featureIntentsReefs,
      featureArtifacts.featureIntentsIce,
      morphologyLandformsArtifacts.topography,
    ],
  },
  ops: {
    apply: ecology.features.ops.applyFeatures,
  },
  schema: Type.Object(
    {},
    {
      description: "Configuration for applying planned feature placements to the map.",
    }
  ),
});
