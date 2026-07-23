import ecology, { artifacts as ecologyArtifacts } from "@mapgen/domain/ecology";
import { artifacts as hydrologyArtifacts } from "@mapgen/domain/hydrology";
import { artifacts as morphologyArtifacts } from "@mapgen/domain/morphology";
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
      morphologyArtifacts.topography,
      morphologyArtifacts.substrate,
      hydrologyArtifacts.climateField,
    ],
    provides: [ecologyArtifacts.pedology],
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
