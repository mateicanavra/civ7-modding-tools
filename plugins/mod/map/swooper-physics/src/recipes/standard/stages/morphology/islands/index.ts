import { createStage } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../../contract-manifest.js";
import { IslandsStep } from "./steps/islands/step.js";

/** Final ground and initial wetness precede climate and basin formation. */
export default createStage({
  id: "morphology-islands",
  steps: orderStandardStageSteps("morphology-islands", {
    islands: IslandsStep,
  }),
} as const);
