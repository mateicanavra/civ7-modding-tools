import ecology from "@mapgen/domain/ecology";
import { artifacts as featureArtifacts } from "@mapgen/domain/ecology/modules/features/artifacts/index.js";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines the first ordered feature-family planner. It consumes shared scores and base
 * occupancy, then publishes floodplain intent plus the occupancy snapshot that gates ice
 * planning.
 */
export const config = defineStep({
  id: "plan-floodplains",
  requires: [],
  provides: [],
  artifacts: {
    requires: [featureArtifacts.scoreLayers, featureArtifacts.occupancyBase],
    provides: [featureArtifacts.featureIntentsFloodplains, featureArtifacts.occupancyFloodplains],
  },
  ops: {
    planFloodplains: ecology.features.ops.planFloodplains,
  },
  schema: Type.Object(
    {},
    {
      description:
        "Deterministic floodplain-family planning. Consumes scoreLayers + occupancy and publishes floodplain intents + an updated occupancy snapshot.",
    }
  ),
});
