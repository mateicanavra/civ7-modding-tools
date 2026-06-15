import { createStage, Type } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../contract-manifest.js";
import { routing } from "./steps/index.js";

/**
 * Morphology-routing has no knobs today (reserved for basin/outlet expansions).
 */
const knobsSchema = Type.Object(
  {},
  {
    additionalProperties: false,
    description: "Morphology-routing has no authored routing controls today.",
  }
);

export default createStage({
  id: "morphology-routing",
  knobsSchema,
  public: Type.Object(
    {},
    {
      additionalProperties: false,
      description: "Morphology routing has no authored controls today.",
    }
  ),
  steps: orderStandardStageSteps("morphology-routing", { routing }),
  compile: () => ({
    routing: {
      routing: { strategy: "default", config: {} },
    },
  }),
} as const);
