import { createStage, Type } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../contract-manifest.js";
import {
  compileFoundationMantlePublicConfig,
  FoundationMantlePublicSchema,
} from "../foundation-public-config.js";
import { mantleForcing, mantlePotential, mesh } from "./steps/index.js";

/** Foundation / Mantle — tectonic mesh + mantle-convection forcing field. */
export default createStage({
  id: "foundation-mantle",
  knobsSchema: Type.Object(
    {},
    {
      additionalProperties: false,
      description: "Foundation mantle has no stage-level knobs.",
    }
  ),
  public: FoundationMantlePublicSchema,
  compile: ({ config }: { config: Record<string, unknown> }) =>
    compileFoundationMantlePublicConfig(config),
  steps: orderStandardStageSteps("foundation-mantle", {
    mesh,
    "mantle-potential": mantlePotential,
    "mantle-forcing": mantleForcing,
  }),
} as const);
