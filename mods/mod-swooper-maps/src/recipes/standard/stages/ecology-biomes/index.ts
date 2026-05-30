import { Type, createStage } from "@swooper/mapgen-core/authoring";
import biomes from "./steps/biomes/index.js";

/**
 * Biome classification is its own truth stage because downstream feature and
 * projection stages consume the biome artifact as a stable ecology boundary.
 */
export default createStage({
  id: "ecology-biomes",
  knobsSchema: Type.Object({}),
  steps: [biomes],
} as const);
