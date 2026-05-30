import { Type, createStage } from "@swooper/mapgen-core/authoring";
import pedology from "./steps/pedology/index.js";
import resourceBasins from "./steps/resource-basins/index.js";

/**
 * Pedology owns soil and resource-basin truth before biome classification.
 * Keeping these steps local to the stage prevents the old generic Ecology hub
 * from obscuring which truth stage owns the config and artifact lifecycle.
 */
export default createStage({
  id: "ecology-pedology",
  knobsSchema: Type.Object({}),
  steps: [pedology, resourceBasins],
} as const);
