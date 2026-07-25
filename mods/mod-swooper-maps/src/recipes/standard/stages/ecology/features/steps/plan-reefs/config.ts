import ecology from "@mapgen/domain/ecology";
import { artifacts as featureArtifacts } from "@mapgen/domain/ecology/modules/features/artifacts/index.js";
import { artifacts as hydrographyArtifacts } from "@mapgen/domain/hydrology/modules/hydrography/artifacts/index.js";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines ordered reef-family planning from score layers, lake truth, and post-ice occupancy.
 * It publishes reef intent and the next occupancy snapshot without mutating Civ7 features.
 */
export const config = defineStep({
  id: "plan-reefs",
  requires: [],
  provides: [],
  artifacts: {
    requires: [
      featureArtifacts.scoreLayers,
      featureArtifacts.occupancyIce,
      hydrographyArtifacts.lakePlan,
    ],
    provides: [featureArtifacts.featureIntentsReefs, featureArtifacts.occupancyReefs],
  },
  ops: {
    planReefs: ecology.features.ops.planReefs,
  },
  schema: Type.Object(
    {},
    {
      description:
        "Deterministic reef-family planning. Consumes scoreLayers + occupancy and publishes reef intents + an updated occupancy snapshot.",
    }
  ),
});
