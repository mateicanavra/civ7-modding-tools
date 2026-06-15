import ecology from "@mapgen/domain/ecology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
import {
  FIELD_DEPENDENCY_TAGS,
  MAP_PROJECTION_EFFECT_TAGS,
  STANDARD_ENGINE_EFFECT_TAGS,
} from "../../../../tag-contracts.js";
import { ecologyArtifacts } from "../../../ecology/artifacts.js";

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
