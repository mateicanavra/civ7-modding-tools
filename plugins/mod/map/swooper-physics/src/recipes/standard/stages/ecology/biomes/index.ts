import { createStage } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../../contract-manifest.js";
import { BiomesStep } from "./steps/biomes/step.js";

/**
 * Biome classification is its own truth stage because downstream feature and
 * projection stages consume the biome artifact as a stable ecology boundary.
 */
export default createStage({
  id: "ecology-biomes",
  steps: orderStandardStageSteps("ecology-biomes", { biomes: BiomesStep }),
} as const);
