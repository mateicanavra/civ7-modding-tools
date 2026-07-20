import placement from "@mapgen/domain/placement";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

import {
  MAP_PROJECTION_EFFECT_TAGS,
  STANDARD_ENGINE_EFFECT_TAGS,
} from "../../../../tag-contracts.js";
import { artifacts as ecologyArtifacts } from "../../../ecology/artifacts/index.js";
import { artifacts as hydrologyHydrographyArtifacts } from "../../../hydrology-hydrography/artifacts/index.js";
import { artifacts as morphologyArtifacts } from "../../../morphology/artifacts/index.js";
import { artifactModules as placementArtifactModules } from "../../artifacts/index.js";

/**
 * Defines placement-input admission from final physics artifacts and declared
 * engine surfaces, publishing input and wonder intent without mutating Civ7.
 */
export const DerivePlacementInputsStepContract = defineStep({
  id: "derive-placement-inputs",
  requires: [
    MAP_PROJECTION_EFFECT_TAGS.map.riversPlotted,
    STANDARD_ENGINE_EFFECT_TAGS.engine.featuresApplied,
  ],
  provides: [],
  artifacts: {
    requires: [
      morphologyArtifacts.topography,
      hydrologyHydrographyArtifacts.hydrography,
      hydrologyHydrographyArtifacts.riverNetworkMetrics,
      hydrologyHydrographyArtifacts.lakePlan,
      ecologyArtifacts.biomeClassification,
      ecologyArtifacts.biomeBindings,
      ecologyArtifacts.featureEngineSnapshot,
      ecologyArtifacts.pedology,
    ],
    provides: [
      placementArtifactModules.placementInputs,
      placementArtifactModules.naturalWonderPlan,
    ],
  },
  ops: {
    wonders: placement.ops.planWonders,
    naturalWonders: placement.ops.planNaturalWonders,
  },
  schema: Type.Object({}),
});
