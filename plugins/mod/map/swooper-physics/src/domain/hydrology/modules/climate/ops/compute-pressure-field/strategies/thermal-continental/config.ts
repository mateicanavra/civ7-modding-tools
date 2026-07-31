import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/** Defines the stationary, seasonal, and transient terms in the circulation pressure proxy. */
export default defineStrategy({
  id: "thermal-continental",
  config: Type.Object(
    {
      scaffoldStrength: Type.Number({
        default: 1,
        minimum: 0,
        maximum: 4,
        description:
          "Scale on the canonical equatorial, subtropical, subpolar, and polar pressure-belt scaffold.",
      }),
      thermalAnomalyHpaPerC: Type.Number({
        default: 0.55,
        minimum: 0,
        maximum: 5,
        description:
          "Seasonal land pressure response in hPa per degree Celsius of departure from the phase mean.",
      }),
      stationaryThermalHpaPerC: Type.Number({
        default: 1.2,
        minimum: 0,
        maximum: 5,
        description:
          "Stationary thermal pressure response in hPa per degree Celsius of zonal-mean departure.",
      }),
      transientScaleTiles: Type.Number({
        default: 18,
        minimum: 2,
        maximum: 128,
        description: "Spatial scale in tiles of the transient pressure-anomaly term.",
      }),
      transientAmplitudeHpa: Type.Number({
        default: 14,
        minimum: 0,
        maximum: 400,
        description:
          "Amplitude in hPa of the deterministic transient pressure-anomaly term; zero disables it.",
      }),
      smoothIters: Type.Integer({
        default: 2,
        minimum: 0,
        maximum: 8,
        description:
          "Hex-smoothing passes applied to thermal pressure terms before composition.",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Controls the belt scaffold, seasonal land anomaly, stationary thermal anomaly, transient weather, and thermal smoothing.",
    }
  ),
});
