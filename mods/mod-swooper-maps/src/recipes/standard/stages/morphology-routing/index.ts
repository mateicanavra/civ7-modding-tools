import { createStage, Type } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../contract-manifest.js";
import { RoutingStep } from "./steps/routing/step.js";

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

/**
 * Runs Morphology's pre-erosion flow proxy over current topography; canonical
 * climate-driven drainage remains a later Hydrology responsibility.
 */
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
  steps: orderStandardStageSteps("morphology-routing", { routing: RoutingStep }),
  compile: () => ({
    routing: {
      routing: { strategy: "default", config: {} },
    },
  }),
} as const);
