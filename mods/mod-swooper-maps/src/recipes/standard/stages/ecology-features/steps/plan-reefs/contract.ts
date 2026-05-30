import { Type, defineStep } from "@swooper/mapgen-core/authoring";
import ecology from "@mapgen/domain/ecology";

import { ecologyArtifacts } from "../../../ecology/artifacts.js";

const PlanReefsStepContract = defineStep({
  id: "plan-reefs",
  phase: "ecology",
  requires: [],
  provides: [],
  artifacts: {
    requires: [ecologyArtifacts.scoreLayers, ecologyArtifacts.occupancyIce],
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

export default PlanReefsStepContract;

