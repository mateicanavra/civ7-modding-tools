import ecology from "@mapgen/domain/ecology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

import { ecologyArtifacts } from "../../../ecology/artifacts.js";
import { hydrologyClimateRefineArtifacts } from "../../../hydrology-climate-refine/artifacts.js";
import { morphologyArtifacts } from "../../../morphology/artifacts.js";

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
