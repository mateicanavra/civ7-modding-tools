import ecology from "@mapgen/domain/ecology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
import { artifactModules as ecologyArtifactModules } from "../../../ecology/artifacts/index.js";
import { artifacts as hydrologyClimateRefineArtifacts } from "../../../hydrology-climate-refine/artifacts/index.js";
import { artifacts as morphologyArtifacts } from "../../../morphology/artifacts/index.js";

/**
 * Defines soil and fertility classification from topography, substrate, and final climate.
 * The published pedology evidence is shared by biome and resource-basin work rather than
 * recomputed in either consumer.
 */
export const PedologyStepContract = defineStep({
  id: "pedology",
  requires: [],
  provides: [],
  artifacts: {
    requires: [
      morphologyArtifacts.topography,
      morphologyArtifacts.substrate,
      hydrologyClimateRefineArtifacts.climateField,
    ],
    provides: [ecologyArtifactModules.pedology],
  },
  ops: {
    classify: ecology.ops.classifyPedology,
  },
  schema: Type.Object(
    {},
    {
      description: "Configuration for classifying soils and fertility in the pedology step.",
    }
  ),
});
