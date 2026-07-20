import { createStage, Type } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../contract-manifest.js";
import {
  compileFoundationOrogenyPublicConfig,
  type FoundationOrogenyPublicConfig,
  FoundationOrogenyPublicSchema,
} from "../foundation-public-config.js";
import { crustEvolution } from "./steps/index.js";

export default createStage({
  id: "foundation-orogeny",
  knobsSchema: Type.Object(
    {},
    {
      additionalProperties: false,
      description: "Foundation orogeny has no stage-level knobs.",
    }
  ),
  public: FoundationOrogenyPublicSchema,
  compile: ({ config }: { config: FoundationOrogenyPublicConfig }) =>
    compileFoundationOrogenyPublicConfig(config),
  steps: orderStandardStageSteps("foundation-orogeny", {
    "crust-evolution": crustEvolution,
  }),
} as const);
