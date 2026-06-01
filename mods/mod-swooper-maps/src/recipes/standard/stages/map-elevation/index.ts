import { Type, createStage } from "@swooper/mapgen-core/authoring";
import { buildElevation } from "./steps/index.js";

/**
 * Engine elevation materialization stage.
 *
 * Civ7 shapes cliffs/shore relief from the terrain surface already in the
 * engine. This stage intentionally runs after static water projection so
 * buildElevation sees lakes as water, and before river modeling because the
 * engine river pass depends on finalized elevation.
 */
export default createStage({
  id: "map-elevation",
  knobsSchema: Type.Object({}, { additionalProperties: false }),
  steps: [buildElevation],
} as const);
