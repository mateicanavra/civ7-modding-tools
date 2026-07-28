import ecology from "../../../../../../../domain/ecology/index.js";
import { artifacts as featureArtifacts } from "../../../../../../../domain/ecology/modules/features/artifacts/index.js";
import { artifacts as hydrographyArtifacts } from "../../../../../../../domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as morphologyLandformsArtifacts } from "../../../../../../../domain/morphology/modules/landforms/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines ordered wetland-family planning from habitat, hydrology, and admitted upstream
 * feature intents. It publishes wetland intent for vegetation planning and projection.
 */
export const config = defineStep({
  id: "plan-wetlands",
  description: "Plans deterministic wetland-family intent after floodplain, ice, and reef intent.",
  requires: [
    featureArtifacts.featureSuitability,
    featureArtifacts.floodplainIntents,
    featureArtifacts.iceIntents,
    featureArtifacts.reefIntents,
    hydrographyArtifacts.hydrography,
    hydrographyArtifacts.lakePlan,
    morphologyLandformsArtifacts.topography,
    morphologyLandformsArtifacts.mountains,
    morphologyLandformsArtifacts.volcanoes,
  ],
  provides: [featureArtifacts.wetlandIntents],

  ops: {
    planWetlands: ecology.features.ops.planWetlands,
  },
});
