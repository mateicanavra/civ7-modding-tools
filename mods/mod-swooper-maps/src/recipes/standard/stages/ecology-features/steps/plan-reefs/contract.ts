import ecology from "@mapgen/domain/ecology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

import { artifacts as ecologyArtifacts } from "../../../ecology/artifacts/index.js";
import { artifacts as hydrologyHydrographyArtifacts } from "../../../hydrology-hydrography/artifacts/index.js";

const PlanReefsStepContract = defineStep({
  id: "plan-reefs",
  phase: "ecology",
  requires: [],
  provides: [],
  artifacts: {
    requires: [
      ecologyArtifacts.scoreLayers,
      ecologyArtifacts.occupancyIce,
      hydrologyHydrographyArtifacts.lakePlan,
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

export default PlanReefsStepContract;
