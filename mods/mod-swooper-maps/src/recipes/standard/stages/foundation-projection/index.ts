import { createStage, Type } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../contract-manifest.js";
import { PlateTopologyStep } from "./steps/plate-topology/step.js";
import { ProjectionStep } from "./steps/projection/step.js";

/**
 * Foundation / Projection — resample mesh-space truth onto the Civ7 tile grid
 * (the cross-domain surface) + tile plate adjacency. Truth-space resampling: it
 * does not write engine terrain (that is the map-* stages).
 */
export default createStage({
  id: "foundation-projection",
  knobsSchema: Type.Object(
    {},
    {
      additionalProperties: false,
      description:
        "Projection has no knobs; it materializes the tectonic truth faithfully (plate activity is a foundation-tectonics knob).",
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
    projection: ProjectionStep,
    "plate-topology": PlateTopologyStep,
  }),
  compile: () => ({ projection: {} }),
} as const);
