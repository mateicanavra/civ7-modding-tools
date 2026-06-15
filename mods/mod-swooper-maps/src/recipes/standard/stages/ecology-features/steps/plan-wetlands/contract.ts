import ecology from "@mapgen/domain/ecology/contract";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

import { ecologyArtifacts } from "../../../ecology/artifacts.js";
import { hydrologyHydrographyArtifacts } from "../../../hydrology-hydrography/artifacts.js";
import { morphologyArtifacts } from "../../../morphology/artifacts.js";

const PlanWetlandsStepContract = defineStep({
  id: "plan-wetlands",
  phase: "ecology",
  requires: [],
  provides: [],
  artifacts: {
    requires: [
      ecologyArtifacts.biomeClassification,
      ecologyArtifacts.scoreLayers,
      ecologyArtifacts.occupancyReefs,
      hydrologyHydrographyArtifacts.hydrography,
      hydrologyHydrographyArtifacts.lakePlan,
      morphologyArtifacts.topography,
      morphologyArtifacts.mountains,
      morphologyArtifacts.volcanoes,
    ],
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
