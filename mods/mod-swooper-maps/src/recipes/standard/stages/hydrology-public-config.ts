import hydrology from "@mapgen/domain/hydrology";
import { type TSchema, Type } from "typebox";

function publicStrategySchema<T extends TSchema>(schema: T, description: string) {
  return Type.With(schema, { description });
}

const baselineOps = hydrology.ops;

/**
 * Author-facing seasonal sampling and axial-tilt controls shared by baseline climate fields and
 * their amplitude artifact.
 */
export const HydrologySeasonalCycleSchema = Type.Object(
  {
    modeCount: Type.Union([Type.Literal(2), Type.Literal(4)], {
      default: 2,
      description:
        "Controls seasonal climate samples used to compute annual means and amplitude fields.",
    }),
    axialTiltDeg: Type.Number({
      default: 18,
      minimum: 0,
      maximum: 45,
      description:
        "Controls axial tilt in degrees for seasonal climate forcing; 0 disables seasonal amplitudes.",
    }),
  },
  {
    additionalProperties: false,
    description: "Seasonal-cycle controls for annual climate means and amplitude fields.",
  }
);

/**
 * Author-facing baseline-climate controls for solar forcing, thermal state, circulation, ocean
 * coupling, evaporation, moisture transport, and precipitation.
 */
export const HydrologyClimateBaselinePublicSchema = Type.Object(
  {
    seasonalCycle: HydrologySeasonalCycleSchema,
    solarForcing: publicStrategySchema(
      baselineOps.computeRadiativeForcing.strategies.default,
      "Baseline solar-forcing controls for Hydrology climate generation."
    ),
    thermalState: publicStrategySchema(
      baselineOps.computeThermalState.strategies.default,
      "Baseline thermal-state controls for Hydrology climate generation."
    ),
    atmosphericCirculation: publicStrategySchema(
      baselineOps.computeAtmosphericCirculation.strategies.default,
      "Baseline atmospheric-circulation controls for Hydrology climate generation."
    ),
    oceanCurrents: publicStrategySchema(
      baselineOps.computeOceanSurfaceCurrents.strategies.default,
      "Baseline ocean-current controls for Hydrology climate generation."
    ),
    oceanGeometry: publicStrategySchema(
      baselineOps.computeOceanGeometry.strategies.default,
      "Baseline ocean-geometry controls for Hydrology climate generation."
    ),
    oceanThermalState: publicStrategySchema(
      baselineOps.computeOceanThermalState.strategies.default,
      "Baseline ocean thermal-state controls for Hydrology climate generation."
    ),
    evaporation: publicStrategySchema(
      baselineOps.computeEvaporationSources.strategies.default,
      "Baseline evaporation-source controls for Hydrology climate generation."
    ),
    moistureTransport: publicStrategySchema(
      baselineOps.transportMoisture.strategies.default,
      "Baseline moisture-transport controls for Hydrology climate generation."
    ),
    precipitation: publicStrategySchema(
      baselineOps.computePrecipitation.strategies.default,
      "Baseline precipitation controls for Hydrology climate generation."
    ),
  },
  {
    additionalProperties: false,
    description:
      "Hydrology baseline climate controls for solar forcing, temperature, wind, ocean coupling, evaporation, moisture transport, and precipitation.",
  }
);

/** Author-facing runoff, river-network, and deterministic lake-intent controls. */
export const HydrologyHydrographyPublicSchema = Type.Object(
  {
    drainageRouting: publicStrategySchema(
      baselineOps.computeDrainageRouting.strategies.default,
      "Hydrography drainage-routing controls."
    ),
    runoff: publicStrategySchema(
      baselineOps.accumulateDischarge.strategies.default,
      "Hydrography runoff and discharge controls."
    ),
    riverNetwork: publicStrategySchema(
      baselineOps.projectRiverNetwork.strategies.default,
      "Hydrography river-network classification controls."
    ),
    lakes: publicStrategySchema(
      baselineOps.planLakes.strategies.default,
      "Hydrography lake-intent controls."
    ),
  },
  {
    additionalProperties: false,
    description:
      "Hydrology hydrography controls for runoff, river classification, and deterministic lake intent.",
  }
);

/**
 * Author-facing controls for the post-hydrography climate refinement that incorporates terrain,
 * freshwater, and cryosphere feedback.
 */
export const HydrologyClimateRefinePublicSchema = Type.Object(
  {
    precipitationRefinement: publicStrategySchema(
      baselineOps.computePrecipitation.strategies.refine,
      "Climate-refinement precipitation controls."
    ),
    solarForcing: publicStrategySchema(
      baselineOps.computeRadiativeForcing.strategies.default,
      "Climate-refinement solar-forcing controls."
    ),
    thermalState: publicStrategySchema(
      baselineOps.computeThermalState.strategies.default,
      "Climate-refinement thermal-state controls."
    ),
    albedoFeedback: publicStrategySchema(
      baselineOps.applyAlbedoFeedback.strategies.default,
      "Climate-refinement albedo-feedback controls."
    ),
    cryosphereState: publicStrategySchema(
      baselineOps.computeCryosphereState.strategies.default,
      "Climate-refinement cryosphere-state controls."
    ),
    landWaterBudget: publicStrategySchema(
      baselineOps.computeLandWaterBudget.strategies.default,
      "Climate-refinement land-water-budget controls."
    ),
    diagnostics: publicStrategySchema(
      baselineOps.computeClimateDiagnostics.strategies.default,
      "Climate-refinement diagnostic controls."
    ),
  },
  {
    additionalProperties: false,
    description:
      "Hydrology climate refinement controls for local precipitation, temperature feedback, cryosphere, water budget, and diagnostics.",
  }
);
