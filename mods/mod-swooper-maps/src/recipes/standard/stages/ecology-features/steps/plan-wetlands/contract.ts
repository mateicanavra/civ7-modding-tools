import { Type, defineStep } from "@swooper/mapgen-core/authoring";
import ecology from "@mapgen/domain/ecology";

import { ecologyArtifacts } from "../../../ecology/artifacts.js";

const PlanWetlandsStepContract = defineStep({
  id: "plan-wetlands",
  phase: "ecology",
  requires: [],
  provides: [],
  artifacts: {
    requires: [ecologyArtifacts.scoreLayers, ecologyArtifacts.occupancyReefs],
    provides: [ecologyArtifacts.featureIntentsWetlands, ecologyArtifacts.occupancyWetlands],
  },
  ops: {
    planWetlands: ecology.ops.planWetlands,
  },
  schema: Type.Object(
    {},
    {
      description:
        "Deterministic wetlands-family planning. Consumes scoreLayers + occupancy and publishes wetland intents + an updated occupancy snapshot.",
    }
  ),
});

export default PlanWetlandsStepContract;

