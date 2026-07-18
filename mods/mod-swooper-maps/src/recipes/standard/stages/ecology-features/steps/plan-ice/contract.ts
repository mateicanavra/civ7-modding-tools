import ecology from "@mapgen/domain/ecology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
import {
  artifactModules as ecologyArtifactModules,
  artifacts as ecologyArtifacts,
} from "../../../ecology/artifacts/index.js";
import { artifacts as morphologyArtifacts } from "../../../morphology/artifacts/index.js";

/**
 * Defines ordered ice planning from Ecology scores, biome/topography truth, and
 * post-floodplain occupancy. It publishes intent and the next occupancy snapshot without
 * mutating Civ7 features.
 */
const PlanIceStepContract = defineStep({
  id: "plan-ice",
  phase: "ecology",
  requires: [],
  provides: [],
  artifacts: {
    requires: [
      ecologyArtifacts.scoreLayers,
      ecologyArtifacts.occupancyFloodplains,
      ecologyArtifacts.biomeClassification,
      morphologyArtifacts.topography,
    ],
    provides: [ecologyArtifactModules.featureIntentsIce, ecologyArtifactModules.occupancyIce],
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

export default PlanIceStepContract;
