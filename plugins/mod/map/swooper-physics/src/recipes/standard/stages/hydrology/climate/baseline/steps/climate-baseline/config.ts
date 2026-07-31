import hydrology from "../../../../../../../../domain/hydrology/index.js";
import { artifacts as climateArtifacts } from "../../../../../../../../domain/hydrology/modules/climate/artifacts/index.js";
import { artifacts as morphologyLandformsArtifacts } from "../../../../../../../../domain/morphology/modules/landforms/artifacts/index.js";
import { artifacts as morphologyShelfArtifacts } from "../../../../../../../../domain/morphology/modules/shelf/artifacts/index.js";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Hydrology baseline climate step (mechanism-driven).
 *
 * This step is an orchestration boundary: it binds deterministic seeds, invokes Hydrology ops,
 * and publishes the canonical baseline climate, pressure, and wind artifacts.
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
    /**
     * Fixed atmosphere-ocean coupling controls.
     *
     * Every iteration re-derives temperature, pressure, wind, currents, and SST. Only SST, the
     * ocean's slow thermal memory, crosses the iteration boundary.
     */
    coupling: Type.Object(
      {
        iterations: Type.Integer({
          default: 2,
          minimum: 1,
          maximum: 4,
          description:
            "Fixed atmosphere-ocean coupling iterations. One is an SST-free first guess; later iterations consume only the preceding SST field.",
        }),
      },
      {
        additionalProperties: false,
        description: "Bounded deterministic atmosphere-ocean fixed-point controls.",
      }
    ),
  },
  {
    additionalProperties: false,
  }
);

/**
 * Defines baseline circulation and moisture transport over final Morphology topography and
 * shelf evidence. It publishes pressure, wind, and baseline climate together so river routing
 * and refinement start from one deterministic climate vintage; seasonal amplitudes remain
 * invocation-local visualization evidence.
 */
export const config = defineStep({
  id: "climate-baseline",
  description:
    "Computes baseline pressure, wind, climate, and seasonality from final Morphology evidence.",
  requires: [morphologyLandformsArtifacts.topography, morphologyShelfArtifacts.shelf],
  provides: [
    climateArtifacts.baselineClimateField,
    climateArtifacts.pressureField,
    climateArtifacts.windField,
  ],

  ops: {
    computeRadiativeForcing: hydrology.climate.ops.computeRadiativeForcing,
    computeThermalState: hydrology.climate.ops.computeThermalState,
    computePressureField: hydrology.climate.ops.computePressureField,
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
