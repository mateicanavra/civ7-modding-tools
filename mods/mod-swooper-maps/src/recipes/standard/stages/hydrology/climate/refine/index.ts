import hydrology from "@mapgen/domain/hydrology";
import { createStage, Type } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../../../contract-manifest.js";
import { HydrologyClimateRefinePublicSchema } from "../../public.config.js";
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
     * - Transforms bounded refine deltas and diagnostics biases.
     * - Must not change baseline climate generation (that belongs to climate-baseline).
     */
    dryness: HydrologyDrynessKnobSchema,
    /**
     * Global thermal bias.
     *
     * Stage scope:
     * - Transforms thermal regime over the defaulted baseline for refine/diagnostics.
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

function defaultEnvelope<const Strategy extends string>(
  operation: Readonly<{ defaultStrategy: Strategy }>,
  config: unknown
) {
  return { strategy: operation.defaultStrategy, config };
}

/**
 * Compiles bounded precipitation, thermal, albedo, and cryosphere refinement
 * controls into the post-hydrography climate diagnostic pass.
 */
export default createStage({
  id: "hydrology-climate-refine",
  knobsSchema,
  public: HydrologyClimateRefinePublicSchema,
  steps: orderStandardStageSteps("hydrology-climate-refine", {
    "climate-refine": ClimateRefineStep,
  }),
  compile: ({ config }: { config: Record<string, unknown> }) => ({
    "climate-refine": {
      computePrecipitation: {
        strategy: "refine",
        config: config.precipitationRefinement,
      },
      computeRadiativeForcing: defaultEnvelope(
        hydrology.ops.computeRadiativeForcing,
        config.solarForcing
      ),
      computeThermalState: defaultEnvelope(hydrology.ops.computeThermalState, config.thermalState),
      applyAlbedoFeedback: defaultEnvelope(
        hydrology.ops.applyAlbedoFeedback,
        config.albedoFeedback
      ),
      computeCryosphereState: defaultEnvelope(
        hydrology.ops.computeCryosphereState,
        config.cryosphereState
      ),
      computeLandWaterBudget: defaultEnvelope(
        hydrology.ops.computeLandWaterBudget,
        config.landWaterBudget
      ),
      computeClimateDiagnostics: defaultEnvelope(
        hydrology.ops.computeClimateDiagnostics,
        config.diagnostics
      ),
    },
  }),
} as const);
