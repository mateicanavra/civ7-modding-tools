import ecology from "@mapgen/domain/ecology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
import {
  artifactModules as ecologyArtifactModules,
  artifacts as ecologyArtifacts,
} from "../../../ecology/artifacts/index.js";
import { artifacts as hydrologyHydrographyArtifacts } from "../../../hydrology-hydrography/artifacts/index.js";
import { artifacts as morphologyArtifacts } from "../../../morphology/artifacts/index.js";

/**
 * Defines ordered wetland-family planning from habitat, hydrology, and post-reef occupancy. It
 * publishes wetland intent and the occupancy snapshot consumed by vegetation planning.
 */
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
    provides: [
      ecologyArtifactModules.featureIntentsWetlands,
      ecologyArtifactModules.occupancyWetlands,
    ],
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
