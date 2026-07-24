import hydrology from "@mapgen/domain/hydrology";
import { type TSchema, Type } from "typebox";

function publicStrategySchema<T extends TSchema>(schema: T, description: string) {
  return Type.With(schema, { description });
}

const climateOps = hydrology.climate.ops;
const cryosphereOps = hydrology.cryosphere.ops;
const hydrographyOps = hydrology.hydrography.ops;
const oceanOps = hydrology.ocean.ops;

/**
 * Author-facing seasonal sampling and axial-tilt controls shared by baseline climate fields and
 * their amplitude artifact.
 */
const HydrologySeasonalCycleSchema = Type.Object(
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
      climateOps.computeRadiativeForcing.strategies["latitude-insolation"].config,
      "Baseline solar-forcing controls for Hydrology climate generation."
    ),
    thermalState: publicStrategySchema(
      climateOps.computeThermalState.strategies["insolation-lapse-rate"].config,
      "Baseline thermal-state controls for Hydrology climate generation."
    ),
    atmosphericCirculation: publicStrategySchema(
      climateOps.computeAtmosphericCirculation.strategies["geostrophic-proxy"].config,
      "Baseline atmospheric-circulation controls for Hydrology climate generation."
    ),
    oceanCurrents: publicStrategySchema(
      oceanOps.computeOceanSurfaceCurrents.strategies["wind-gyre-projection"].config,
      "Baseline ocean-current controls for Hydrology climate generation."
    ),
    oceanGeometry: publicStrategySchema(
      oceanOps.computeOceanGeometry.strategies["connected-basins"].config,
      "Baseline ocean-geometry controls for Hydrology climate generation."
    ),
    oceanThermalState: publicStrategySchema(
      oceanOps.computeOceanThermalState.strategies["latitude-current-advection"].config,
      "Baseline ocean thermal-state controls for Hydrology climate generation."
    ),
    evaporation: publicStrategySchema(
      climateOps.computeEvaporationSources.strategies["thermal-surface"].config,
      "Baseline evaporation-source controls for Hydrology climate generation."
    ),
    moistureTransport: publicStrategySchema(
      climateOps.transportMoisture.strategies["vector-advection"].config,
      "Baseline moisture-transport controls for Hydrology climate generation."
    ),
    precipitation: publicStrategySchema(
      climateOps.computePrecipitation.strategies.vector.config,
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
      hydrographyOps.computeDrainageRouting.strategies["priority-flood"].config,
      "Hydrography drainage-routing controls."
    ),
    runoff: publicStrategySchema(
      hydrographyOps.accumulateDischarge.strategies["topological-runoff"].config,
      "Hydrography runoff and discharge controls."
    ),
    riverNetwork: publicStrategySchema(
      hydrographyOps.projectRiverNetwork.strategies["discharge-percentiles"].config,
      "Hydrography river-network classification controls."
    ),
    lakes: publicStrategySchema(
      hydrographyOps.planLakes.strategies["sink-discharge-budget"].config,
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
      climateOps.computePrecipitation.strategies.refine.config,
      "Climate-refinement precipitation controls."
    ),
    solarForcing: publicStrategySchema(
      climateOps.computeRadiativeForcing.strategies["latitude-insolation"].config,
      "Climate-refinement solar-forcing controls."
    ),
    thermalState: publicStrategySchema(
      climateOps.computeThermalState.strategies["insolation-lapse-rate"].config,
      "Climate-refinement thermal-state controls."
    ),
    albedoFeedback: publicStrategySchema(
      cryosphereOps.applyAlbedoFeedback.strategies["bounded-snow-ice"].config,
      "Climate-refinement albedo-feedback controls."
    ),
    cryosphereState: publicStrategySchema(
      cryosphereOps.computeCryosphereState.strategies["temperature-thresholds"].config,
      "Climate-refinement cryosphere-state controls."
    ),
    landWaterBudget: publicStrategySchema(
      climateOps.computeLandWaterBudget.strategies["pet-aridity"].config,
      "Climate-refinement land-water-budget controls."
    ),
  },
  {
    additionalProperties: false,
    description:
      "Hydrology climate refinement controls for local precipitation, temperature feedback, cryosphere, and water budget.",
  }
);
