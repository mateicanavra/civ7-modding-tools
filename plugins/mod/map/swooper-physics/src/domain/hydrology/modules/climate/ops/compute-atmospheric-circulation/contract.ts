import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import geostrophicProxyDefinition from "./strategies/geostrophic-proxy/config.js";
import latitudeDefinition from "./strategies/latitude/config.js";

/**
 * Wind-field contract whose geostrophic proxy is the product default and latitude is the simpler
 * fallback. The analytic three-cell backbone carries the zonal belts while departures in the
 * supplied pressure proxy provide bounded weather-scale structure.
 */
const ComputeAtmosphericCirculationContract = defineOp({
  kind: "compute",
  id: "hydrology/compute-atmospheric-circulation",
  /**
   * Computes a prevailing wind field (U/V) from latitude and deterministic pressure structure.
   *
   * `rngSeed` remains part of the operation input because the latitude fallback consumes it.
   * The geostrophic strategy is deterministic from latitude, pressure, and configuration alone.
   */
  input: Type.Object(
    {
      /** Tile grid width. */
      width: Type.Integer({ minimum: 1, description: "Tile grid width (columns)." }),
      /** Tile grid height. */
      height: Type.Integer({ minimum: 1, description: "Tile grid height (rows)." }),
      /** Latitude by row in degrees; length must equal `height`. */
      latitudeByRow: TypedArraySchemas.f32({
        cardinality: ["height"],
        description: "Latitude per row (degrees).",
      }),
      /** Deterministic RNG seed consumed by strategies that synthesize seeded latitude variation. */
      rngSeed: Type.Integer({
        minimum: 0,
        maximum: 2_147_483_647,
        description:
          "Deterministic RNG seed consumed by the latitude strategy; the geostrophic strategy ignores it.",
      }),
      /** Pressure-anomaly proxy whose departures from each row's zonal mean drive eddies. */
      pressureField: TypedArraySchemas.f32({
        cardinality: ["width", "height"],
        description:
          "Circulation-oriented mean-sea-level pressure-anomaly proxy per tile. Only departures from each row's zonal mean feed the wind perturbation, avoiding duplication of the analytic circulation belts.",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Latitude, circulation pressure proxy, and deterministic seed evidence.",
    }
  ),
  /**
   * Wind field output (discrete i8 components).
   */
  output: Type.Object(
    {
      /** Wind U component per tile (-127..127); +U points east toward increasing columns. */
      windU: TypedArraySchemas.i8({
        description:
          "Wind U component per tile (-127..127); +U points east toward increasing columns.",
      }),
      /** Wind V component per tile (-127..127); +V points toward increasing rows. */
      windV: TypedArraySchemas.i8({
        description:
          "Wind V component per tile (-127..127); +V points toward increasing rows, with geographic orientation derived from the latitude ramp.",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Quantized zonal and meridional winds consumed by moisture transport, precipitation, climate diagnostics, and ocean currents.",
    }
  ),
  defaultStrategy: "geostrophic-proxy",
  strategies: [geostrophicProxyDefinition, latitudeDefinition],
});

export default ComputeAtmosphericCirculationContract;
