import { Type, createStage } from "@swooper/mapgen-core/authoring";
import { climateBaseline } from "./steps/index.js";
import {
  HydrologyDrynessKnobSchema,
  HydrologyOceanCouplingKnobSchema,
  HydrologySeasonalityKnobSchema,
  HydrologyTemperatureKnobSchema,
} from "@mapgen/domain/hydrology/config.js";
import { HydrologyClimateBaselinePublicSchema } from "../hydrology-public-config.js";

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
  steps: [climateBaseline],
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
