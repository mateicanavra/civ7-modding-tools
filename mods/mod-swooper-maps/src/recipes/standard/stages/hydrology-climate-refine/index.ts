import { createStage, Type } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../contract-manifest.js";
import { climateRefine } from "./steps/index.js";

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
     * - Transforms bounded refine deltas and diagnostics biases.
     * - Must not change baseline climate generation (that belongs to climate-baseline).
     */
    dryness: Type.Optional(HydrologyDrynessKnobSchema),
    /**
     * Global thermal bias.
     *
     * Stage scope:
     * - Transforms thermal regime over the defaulted baseline for refine/diagnostics.
     */
    temperature: Type.Optional(HydrologyTemperatureKnobSchema),
    /**
     * Cryosphere enablement.
     *
     * Stage scope:
     * - When off: disables bounded albedo feedback and disables cryosphere products deterministically.
     */
    cryosphere: Type.Optional(HydrologyCryosphereKnobSchema),
  },
  {
    description:
      "Hydrology climate-refine knobs (dryness/temperature/cryosphere). Knobs apply after defaulted refinement controls as deterministic transforms.",
  }
);

export default createStage({
  id: "hydrology-climate-refine",
  knobsSchema,
  steps: orderStandardStageSteps("hydrology-climate-refine", {
    "climate-refine": climateRefine,
  }),
} as const);
