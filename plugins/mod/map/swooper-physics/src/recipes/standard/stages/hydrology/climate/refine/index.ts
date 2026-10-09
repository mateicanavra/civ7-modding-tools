import { createStage, Type } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../../../contract-manifest.js";
import { ClimateRefineStep } from "./steps/climate-refine/step.js";

const HydrologyCryosphereKnobSchema = Type.Union([Type.Literal("off"), Type.Literal("on")], {
  default: "on",
  description:
    'Cryosphere enablement ("on"|"off"). Controls bounded feedback and cryosphere artifacts; does not add compat paths.',
});

const knobsSchema = Type.Object(
  {
    /**
     * Cryosphere enablement.
     *
     * Stage scope:
     * - When off: disables bounded albedo feedback and disables cryosphere products deterministically.
     */
    cryosphere: HydrologyCryosphereKnobSchema,
  },
  {
    description:
      "Hydrology climate-refine cryosphere knob. Baseline owns atmospheric moisture supply and thermal forcing; refinement does not manufacture precipitation.",
  }
);

/**
 * Forwards atmospheric supply and applies bounded albedo and cryosphere refinement in
 * the post-hydrography climate pass.
 */
export default createStage({
  id: "hydrology-climate-refine",
  knobsSchema,
  steps: orderStandardStageSteps("hydrology-climate-refine", {
    "climate-refine": ClimateRefineStep,
  }),
} as const);
