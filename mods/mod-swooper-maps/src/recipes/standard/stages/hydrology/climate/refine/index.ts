import { createStage, Type } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../../../contract-manifest.js";
import { ClimateRefineStep } from "./steps/climate-refine/step.js";

const HydrologyDrynessKnobSchema = Type.Union(
  [Type.Literal("wet"), Type.Literal("mix"), Type.Literal("dry")],
  {
    default: "mix",
    description:
      "Global moisture availability preset (wet/mix/dry). Used to bias climate generation; does not directly tune canonical drainage routing or Hydrology river classification thresholds.",
  }
);

const HydrologyTemperatureKnobSchema = Type.Union(
  [Type.Literal("cold"), Type.Literal("temperate"), Type.Literal("hot")],
  {
    default: "temperate",
    description:
      "Global thermal preset (cold/temperate/hot). Used as a bias over the default temperature regime; influences cryosphere and evap/precip behavior.",
  }
);

const HydrologyCryosphereKnobSchema = Type.Union([Type.Literal("off"), Type.Literal("on")], {
  default: "on",
  description:
    'Cryosphere enablement ("on"|"off"). Controls bounded feedback and cryosphere artifacts; does not add compat paths.',
});

const knobsSchema = Type.Object(
  {
    /**
     * Global moisture availability bias (not regional).
     *
     * Stage scope:
     * - Transforms bounded precipitation-refinement deltas.
     * - Must not change baseline climate generation (that belongs to climate-baseline).
     */
    dryness: HydrologyDrynessKnobSchema,
    /**
     * Global thermal bias.
     *
     * Stage scope:
     * - Transforms the refined thermal regime over the defaulted baseline.
     */
    temperature: HydrologyTemperatureKnobSchema,
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
      "Hydrology climate-refine knobs (dryness/temperature/cryosphere). Knobs apply after defaulted refinement controls as deterministic transforms.",
  }
);

/**
 * Applies bounded precipitation, thermal, albedo, and cryosphere refinement in
 * the post-hydrography climate pass.
 */
export default createStage({
  id: "hydrology-climate-refine",
  knobsSchema,
  steps: orderStandardStageSteps("hydrology-climate-refine", {
    "climate-refine": ClimateRefineStep,
  }),
} as const);
