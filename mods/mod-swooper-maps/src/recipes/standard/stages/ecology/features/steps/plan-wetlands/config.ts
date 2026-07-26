import ecology from "@mapgen/domain/ecology";
import { artifacts as biomeArtifacts } from "@mapgen/domain/ecology/modules/biomes/artifacts/index.js";
import { artifacts as featureArtifacts } from "@mapgen/domain/ecology/modules/features/artifacts/index.js";
import { artifacts as hydrographyArtifacts } from "@mapgen/domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as morphologyLandformsArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
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
      biomeArtifacts.biomeClassification,
      featureArtifacts.scoreLayers,
      featureArtifacts.occupancyReefs,
      hydrographyArtifacts.hydrography,
      hydrographyArtifacts.lakePlan,
      morphologyLandformsArtifacts.topography,
      morphologyLandformsArtifacts.mountains,
      morphologyLandformsArtifacts.volcanoes,
    ],
    provides: [featureArtifacts.featureIntentsWetlands, featureArtifacts.occupancyWetlands],
  },
  ops: {
    planWetlands: ecology.features.ops.planWetlands,
  },
  schema: Type.Object(
    {},
    {
      description:
        "Deterministic wetlands-family planning. Consumes scoreLayers + occupancy and publishes wetland intents + an updated occupancy snapshot.",
    }
  ),
});
