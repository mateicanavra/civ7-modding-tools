import { createStage } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../../contract-manifest.js";
import { BuildElevationStep } from "./steps/build-elevation/step.js";

/**
 * Projects physical relief into Civ7's native elevation surface.
 *
 * Runs after accepted lakes so Civ7 can level their surfaces, then derives
 * cliffs from the authored heights before the existing river modeling pass.
 */
export default createStage({
  id: "map-elevation",
  steps: orderStandardStageSteps("map-elevation", {
    "build-elevation": BuildElevationStep,
  }),
} as const);
