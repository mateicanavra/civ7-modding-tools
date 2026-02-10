import { Type, defineStep } from "@swooper/mapgen-core/authoring";
import ecology from "@mapgen/domain/ecology";

import { ecologyArtifacts } from "../../../ecology/artifacts.js";
import { morphologyArtifacts } from "../../../morphology/artifacts.js";

const PlanVegetationStepContract = defineStep({
  id: "plan-vegetation",
  phase: "ecology",
  requires: [],
  provides: [],
  artifacts: {
    requires: [ecologyArtifacts.scoreLayers, ecologyArtifacts.occupancyWetlands, morphologyArtifacts.topography],
    provides: [ecologyArtifacts.featureIntentsVegetation, ecologyArtifacts.occupancyVegetation],
  },
  ops: {
    planVegetation: ecology.ops.planVegetation,
  },
  schema: Type.Object(
    {},
    {
      description:
        "Deterministic vegetation-family planning. Consumes scoreLayers + occupancy and publishes vegetation intents + an updated occupancy snapshot.",
    }
  ),
});

export default PlanVegetationStepContract;

