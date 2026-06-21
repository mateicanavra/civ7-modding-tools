import { createStage, Type } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../contract-manifest.js";
import { crustEvolution } from "./steps/index.js";

/** Foundation / Crust — final crust from initial crust + tectonic history (the merge stage). */
export default createStage({
  id: "foundation-crust",
  knobsSchema: Type.Object(
    {},
    {
      additionalProperties: false,
      description: "Crust has no knobs; evolution follows tectonic history.",
    }
  ),
  public: Type.Object(
    {},
    { additionalProperties: false, description: "Crust has no authored config." }
  ),
  steps: orderStandardStageSteps("foundation-crust", {
    "crust-evolution": crustEvolution,
  }),
  compile: () => ({}),
} as const);
