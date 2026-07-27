import ecology from "@mapgen/domain/ecology";
import { artifacts as featureArtifacts } from "@mapgen/domain/ecology/modules/features/artifacts/index.js";
import { artifacts as hydrographyArtifacts } from "@mapgen/domain/hydrology/modules/hydrography/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines ordered reef-family planning from suitability, lake truth, and admitted upstream
 * feature intents. It publishes reef intent without mutating Civ7 features.
 */
export const config = defineStep({
  id: "plan-reefs",
  description: "Plans deterministic reef-family intent after floodplain and ice intent.",
  requires: [
    featureArtifacts.featureSuitability,
    featureArtifacts.floodplainIntents,
    featureArtifacts.iceIntents,
    hydrographyArtifacts.lakePlan,
  ],
  provides: [featureArtifacts.reefIntents],

  ops: {
    planReefs: ecology.features.ops.planReefs,
  },
});
