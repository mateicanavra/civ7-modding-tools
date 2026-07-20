import hydrology from "@mapgen/domain/hydrology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
import { artifacts as morphologyArtifacts } from "../../../morphology/artifacts/index.js";
import { artifactModules as hydrologyClimateBaselineArtifactModules } from "../../artifacts/index.js";

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
     * computation posture while keeping the public outputs stable (mean + amplitude only).
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
    description:
      "Climate baseline step config with complete seasonality values and operation envelopes.",
  }
);

/**
 * Defines baseline circulation and moisture transport over final Morphology topography and
 * shelf evidence. It publishes wind, climate, and seasonality together so river routing and
 * refinement start from one deterministic climate vintage.
 */
export const ClimateBaselineStepContract = defineStep({
  id: "climate-baseline",
  phase: "hydrology",
  requires: [],
  provides: [],
  artifacts: {
    requires: [morphologyArtifacts.topography, morphologyArtifacts.shelf],
    provides: [
      hydrologyClimateBaselineArtifactModules.baselineClimateField,
      hydrologyClimateBaselineArtifactModules.climateSeasonality,
      hydrologyClimateBaselineArtifactModules.windField,
    ],
  },
  ops: {
    computeRadiativeForcing: hydrology.ops.computeRadiativeForcing,
    computeThermalState: hydrology.ops.computeThermalState,
    computeAtmosphericCirculation: hydrology.ops.computeAtmosphericCirculation,
    computeOceanSurfaceCurrents: hydrology.ops.computeOceanSurfaceCurrents,
    computeOceanGeometry: hydrology.ops.computeOceanGeometry,
    computeOceanThermalState: hydrology.ops.computeOceanThermalState,
    computeEvaporationSources: hydrology.ops.computeEvaporationSources,
    transportMoisture: hydrology.ops.transportMoisture,
    computePrecipitation: hydrology.ops.computePrecipitation,
  },
  schema: ClimateBaselineStepConfigSchema,
});
