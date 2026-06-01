import { Type, defineStep } from "@swooper/mapgen-core/authoring";
import ecology from "@mapgen/domain/ecology";
import {
  FIELD_DEPENDENCY_TAGS,
  STANDARD_ENGINE_EFFECT_TAGS,
  MAP_PROJECTION_EFFECT_TAGS,
} from "../../../../tags.js";
import { ecologyArtifacts } from "../../../ecology/artifacts.js";

const FeaturesApplyStepContract = defineStep({
  id: "features-apply",
  phase: "gameplay",
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
      ecologyArtifacts.featureIntentsReefs,
      ecologyArtifacts.featureIntentsIce,
    ],
    provides: [ecologyArtifacts.featureApplyDiagnostics],
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
