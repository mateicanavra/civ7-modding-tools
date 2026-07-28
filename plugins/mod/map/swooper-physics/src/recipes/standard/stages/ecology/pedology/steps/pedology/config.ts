import ecology from "../../../../../../../domain/ecology/index.js";
import { artifacts as pedologyArtifacts } from "../../../../../../../domain/ecology/modules/pedology/artifacts/index.js";
import { artifacts as climateArtifacts } from "../../../../../../../domain/hydrology/modules/climate/artifacts/index.js";
import { artifacts as morphologyErosionArtifacts } from "../../../../../../../domain/morphology/modules/erosion/artifacts/index.js";
import { artifacts as morphologyLandformsArtifacts } from "../../../../../../../domain/morphology/modules/landforms/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines soil and fertility classification from topography, substrate, and final climate.
 * The published pedology evidence is shared by biome classification and feature scoring rather
 * than recomputed in either consumer.
 */
export const config = defineStep({
  id: "pedology",
  description: "Classifies soil and fertility from admitted topography, substrate, and climate.",
  requires: [
    morphologyLandformsArtifacts.topography,
    morphologyErosionArtifacts.substrate,
    climateArtifacts.climateField,
  ],
  provides: [pedologyArtifacts.pedology],

  ops: {
    classify: ecology.pedology.ops.classifyPedology,
  },
});
