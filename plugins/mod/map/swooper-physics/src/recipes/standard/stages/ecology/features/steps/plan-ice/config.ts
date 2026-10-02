import ecology from "../../../../../../../domain/ecology/index.js";
import { artifacts as featureArtifacts } from "../../../../../../../domain/ecology/modules/features/artifacts/index.js";
import { artifacts as morphologyErosionArtifacts } from "../../../../../../../domain/morphology/modules/erosion/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines ordered ice planning from external-water eligibility, Ecology suitability,
 * and admitted floodplain intents. It publishes ice intent without mutating Civ7 features.
 */
export const config = defineStep({
  id: "plan-ice",
  description: "Plans deterministic ice intent after admitted floodplain intent.",
  requires: [
    morphologyErosionArtifacts.topography,
    featureArtifacts.featureSuitability,
    featureArtifacts.floodplainIntents,
  ],
  provides: [featureArtifacts.iceIntents],

  ops: {
    planIce: ecology.features.ops.planIce,
  },
});
