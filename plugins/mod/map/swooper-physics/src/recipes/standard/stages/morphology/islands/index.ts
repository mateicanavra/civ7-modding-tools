import { createStage } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../../contract-manifest.js";
import { IslandsStep } from "./steps/islands/step.js";
import { LandmassesStep } from "./steps/landmasses/step.js";

/** Final ground and marine landmass identity precede climate and basin formation. */
export default createStage({
  id: "morphology-islands",
  steps: orderStandardStageSteps("morphology-islands", {
    islands: IslandsStep,
    landmasses: LandmassesStep,
  }),
} as const);
