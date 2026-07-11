import { createStage, Type } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../contract-manifest.js";
import {
  compileFoundationLithospherePublicConfig,
  FoundationLithospherePublicSchema,
} from "../foundation-public-config.js";
import { crust, plateGraph } from "./steps/index.js";

/** Foundation / Lithosphere — initial crust + plate partition (the static plate structure). */
export default createStage({
  id: "foundation-lithosphere",
  knobsSchema: Type.Object(
    {},
    {
      additionalProperties: false,
      description: "Foundation lithosphere has no stage-level knobs.",
    }
  ),
  public: FoundationLithospherePublicSchema,
  compile: ({ config }: { config: Record<string, unknown> }) =>
    compileFoundationLithospherePublicConfig(config),
  steps: orderStandardStageSteps("foundation-lithosphere", {
    crust,
    "plate-graph": plateGraph,
  }),
} as const);
