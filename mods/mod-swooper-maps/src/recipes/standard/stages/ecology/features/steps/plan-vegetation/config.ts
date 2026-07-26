import ecology from "@mapgen/domain/ecology";
import { artifacts as biomeArtifacts } from "@mapgen/domain/ecology/modules/biomes/artifacts/index.js";
import { artifacts as featureArtifacts } from "@mapgen/domain/ecology/modules/features/artifacts/index.js";
import { artifacts as climateArtifacts } from "@mapgen/domain/hydrology/modules/climate/artifacts/index.js";
import { artifacts as hydrographyArtifacts } from "@mapgen/domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as morphologyLandformsArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines the final ordered Ecology family planner. It combines habitat truth with all admitted
 * upstream feature intents and publishes vegetation intent before projection.
 */
export const config = defineStep({
  id: "plan-vegetation",
  description: "Plans deterministic vegetation-family intent after all upstream feature intent.",
  requires: [],
  provides: [],
  artifacts: {
    requires: [
      biomeArtifacts.biomeClassification,
      featureArtifacts.featureSuitability,
      featureArtifacts.floodplainIntents,
      featureArtifacts.iceIntents,
      featureArtifacts.reefIntents,
      featureArtifacts.wetlandIntents,
      climateArtifacts.climateIndices,
      hydrographyArtifacts.hydrography,
      hydrographyArtifacts.lakePlan,
      morphologyLandformsArtifacts.topography,
      morphologyLandformsArtifacts.mountains,
      morphologyLandformsArtifacts.volcanoes,
    ],
    provides: [featureArtifacts.vegetationIntents],
  },
  ops: {
    planVegetation: ecology.features.ops.planVegetation,
  },
});
