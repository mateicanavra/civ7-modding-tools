import morphology from "@mapgen/domain/morphology";
import { createStage } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../../contract-manifest.js";
import { RoutingStep } from "./steps/routing/step.js";

function defaultEnvelope<const Strategy extends string>(
  operation: Readonly<{ defaultStrategy: Strategy }>,
  config: unknown
) {
  return { strategy: operation.defaultStrategy, config };
}

/**
 * Runs Morphology's pre-erosion flow proxy over current topography; canonical
 * climate-driven drainage remains a later Hydrology responsibility.
 */
export default createStage({
  id: "morphology-routing",
  steps: orderStandardStageSteps("morphology-routing", { routing: RoutingStep }),
  compile: () => ({
    routing: {
      routing: defaultEnvelope(morphology.ops.computeFlowRouting, {}),
    },
  }),
} as const);
