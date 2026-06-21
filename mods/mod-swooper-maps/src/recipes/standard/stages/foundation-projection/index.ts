import { FoundationPlateActivityKnobSchema } from "@mapgen/domain/foundation/config.js";
import { createStage, Type } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../contract-manifest.js";
import { plateTopology, projection } from "./steps/index.js";

/**
 * Foundation / Projection — resample mesh-space truth onto the Civ7 tile grid
 * (the cross-domain surface) + tile plate adjacency. Truth-space resampling: it
 * does not write engine terrain (that is the map-* stages).
 */
export default createStage({
  id: "foundation-projection",
  knobsSchema: Type.Object(
    { plateActivity: Type.Optional(FoundationPlateActivityKnobSchema) },
    {
      additionalProperties: false,
      description:
        "Projection lever: plateActivity (scales projected plate kinematics/boundaries).",
    }
  ),
  public: Type.Object(
    {},
    {
      additionalProperties: false,
      description: "Projection has no authored config (tuned via plateActivity).",
    }
  ),
  steps: orderStandardStageSteps("foundation-projection", {
    projection,
    "plate-topology": plateTopology,
  }),
  compile: () => ({ projection: {} }),
} as const);
