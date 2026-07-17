import ecology from "@mapgen/domain/ecology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

import { artifacts as ecologyArtifacts } from "../../../ecology/artifacts/index.js";
import { artifacts as hydrologyClimateRefineArtifacts } from "../../../hydrology-climate-refine/artifacts/index.js";
import { artifacts as morphologyArtifacts } from "../../../morphology/artifacts/index.js";

/**
 * Defines the Ecology truth step that classifies biome and vegetation fields from refined
 * climate, pedology, and Morphology. It publishes biomeClassification once; engine biome IDs
 * remain a later map-ecology responsibility.
 */
const BiomesStepContract = defineStep({
  id: "biomes",
  phase: "ecology",
  requires: [],
  provides: [],
  artifacts: {
    requires: [
      hydrologyClimateRefineArtifacts.cryosphere,
      hydrologyClimateRefineArtifacts.climateIndices,
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

export default BiomesStepContract;
