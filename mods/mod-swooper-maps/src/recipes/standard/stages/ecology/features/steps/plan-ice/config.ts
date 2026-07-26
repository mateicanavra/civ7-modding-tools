import ecology, { artifacts as ecologyArtifacts } from "@mapgen/domain/ecology";
import { artifacts as morphologyArtifacts } from "@mapgen/domain/morphology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines ordered ice planning from Ecology scores, biome/topography truth, and
 * post-floodplain occupancy. It publishes intent and the next occupancy snapshot without
 * mutating Civ7 features.
 */
export const PlanIceStepContract = defineStep({
  id: "plan-ice",
  requires: [],
  provides: [],
  artifacts: {
    requires: [
      ecologyArtifacts.scoreLayers,
      ecologyArtifacts.occupancyFloodplains,
      ecologyArtifacts.biomeClassification,
      morphologyArtifacts.topography,
    ],
    provides: [ecologyArtifacts.featureIntentsIce, ecologyArtifacts.occupancyIce],
  },
  ops: {
    planIce: ecology.ops.planIce,
  },
  schema: Type.Object(
    {},
    {
      description:
        "Deterministic ice planning. Consumes scoreLayers + occupancy and publishes ice intents + an updated occupancy snapshot.",
    }
  ),
});
