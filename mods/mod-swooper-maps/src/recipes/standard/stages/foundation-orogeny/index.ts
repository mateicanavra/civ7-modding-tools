import { createStage, Type } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../contract-manifest.js";
import { crustEvolution } from "./steps/index.js";

/** Foundation / Orogeny — final crust from initial crust + tectonic history (the merge stage). */
export default createStage({
  id: "foundation-orogeny",
  knobsSchema: Type.Object(
    {},
    {
      additionalProperties: false,
      description: "Orogeny has no knobs; crust evolution follows the tectonic history.",
    }
  ),
  public: Type.Object(
    {},
    { additionalProperties: false, description: "Orogeny has no authored config." }
  ),
  steps: orderStandardStageSteps("foundation-orogeny", {
    "crust-evolution": crustEvolution,
  }),
  compile: () => ({}),
} as const);
