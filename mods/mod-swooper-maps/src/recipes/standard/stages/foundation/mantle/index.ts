import { createStage } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../../contract-manifest.js";
import {
  compileFoundationMantlePublicConfig,
  FoundationMantlePublicSchema,
} from "../public.config.js";
import { MantleForcingStep } from "./steps/mantle-forcing/step.js";
import { MantlePotentialStep } from "./steps/mantle-potential/step.js";
import { MeshStep } from "./steps/mesh/step.js";

/** Foundation / Mantle — tectonic mesh + mantle-convection forcing field. */
export default createStage({
  id: "foundation-mantle",
  public: FoundationMantlePublicSchema,
  compile: ({ config }: { config: Record<string, unknown> }) =>
    compileFoundationMantlePublicConfig(config),
  steps: orderStandardStageSteps("foundation-mantle", {
    mesh: MeshStep,
    "mantle-potential": MantlePotentialStep,
    "mantle-forcing": MantleForcingStep,
  }),
} as const);
