import { Type, defineStep } from "@swooper/mapgen-core/authoring";
import ecology from "@mapgen/domain/ecology";

import { ecologyArtifacts } from "../../artifacts.js";
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
    {
    },
    {
      description:
        "Biome classification configuration.",
    }
  ),
});

export default BiomesStepContract;
