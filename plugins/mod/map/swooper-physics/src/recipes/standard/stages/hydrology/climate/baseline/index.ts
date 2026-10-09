import { createStage, Type } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../../../contract-manifest.js";
import { ClimateBaselineStep } from "./steps/climate-baseline/step.js";

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

const HydrologySeasonalityKnobSchema = Type.Union(
  [Type.Literal("low"), Type.Literal("normal"), Type.Literal("high")],
  {
    default: "normal",
    description:
      "Seasonal cycle posture (low/normal/high). Applies as a deterministic transform over baseline climate parameters and published annual amplitude fields.",
  }
);

const HydrologyOceanCouplingKnobSchema = Type.Union(
  [Type.Literal("off"), Type.Literal("simple"), Type.Literal("earthlike")],
  {
    default: "earthlike",
    description:
      "Ocean influence preset (off/simple/earthlike). Applies as a deterministic transform over upstream winds and currents, not numerical moisture passes or independent coastal rainfall.",
  }
);

const knobsSchema = Type.Object(
  {
    /**
     * Global moisture availability bias (not regional).
     *
     * Stage scope:
     * - Multiplies external marine supply once, not extraction or publication.
     * - Must not change canonical drainage routing truth or Hydrology river classification knobs.
     */
    dryness: HydrologyDrynessKnobSchema,
    /**
     * Global thermal bias.
     *
     * Stage scope:
     * - Transforms baseline temperature regime and downstream evap/precip coupling inputs.
     * - Must not implement “compat” behavior; use semantic public controls for exact numeric control.
     */
    temperature: HydrologyTemperatureKnobSchema,
    /**
     * Seasonal cycle posture.
     *
     * Stage scope:
     * - Transforms wind texture, not independent precipitation noise.
     * - Transforms the annual amplitude posture (mode count / axial tilt biases).
     */
    seasonality: HydrologySeasonalityKnobSchema,
    /**
     * Ocean coupling posture.
     *
     * Stage scope:
     * - Transforms upstream winds and currents deterministically.
     */
    oceanCoupling: HydrologyOceanCouplingKnobSchema,
  },
  {
    description:
      "Hydrology climate-baseline knobs (dryness/temperature/seasonality/oceanCoupling). Knobs apply after defaulted climate controls as deterministic transforms.",
  }
);

/**
 * Publishes one shared baseline climate and wind vintage under the authored
 * moisture, temperature, seasonality, and ocean controls.
 */
export default createStage({
  id: "hydrology-climate-baseline",
  knobsSchema,
  steps: orderStandardStageSteps("hydrology-climate-baseline", {
    "climate-baseline": ClimateBaselineStep,
  }),
} as const);
