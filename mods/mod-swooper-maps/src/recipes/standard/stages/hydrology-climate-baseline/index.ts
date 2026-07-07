import { createStage, Type } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../contract-manifest.js";
import { HydrologyClimateBaselinePublicSchema } from "../hydrology-public-config.js";
import { climateBaseline } from "./steps/index.js";

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
      "Ocean influence preset (off/simple/earthlike). Applies as a deterministic transform over winds, currents, moisture transport, and coastal gradients.",
  }
);

const knobsSchema = Type.Object(
  {
    /**
     * Global moisture availability bias (not regional).
     *
     * Stage scope:
     * - Transforms baseline rainfall/moisture and related forcing only.
     * - Must not change canonical drainage routing truth or Hydrology river classification knobs.
     */
    dryness: Type.Optional(HydrologyDrynessKnobSchema),
    /**
     * Global thermal bias.
     *
     * Stage scope:
     * - Transforms baseline temperature regime and downstream evap/precip coupling inputs.
     * - Must not implement “compat” behavior; use semantic public controls for exact numeric control.
     */
    temperature: Type.Optional(HydrologyTemperatureKnobSchema),
    /**
     * Seasonal cycle posture.
     *
     * Stage scope:
     * - Transforms wind texture + precip noise texture.
     * - Transforms the annual amplitude posture (mode count / axial tilt biases).
     */
    seasonality: Type.Optional(HydrologySeasonalityKnobSchema),
    /**
     * Ocean coupling posture.
     *
     * Stage scope:
     * - Transforms winds/currents/transport and coastal gradients deterministically.
     */
    oceanCoupling: Type.Optional(HydrologyOceanCouplingKnobSchema),
  },
  {
    description:
      "Hydrology climate-baseline knobs (dryness/temperature/seasonality/oceanCoupling). Knobs apply after defaulted climate controls as deterministic transforms.",
  }
);

export default createStage({
  id: "hydrology-climate-baseline",
  knobsSchema,
  public: HydrologyClimateBaselinePublicSchema,
  steps: orderStandardStageSteps("hydrology-climate-baseline", {
    "climate-baseline": climateBaseline,
  }),
  compile: ({ config }: { config: Record<string, unknown> }) => ({
    "climate-baseline": {
      seasonality: config.seasonalCycle ?? {},
      computeRadiativeForcing: { strategy: "default", config: config.solarForcing ?? {} },
      computeThermalState: { strategy: "default", config: config.thermalState ?? {} },
      computeAtmosphericCirculation: {
        strategy: "default",
        config: config.atmosphericCirculation ?? {},
      },
      computeOceanSurfaceCurrents: { strategy: "default", config: config.oceanCurrents ?? {} },
      computeOceanGeometry: { strategy: "default", config: config.oceanGeometry ?? {} },
      computeOceanThermalState: { strategy: "default", config: config.oceanThermalState ?? {} },
      computeEvaporationSources: { strategy: "default", config: config.evaporation ?? {} },
      transportMoisture: { strategy: "default", config: config.moistureTransport ?? {} },
      computePrecipitation: { strategy: "default", config: config.precipitation ?? {} },
    },
  }),
} as const);
