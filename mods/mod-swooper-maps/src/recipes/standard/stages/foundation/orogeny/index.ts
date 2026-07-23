import { createStage } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../../contract-manifest.js";
import {
  compileFoundationOrogenyPublicConfig,
  type FoundationOrogenyPublicConfig,
  FoundationOrogenyPublicSchema,
} from "../public.config.js";
import { CrustEvolutionStep } from "./steps/crust-evolution/step.js";

/**
 * Compiles final crust-character controls into the crust-evolution boundary,
 * merging initial crust and tectonic history before Morphology consumes them.
 */
export default createStage({
  id: "foundation-orogeny",
  public: FoundationOrogenyPublicSchema,
  compile: ({ config }: { config: FoundationOrogenyPublicConfig }) =>
    compileFoundationOrogenyPublicConfig(config),
  steps: orderStandardStageSteps("foundation-orogeny", {
    "crust-evolution": CrustEvolutionStep,
  }),
} as const);
