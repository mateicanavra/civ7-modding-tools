import ecology from "@mapgen/domain/ecology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
import {
  artifactModules as ecologyArtifactModules,
  artifacts as ecologyArtifacts,
} from "../../../ecology/artifacts/index.js";
import { artifacts as hydrologyHydrographyArtifacts } from "../../../hydrology-hydrography/artifacts/index.js";

/**
 * Defines ordered reef-family planning from score layers, lake truth, and post-ice occupancy.
 * It publishes reef intent and the next occupancy snapshot without mutating Civ7 features.
 */
export const PlanReefsStepContract = defineStep({
  id: "plan-reefs",
  requires: [],
  provides: [],
  artifacts: {
    requires: [
      ecologyArtifacts.scoreLayers,
      ecologyArtifacts.occupancyIce,
      hydrologyHydrographyArtifacts.lakePlan,
    ],
    provides: [ecologyArtifactModules.featureIntentsReefs, ecologyArtifactModules.occupancyReefs],
  },
  ops: {
    planReefs: ecology.ops.planReefs,
  },
  schema: Type.Object(
    {},
    {
      description:
        "Deterministic reef-family planning. Consumes scoreLayers + occupancy and publishes reef intents + an updated occupancy snapshot.",
    }
  ),
});
