import ecology from "@mapgen/domain/ecology";
import { artifacts as featureArtifacts } from "@mapgen/domain/ecology/modules/features/artifacts/index.js";
import { artifacts as hydrographyArtifacts } from "@mapgen/domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as morphologyLandformsArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines ordered wetland-family planning from habitat, hydrology, and admitted upstream
 * feature intents. It publishes wetland intent for vegetation planning and projection.
 */
export const config = defineStep({
  id: "plan-wetlands",
  requires: [],
  provides: [],
  artifacts: {
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
  },
  ops: {
    planWetlands: ecology.features.ops.planWetlands,
  },
  schema: Type.Object(
    {},
    {
      description:
        "Deterministic wetland-family planning after admitted floodplain, ice, and reef intents.",
    }
  ),
});
