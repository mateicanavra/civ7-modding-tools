import { createStage, Type } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../contract-manifest.js";
import {
  compileFoundationLithospherePublicConfig,
  FoundationLithospherePublicSchema,
} from "../foundation-public-config.js";
import { crust, plateGraph } from "./steps/index.js";

const FoundationPlateCountKnobSchema = Type.Integer({
  minimum: 2,
  maximum: 256,
  description:
    "Plate count target (integer >= 2). Used as the authored baseline for plate discretization.",
});

/** Foundation / Lithosphere — initial crust + plate partition (the static plate structure). */
export default createStage({
  id: "foundation-lithosphere",
  knobsSchema: Type.Object(
    { plateCount: Type.Optional(FoundationPlateCountKnobSchema) },
    {
      additionalProperties: false,
      description:
        "Lithosphere lever: plateCount (partition count; also set on foundation-mantle).",
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
