import { createStage } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../../contract-manifest.js";
import { CrustEvolutionStep } from "./steps/crust-evolution/step.js";

/**
 * Merges initial crust and tectonic history before Morphology consumes the final
 * crust-character evidence.
 */
export default createStage({
  id: "foundation-orogeny",
  steps: orderStandardStageSteps("foundation-orogeny", {
    "crust-evolution": CrustEvolutionStep,
  }),
} as const);
