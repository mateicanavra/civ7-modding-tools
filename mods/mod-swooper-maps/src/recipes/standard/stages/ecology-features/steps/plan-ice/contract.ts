import ecology from "@mapgen/domain/ecology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring";

import { ecologyArtifacts } from "../../../ecology/artifacts.js";
import { morphologyArtifacts } from "../../../morphology/artifacts.js";

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

export default PlanIceStepContract;
