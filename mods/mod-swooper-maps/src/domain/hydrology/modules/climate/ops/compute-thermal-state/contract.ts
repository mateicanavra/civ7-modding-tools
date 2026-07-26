import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import insolationLapseRateDefinition from "./strategies/insolation-lapse-rate/config.js";

/** Computes bounded surface temperature from admitted insolation, elevation, land, and ocean state. */
const ComputeThermalStateContract = defineOp({
  kind: "compute",
  id: "hydrology/compute-thermal-state",
  /**
   * Computes a surface temperature proxy from insolation + elevation + land/ocean mask.
   *
   * Practical guidance:
   * - If mountains are too cold/hot: adjust `lapseRateCPerM` magnitude (more negative = colder at altitude).
   * - If land feels too continental: adjust `landCoolingC` (higher = cooler land relative to oceans).
   * - If the entire world is too warm/cold: adjust `baseTemperatureC`.
   */
  input: Type.Object(
    {
      /** Tile grid width. */
      width: Type.Integer({ minimum: 1, description: "Tile grid width (columns)." }),
      /** Tile grid height. */
      height: Type.Integer({ minimum: 1, description: "Tile grid height (rows)." }),
      /** Insolation proxy (0..1) per tile. */
      insolation: TypedArraySchemas.f32({ description: "Insolation proxy (0..1) per tile." }),
      /** Elevation (meters) per tile. */
      elevation: TypedArraySchemas.i16({ description: "Elevation (meters) per tile." }),
      /** Land mask per tile (1=land, 0=water). */
      landMask: TypedArraySchemas.u8({ description: "Land mask per tile (1=land, 0=water)." }),
      /**
       * Optional ocean SST field (Celsius) to override water-tile temperatures.
       *
       * Intended use:
       * - Coupling ocean currents/SST into downstream thermal + evap/cryosphere without breaking the default posture.
       */
      sstC: Type.Optional(
        TypedArraySchemas.f32({ description: "Optional sea surface temperature (C) per tile." })
      ),
    },
    {
      additionalProperties: false,
      description: "Inputs for surface temperature proxy computation (deterministic, data-only).",
    }
  ),
  /**
   * Surface temperature proxy output, expressed in Celsius.
   */
  output: Type.Object(
    {
      /** Surface temperature proxy (Celsius) per tile. */
      surfaceTemperatureC: TypedArraySchemas.f32({
        description: "Surface temperature proxy (Celsius) per tile.",
      }),
    },
    {
      additionalProperties: false,
      description: "Surface temperature proxy output per tile (Celsius).",
    }
  ),
  strategies: [insolationLapseRateDefinition],
});

export default ComputeThermalStateContract;
