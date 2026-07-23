import { createStage } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../../contract-manifest.js";
import {
  compileEcologyPedologyPublicConfig,
  EcologyPedologyPublicSchema,
} from "../public.config.js";
import { PedologyStep } from "./steps/pedology/step.js";

/**
 * Pedology owns stable soil truth before biome classification. Resource
 * planning consumes that truth later rather than maintaining a parallel
 * Ecology basin product with no downstream authority.
 */
export default createStage({
  id: "ecology-pedology",
  public: EcologyPedologyPublicSchema,
  steps: orderStandardStageSteps("ecology-pedology", {
    pedology: PedologyStep,
  }),
  compile: ({ config }: { config: Record<string, unknown> }) =>
    compileEcologyPedologyPublicConfig(config),
} as const);
