import ecology from "@mapgen/domain/ecology";
import { artifacts as biomeArtifacts } from "@mapgen/domain/ecology/modules/biomes/artifacts/index.js";
import { artifacts as pedologyArtifacts } from "@mapgen/domain/ecology/modules/pedology/artifacts/index.js";
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
      pedologyArtifacts.pedology,
    ],
    provides: [biomeArtifacts.biomeClassification],
  },
  ops: {
    classify: ecology.biomes.ops.classifyBiomes,
  },
  schema: Type.Object(
    {},
    {
      description: "Biome classification configuration.",
    }
  ),
});
