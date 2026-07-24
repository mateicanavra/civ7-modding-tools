import ecology from "@mapgen/domain/ecology";
import { artifacts as pedologyArtifacts } from "@mapgen/domain/ecology/modules/pedology/artifacts/index.js";
import { artifacts as climateArtifacts } from "@mapgen/domain/hydrology/modules/climate/artifacts/index.js";
import { artifacts as morphologyLandformsArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
import { artifacts as morphologyErosionArtifacts } from "@mapgen/domain/morphology/modules/erosion/artifacts/index.js";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines soil and fertility classification from topography, substrate, and final climate.
 * The published pedology evidence is shared by biome classification and feature scoring rather
 * than recomputed in either consumer.
 */
export const PedologyStepContract = defineStep({
  id: "pedology",
  requires: [],
  provides: [],
  artifacts: {
    requires: [
      morphologyLandformsArtifacts.topography,
      morphologyErosionArtifacts.substrate,
      climateArtifacts.climateField,
    ],
    provides: [pedologyArtifacts.pedology],
  },
  ops: {
    classify: ecology.pedology.ops.classifyPedology,
  },
  schema: Type.Object(
    {},
    {
      description: "Configuration for classifying soils and fertility in the pedology step.",
    }
  ),
});
