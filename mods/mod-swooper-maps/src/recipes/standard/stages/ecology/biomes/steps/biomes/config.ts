import ecology, { artifacts as ecologyArtifacts } from "@mapgen/domain/ecology";
import { artifacts as hydrologyArtifacts } from "@mapgen/domain/hydrology";
import { artifacts as morphologyArtifacts } from "@mapgen/domain/morphology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines the Ecology truth step that classifies biome and vegetation fields from refined
 * climate, pedology, and Morphology. It publishes biomeClassification once; engine biome IDs
 * remain a later map-ecology responsibility.
 */
export const BiomesStepContract = defineStep({
  id: "biomes",
  requires: [],
  provides: [],
  artifacts: {
    requires: [
      hydrologyArtifacts.cryosphere,
      hydrologyArtifacts.climateIndices,
      morphologyArtifacts.topography,
      ecologyArtifacts.pedology,
    ],
    provides: [ecologyArtifacts.biomeClassification],
  },
  ops: {
    classify: ecology.ops.classifyBiomes,
  },
  schema: Type.Object(
    {},
    {
      description: "Biome classification configuration.",
    }
  ),
});
