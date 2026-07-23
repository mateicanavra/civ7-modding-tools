import ecology, {
  artifactModules as ecologyArtifactModules,
  artifacts as ecologyArtifacts,
} from "@mapgen/domain/ecology";
import { artifacts as hydrologyHydrographyArtifacts } from "@mapgen/domain/hydrology";
import { artifacts as morphologyArtifacts } from "@mapgen/domain/morphology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines ordered wetland-family planning from habitat, hydrology, and post-reef occupancy. It
 * publishes wetland intent and the occupancy snapshot consumed by vegetation planning.
 */
export const PlanWetlandsStepContract = defineStep({
  id: "plan-wetlands",
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
