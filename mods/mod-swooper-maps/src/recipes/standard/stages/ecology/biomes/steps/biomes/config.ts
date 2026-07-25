import ecology from "@mapgen/domain/ecology";
import { artifacts as biomeArtifacts } from "@mapgen/domain/ecology/modules/biomes/artifacts/index.js";
import { artifacts as pedologyArtifacts } from "@mapgen/domain/ecology/modules/pedology/artifacts/index.js";
import { artifacts as climateArtifacts } from "@mapgen/domain/hydrology/modules/climate/artifacts/index.js";
import { artifacts as cryosphereArtifacts } from "@mapgen/domain/hydrology/modules/cryosphere/artifacts/index.js";
import { artifacts as morphologyLandformsArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines the Ecology truth step that classifies biome and vegetation fields from refined
 * climate, pedology, and Morphology. It publishes biomeClassification once; engine biome IDs
 * remain a later map-ecology responsibility.
 */
export const config = defineStep({
  id: "biomes",
  requires: [],
  provides: [],
  artifacts: {
    requires: [
      cryosphereArtifacts.cryosphere,
      climateArtifacts.climateIndices,
      morphologyLandformsArtifacts.topography,
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
