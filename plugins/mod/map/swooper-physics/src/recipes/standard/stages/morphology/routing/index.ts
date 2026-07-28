import { createStage } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../../contract-manifest.js";
import { RoutingStep } from "./steps/routing/step.js";

/**
 * Runs Morphology's pre-erosion flow proxy over current topography; canonical
 * climate-driven drainage remains a later Hydrology responsibility.
 */
export default createStage({
  id: "morphology-routing",
  steps: orderStandardStageSteps("morphology-routing", { routing: RoutingStep }),
} as const);
