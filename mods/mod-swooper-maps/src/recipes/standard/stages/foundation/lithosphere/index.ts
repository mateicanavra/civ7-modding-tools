import { createStage } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../../contract-manifest.js";
import { CrustStep } from "./steps/crust/step.js";
import { PlateGraphStep } from "./steps/plate-graph/step.js";

/** Foundation / Lithosphere — initial crust + plate partition (the static plate structure). */
export default createStage({
  id: "foundation-lithosphere",
  steps: orderStandardStageSteps("foundation-lithosphere", {
    crust: CrustStep,
    "plate-graph": PlateGraphStep,
  }),
} as const);
