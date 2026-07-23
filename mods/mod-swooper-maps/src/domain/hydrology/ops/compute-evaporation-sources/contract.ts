import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import strategies from "./strategies/contract.js";

/** Derives bounded evaporation sources from admitted land, temperature, wind, and ocean state. */
const ComputeEvaporationSourcesContract = defineOp({
  kind: "compute",
  id: "hydrology/compute-evaporation-sources",
  /**
   * Computes evaporation source strength per tile from land/ocean mask and temperature.
   *
   * This is the “moisture supply” input for advection/transport. It must remain deterministic and data-pure.
   */
  input: Type.Object(
    {
      /** Tile grid width. */
      width: Type.Integer({ minimum: 1, description: "Tile grid width (columns)." }),
      /** Tile grid height. */
      height: Type.Integer({ minimum: 1, description: "Tile grid height (rows)." }),
      /** Land mask per tile (1=land, 0=water). */
      landMask: TypedArraySchemas.u8({ description: "Land mask per tile (1=land, 0=water)." }),
      /** Surface temperature proxy (C). */
      surfaceTemperatureC: TypedArraySchemas.f32({ description: "Surface temperature proxy (C)." }),
      /** Optional wind U component per tile (-127..127), for ocean evaporation coupling. */
      windU: Type.Optional(
        TypedArraySchemas.i8({ description: "Optional wind U component per tile (-127..127)." })
      ),
      /** Optional wind V component per tile (-127..127), for ocean evaporation coupling. */
      windV: Type.Optional(
        TypedArraySchemas.i8({ description: "Optional wind V component per tile (-127..127)." })
      ),
      /** Optional sea surface temperature (C) per tile, used to drive ocean evaporation. */
      sstC: Type.Optional(
        TypedArraySchemas.f32({ description: "Optional sea surface temperature (C) per tile." })
      ),
      /** Optional sea ice mask per tile (1=ice, 0=no ice), used to suppress ocean evaporation. */
      seaIceMask: Type.Optional(
        TypedArraySchemas.u8({ description: "Optional sea ice mask per tile (1=ice, 0=no ice)." })
      ),
    },
    {
      additionalProperties: false,
      description: "Inputs for evaporation source computation (deterministic, data-only).",
    }
  ),
  /**
   * Evaporation strength output (0..1 proxy).
   */
  output: Type.Object(
    {
      /** Evaporation sources proxy (0..1) per tile. */
      evaporation: TypedArraySchemas.f32({
        description: "Evaporation sources proxy (0..1) per tile.",
      }),
    },
    {
      additionalProperties: false,
      description: "Evaporation source strength output per tile (0..1 proxy).",
    }
  ),
  strategies,
});

export default ComputeEvaporationSourcesContract;
