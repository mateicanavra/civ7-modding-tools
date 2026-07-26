import ecology from "@mapgen/domain/ecology";
import { artifacts as featureArtifacts } from "@mapgen/domain/ecology/modules/features/artifacts/index.js";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines the first ordered feature-family planner. It consumes shared suitability evidence,
 * then publishes the floodplain intents that gate ice planning.
 */
export const config = defineStep({
  id: "plan-floodplains",
  requires: [],
  provides: [],
  artifacts: {
    requires: [featureArtifacts.featureSuitability],
    provides: [featureArtifacts.floodplainIntents],
  },
  ops: {
    planFloodplains: ecology.features.ops.planFloodplains,
  },
  schema: Type.Object(
    {},
    {
      description: "Deterministic floodplain-family planning from shared suitability evidence.",
    }
  ),
});
