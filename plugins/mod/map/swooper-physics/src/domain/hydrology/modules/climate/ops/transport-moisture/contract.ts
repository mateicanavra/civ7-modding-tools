import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import cardinalDefinition from "./strategies/cardinal/config.js";
import vectorAdvectionDefinition from "./strategies/vector-advection/config.js";

/** Moisture-transport contract with vector advection as the product default and cardinal fallback. */
const TransportMoistureContract = defineOp({
  kind: "compute",
  id: "hydrology/transport-moisture",
  /**
   * Transports humidity along the wind field from evaporation sources.
   *
   * This op intentionally uses a fixed iteration budget (no convergence loops) for deterministic, bounded runtime.
   *
   * Practical guidance:
   * - If moisture doesn’t reach inland enough: increase `iterations` and/or `retention`.
   * - If humidity smears too much: decrease `advection` (less influence from upwind).
   * - If humidity persists too long: decrease `retention` (faster decay/rainout).
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
      /** Land mask per tile (1=land, 0=water). */
      landMask: TypedArraySchemas.u8({ description: "Land mask per tile (1=land, 0=water)." }),
      /** Wind U component per tile (-127..127). */
      windU: TypedArraySchemas.i8({ description: "Wind U component per tile (-127..127)." }),
      /** Wind V component per tile (-127..127). */
      windV: TypedArraySchemas.i8({ description: "Wind V component per tile (-127..127)." }),
      /** Evaporation sources proxy (0..1) per tile. */
      evaporation: TypedArraySchemas.f32({
        description:
          "Evaporation supply per tile; strategies normalize it to 0..1 before the first transport pass.",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Evaporation supply, quantized winds, and latitude fallback evidence used to advect moisture across the map.",
    }
  ),
  /**
   * Humidity field output (0..1 proxy).
   */
  output: Type.Object(
    {
      /** Humidity proxy (0..1) per tile. */
      humidity: TypedArraySchemas.f32({ description: "Humidity proxy (0..1) per tile." }),
    },
    {
      additionalProperties: false,
      description:
        "Normalized humidity field consumed by precipitation generation without engine-state readback.",
    }
  ),
  defaultStrategy: "vector-advection",
  strategies: [vectorAdvectionDefinition, cardinalDefinition],
});

export default TransportMoistureContract;
