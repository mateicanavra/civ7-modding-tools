import ecology, { artifacts as ecologyArtifacts } from "@mapgen/domain/ecology";
import { artifacts as hydrologyArtifacts } from "@mapgen/domain/hydrology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

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
      hydrologyArtifacts.lakePlan,
    ],
    provides: [ecologyArtifacts.featureIntentsReefs, ecologyArtifacts.occupancyReefs],
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
