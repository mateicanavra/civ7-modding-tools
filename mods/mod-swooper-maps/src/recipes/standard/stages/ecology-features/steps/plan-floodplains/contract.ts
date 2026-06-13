import { Type, defineStep } from "@swooper/mapgen-core/authoring";
import ecology from "@mapgen/domain/ecology";

import { ecologyArtifacts } from "../../../ecology/artifacts.js";

const PlanFloodplainsStepContract = defineStep({
  id: "plan-floodplains",
  phase: "ecology",
  requires: [],
  provides: [],
  artifacts: {
    requires: [ecologyArtifacts.scoreLayers, ecologyArtifacts.occupancyBase],
    provides: [ecologyArtifacts.featureIntentsFloodplains, ecologyArtifacts.occupancyFloodplains],
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
