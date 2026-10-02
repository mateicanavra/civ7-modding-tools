import { createStage } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../../contract-manifest.js";
import { PlotRiversStep } from "./steps/plot-rivers/step.js";

/** Projects the admitted river network without a second selection or configuration surface. */
export default createStage({
  id: "map-rivers",
  steps: orderStandardStageSteps("map-rivers", { "plot-rivers": PlotRiversStep }),
});
