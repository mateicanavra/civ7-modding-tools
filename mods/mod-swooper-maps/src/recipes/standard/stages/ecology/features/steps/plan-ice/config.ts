import ecology from "@mapgen/domain/ecology";
import { artifacts as biomeArtifacts } from "@mapgen/domain/ecology/modules/biomes/artifacts/index.js";
import { artifacts as featureArtifacts } from "@mapgen/domain/ecology/modules/features/artifacts/index.js";
import { artifacts as morphologyLandformsArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines ordered ice planning from Ecology scores, biome/topography truth, and
 * post-floodplain occupancy. It publishes intent and the next occupancy snapshot without
 * mutating Civ7 features.
 */
export const PlanIceStepContract = defineStep({
  id: "plan-ice",
  requires: [],
  provides: [],
  artifacts: {
    requires: [
      featureArtifacts.scoreLayers,
      featureArtifacts.occupancyFloodplains,
      biomeArtifacts.biomeClassification,
      morphologyLandformsArtifacts.topography,
    ],
    provides: [featureArtifacts.featureIntentsIce, featureArtifacts.occupancyIce],
  },
  ops: {
    planIce: ecology.features.ops.planIce,
  },
  schema: Type.Object(
    {},
    {
      description:
        "Deterministic ice planning. Consumes scoreLayers + occupancy and publishes ice intents + an updated occupancy snapshot.",
    }
  ),
});
