import hydrology from "@mapgen/domain/hydrology";
import { artifacts as climateArtifacts } from "@mapgen/domain/hydrology/modules/climate/artifacts/index.js";
import { artifacts as morphologyLandformsArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
import { artifacts as morphologyShelfArtifacts } from "@mapgen/domain/morphology/modules/shelf/artifacts/index.js";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Hydrology baseline climate step (mechanism-driven).
 *
 * This step is an orchestration boundary: it binds deterministic seeds, invokes Hydrology ops, and publishes the
 * canonical baseline climate + wind artifacts for downstream consumption.
 *
 * Configuration posture:
 * - Broad author-facing control flows through Hydrology knobs compiled at stage compile time.
 * - Required `climate-baseline.seasonality` values carry the exact authored posture.
 */
const ClimateBaselineStepConfigSchema = Type.Object(
  {
    /**
     * Seasonality controls.
     *
     * Hydrology still exposes the broad `seasonality` knob, but these let authors override the exact internal
     * computation posture while keeping durable climate artifacts stable. Seasonal amplitudes remain
     * invocation-local evidence for optional visualization.
     */
    seasonality: Type.Object(
      {
        /** Seasonal mode count sampled internally when computing annual mean + amplitude. */
        modeCount: Type.Union([Type.Literal(2), Type.Literal(4)], {
          default: 2,
          description: "Seasonal mode count sampled internally (2=solstices, 4=quarter-year).",
        }),
        /** Effective axial tilt (declination amplitude) in degrees for seasonal forcing. */
        axialTiltDeg: Type.Number({
          default: 18,
          minimum: 0,
          maximum: 45,
          description:
            "Axial tilt (degrees) used to simulate seasonal declination forcing. Set to 0 to disable seasonal amplitudes.",
        }),
      },
      {
        additionalProperties: false,
        description: "Seasonality controls for climate-baseline sampling.",
      }
    ),
  },
  {
    additionalProperties: false,
  }
);

/**
 * Defines baseline circulation and moisture transport over final Morphology topography and
 * shelf evidence. It publishes wind and baseline climate together so river routing and
 * refinement start from one deterministic climate vintage; seasonal amplitudes remain
 * invocation-local visualization evidence.
 */
export const config = defineStep({
  id: "climate-baseline",
  description: "Computes baseline wind, climate, and seasonality from final Morphology evidence.",
  requires: [],
  provides: [],
  artifacts: {
    requires: [morphologyLandformsArtifacts.topography, morphologyShelfArtifacts.shelf],
    provides: [climateArtifacts.baselineClimateField, climateArtifacts.windField],
  },
  ops: {
    computeRadiativeForcing: hydrology.climate.ops.computeRadiativeForcing,
    computeThermalState: hydrology.climate.ops.computeThermalState,
    computeAtmosphericCirculation: hydrology.climate.ops.computeAtmosphericCirculation,
    computeOceanSurfaceCurrents: hydrology.ocean.ops.computeOceanSurfaceCurrents,
    computeOceanGeometry: hydrology.ocean.ops.computeOceanGeometry,
    computeOceanThermalState: hydrology.ocean.ops.computeOceanThermalState,
    computeEvaporationSources: hydrology.climate.ops.computeEvaporationSources,
    transportMoisture: hydrology.climate.ops.transportMoisture,
    computePrecipitation: hydrology.climate.ops.computePrecipitation,
  },
  schema: ClimateBaselineStepConfigSchema,
});
