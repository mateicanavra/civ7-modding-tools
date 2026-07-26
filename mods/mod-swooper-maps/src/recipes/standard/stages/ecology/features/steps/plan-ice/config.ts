import ecology from "@mapgen/domain/ecology";
import { artifacts as featureArtifacts } from "@mapgen/domain/ecology/modules/features/artifacts/index.js";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines ordered ice planning from Ecology suitability evidence and admitted floodplain
 * intents. It publishes ice intent without mutating Civ7 features.
 */
export const config = defineStep({
  id: "plan-ice",
  requires: [],
  provides: [],
  artifacts: {
    requires: [featureArtifacts.featureSuitability, featureArtifacts.floodplainIntents],
    provides: [featureArtifacts.iceIntents],
  },
  ops: {
    planIce: ecology.features.ops.planIce,
  },
  schema: Type.Object(
    {},
    {
      description: "Deterministic ice planning after admitted floodplain intents.",
    }
  ),
});
