import { createStage } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../../contract-manifest.js";
import { MantleForcingStep } from "./steps/mantle-forcing/step.js";
import { MantlePotentialStep } from "./steps/mantle-potential/step.js";
import { MeshStep } from "./steps/mesh/step.js";

/** Foundation / Mantle — tectonic mesh + mantle-convection forcing field. */
export default createStage({
  id: "foundation-mantle",
  steps: orderStandardStageSteps("foundation-mantle", {
    mesh: MeshStep,
    "mantle-potential": MantlePotentialStep,
    "mantle-forcing": MantleForcingStep,
  }),
} as const);
