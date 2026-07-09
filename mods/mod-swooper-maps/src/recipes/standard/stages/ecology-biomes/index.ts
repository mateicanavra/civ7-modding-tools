import { createStage, Type } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../contract-manifest.js";
import biomes from "./steps/biomes/index.js";

/**
 * Biome classification is its own truth stage because downstream feature and
 * projection stages consume the biome artifact as a stable ecology boundary.
 */
export default createStage({
  id: "ecology-biomes",
  knobsSchema: Type.Object(
    {},
    {
      additionalProperties: false,
      description:
        "Ecology-biomes currently has no stage-level knobs; authoring control lives in biome classification.",
    }
  ),
  steps: orderStandardStageSteps("ecology-biomes", { biomes }),
} as const);
