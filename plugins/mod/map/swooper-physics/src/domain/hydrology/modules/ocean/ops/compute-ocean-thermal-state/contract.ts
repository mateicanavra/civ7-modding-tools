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
      /** Relative zonal strength; producers use -127..127, while the i8 input also admits -128. */
      currentU: TypedArraySchemas.i8({
        description: "Signed-byte relative zonal current strength; radial donor blending saturates at magnitude 127.",
      }),
      /** Relative meridional strength; producers use -127..127, while the i8 input also admits -128. */
      currentV: TypedArraySchemas.i8({
        description: "Signed-byte relative meridional current strength; radial donor blending saturates at magnitude 127.",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Latitude baseline, shelf identity, and quantized relative currents for bounded water-only thermal transport; magnitude controls a dimensionless self/donor blend, not physical speed or elapsed time.",
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
