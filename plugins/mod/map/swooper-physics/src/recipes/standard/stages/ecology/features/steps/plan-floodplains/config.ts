import ecology from "../../../../../../../domain/ecology/index.js";
import { artifacts as featureArtifacts } from "../../../../../../../domain/ecology/modules/features/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines the first ordered feature-family planner. It consumes shared suitability evidence,
 * then publishes the floodplain intents that gate ice planning.
 */
export const config = defineStep({
  id: "plan-floodplains",
  description: "Plans deterministic floodplain-family intent from shared suitability evidence.",
  requires: [featureArtifacts.featureSuitability],
  provides: [featureArtifacts.floodplainIntents],

  ops: {
    planFloodplains: ecology.features.ops.planFloodplains,
  },
});
