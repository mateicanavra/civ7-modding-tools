import ecology from "@mapgen/domain/ecology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
import {
  artifactModules as ecologyArtifactModules,
  artifacts as ecologyArtifacts,
} from "../../../ecology/artifacts/index.js";

/**
 * Defines the first ordered feature-family planner. It consumes shared scores and base
 * occupancy, then publishes floodplain intent plus the occupancy snapshot that gates ice
 * planning.
 */
const PlanFloodplainsStepContract = defineStep({
  id: "plan-floodplains",
  phase: "ecology",
  requires: [],
  provides: [],
  artifacts: {
    requires: [ecologyArtifacts.scoreLayers, ecologyArtifacts.occupancyBase],
    provides: [
      ecologyArtifactModules.featureIntentsFloodplains,
      ecologyArtifactModules.occupancyFloodplains,
    ],
  },
  ops: {
    planFloodplains: ecology.ops.planFloodplains,
  },
  schema: Type.Object(
    {},
    {
      description:
        "Deterministic floodplain-family planning. Consumes scoreLayers + occupancy and publishes floodplain intents + an updated occupancy snapshot.",
    }
  ),
});

export default PlanFloodplainsStepContract;
