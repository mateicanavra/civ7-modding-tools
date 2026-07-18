import ecology from "@mapgen/domain/ecology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
import {
  FIELD_DEPENDENCY_TAGS,
  MAP_PROJECTION_EFFECT_TAGS,
  STANDARD_ENGINE_EFFECT_TAGS,
} from "../../../../tag-contracts.js";
import {
  artifactModules as ecologyArtifactModules,
  artifacts as ecologyArtifacts,
} from "../../../ecology/artifacts/index.js";

/**
 * Defines the sole map-ecology boundary that applies all planned feature-family intents to
 * Civ7. It publishes field/effect tags and rejection diagnostics while preserving upstream
 * intent as truth.
 */
const FeaturesApplyStepContract = defineStep({
  id: "features-apply",
  phase: "ecology",
  requires: [],
  provides: [
    FIELD_DEPENDENCY_TAGS.field.featureType,
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
    ],
    provides: [ecologyArtifactModules.featureApplyDiagnostics],
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

export default FeaturesApplyStepContract;
