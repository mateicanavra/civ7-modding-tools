import {
  HydrologyCryosphereKnobSchema,
  HydrologyDrynessKnobSchema,
  HydrologyTemperatureKnobSchema,
} from "@mapgen/domain/hydrology/config.js";
import { createStage, Type } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../contract-manifest.js";
import { HydrologyClimateRefinePublicSchema } from "../hydrology-public-config.js";
import { climateRefine } from "./steps/index.js";

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
  public: HydrologyClimateRefinePublicSchema,
  steps: orderStandardStageSteps("hydrology-climate-refine", {
    "climate-refine": climateRefine,
  }),
  compile: ({ config }: { config: Record<string, unknown> }) => ({
    "climate-refine": {
      computePrecipitation: {
        strategy: "refine",
        config: config.precipitationRefinement ?? {},
      },
      computeRadiativeForcing: { strategy: "default", config: config.solarForcing ?? {} },
      computeThermalState: { strategy: "default", config: config.thermalState ?? {} },
      applyAlbedoFeedback: { strategy: "default", config: config.albedoFeedback ?? {} },
      computeCryosphereState: { strategy: "default", config: config.cryosphereState ?? {} },
      computeLandWaterBudget: { strategy: "default", config: config.landWaterBudget ?? {} },
      computeClimateDiagnostics: { strategy: "default", config: config.diagnostics ?? {} },
    },
  }),
} as const);
