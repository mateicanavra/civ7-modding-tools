import ecology from "@mapgen/domain/ecology";
import { artifacts as featureArtifacts } from "@mapgen/domain/ecology/modules/features/artifacts/index.js";
import { artifacts as morphologyLandformsArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";
import { STANDARD_ENGINE_EFFECT_TAGS } from "../../../../../tag-contracts.js";

/**
 * Defines the sole map-ecology boundary that applies all planned feature-family intents to
 * Civ7. Current engine observation and rejection measurements leave through step facets rather
 * than becoming stale write-once pipeline state.
 */
export const config = defineStep({
  id: "features-apply",
  description: "Applies admitted feature-placement intent to the current Civ7 map.",
  engine: [
    "getFeatureTypeIndex",
    "canHaveFeature",
    "setFeatureType",
    "validateAndFixTerrain",
    "readCurrentMapFeatureTypes",
    "readCurrentMapTerrainTypes",
    "readCurrentMapWaterMask",
    "recalculateAreas",
  ] as const,
  requires: [
    featureArtifacts.vegetationIntents,
    featureArtifacts.wetlandIntents,
    featureArtifacts.floodplainIntents,
    featureArtifacts.reefIntents,
    featureArtifacts.iceIntents,
    morphologyLandformsArtifacts.topography,
  ],
  provides: [STANDARD_ENGINE_EFFECT_TAGS.engine.featuresApplied],

  ops: {
    apply: ecology.features.ops.applyFeatures,
  },
});
