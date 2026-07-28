import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import latitudeCurrentAdvectionDefinition from "./strategies/latitude-current-advection/config.js";

/** Derives sea-surface temperature and sea ice from admitted latitude, shelf, and current fields. */
const ComputeOceanThermalStateContract = defineOp({
  kind: "compute",
  id: "hydrology/compute-ocean-thermal-state",
  /**
   * Computes an ocean surface thermal state (SST + sea-ice proxy) from latitude and surface currents.
   *
   * This is a gameplay-oriented proxy intended to make currents matter in downstream climate:
   * - Deterministic, bounded iterations
   * - Water-only advection/diffusion
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
      /** Water mask per tile (1=water, 0=land). */
      isWaterMask: TypedArraySchemas.u8({ description: "Water mask per tile (1=water, 0=land)." }),
      /** Continental shelf mask per tile (1=shelf, 0=not), from Morphology coastline metrics. */
      shelfMask: TypedArraySchemas.u8({
        description: "Continental shelf mask per tile (1=shelf, 0=not).",
      }),
      /** Current U component per tile (-127..127). */
      currentU: TypedArraySchemas.i8({ description: "Current U component per tile (-127..127)." }),
      /** Current V component per tile (-127..127). */
      currentV: TypedArraySchemas.i8({ description: "Current V component per tile (-127..127)." }),
    },
    {
      additionalProperties: false,
      description:
        "Latitude baseline, shelf identity, and quantized currents admitted for bounded water-only thermal transport.",
    }
  ),
  output: Type.Object(
    {
      /** Sea surface temperature (C) per tile. */
      sstC: TypedArraySchemas.f32({ description: "Sea surface temperature (C) per tile." }),
      /** Sea ice mask per tile (1=ice, 0=no ice). */
      seaIceMask: TypedArraySchemas.u8({ description: "Sea ice mask per tile (1=ice, 0=no ice)." }),
    },
    {
      additionalProperties: false,
      description:
        "Sea-surface temperature and derived sea-ice state consumed by atmospheric temperature and evaporation coupling.",
    }
  ),
  strategies: [latitudeCurrentAdvectionDefinition],
});

export default ComputeOceanThermalStateContract;
