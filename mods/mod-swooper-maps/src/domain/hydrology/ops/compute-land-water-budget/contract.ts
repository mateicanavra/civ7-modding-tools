import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import strategies from "./strategies/contract.js";

/** Computes potential evapotranspiration and aridity from admitted terrestrial climate fields. */
const ComputeLandWaterBudgetContract = defineOp({
  kind: "compute",
  id: "hydrology/compute-land-water-budget",
  /**
   * Computes land water budget proxies (PET and aridity).
   *
   * This op derives gameplay-oriented, deterministic indices from rainfall/humidity/temperature.
   * Consumers should treat these outputs as advisory indices (use them, don’t re-derive ad hoc variants).
   */
  input: Type.Object(
    {
      /** Tile grid width. */
      width: Type.Integer({ minimum: 1, description: "Tile grid width (columns)." }),
      /** Tile grid height. */
      height: Type.Integer({ minimum: 1, description: "Tile grid height (rows)." }),
      /** Land mask per tile (1=land, 0=water). */
      landMask: TypedArraySchemas.u8({ description: "Land mask per tile (1=land, 0=water)." }),
      /** Rainfall (0..200) per tile. */
      rainfall: TypedArraySchemas.u8({ description: "Rainfall (0..200) per tile." }),
      /** Humidity (0..255) per tile. */
      humidity: TypedArraySchemas.u8({ description: "Humidity (0..255) per tile." }),
      /** Surface temperature proxy (C). */
      surfaceTemperatureC: TypedArraySchemas.f32({ description: "Surface temperature proxy (C)." }),
    },
    {
      additionalProperties: false,
      description: "Inputs for land water budget proxies (deterministic, data-only).",
    }
  ),
  /**
   * Land water budget outputs (PET + aridity index).
   */
  output: Type.Object(
    {
      /** Potential evapotranspiration proxy (rainfall units, advisory). */
      pet: TypedArraySchemas.f32({
        description: "Potential evapotranspiration proxy (rainfall units, advisory).",
      }),
      /** Aridity index (0..1) derived from precipitation vs PET (advisory). */
      aridityIndex: TypedArraySchemas.f32({
        description: "Aridity index (0..1) derived from precipitation vs PET (advisory).",
      }),
    },
    {
      additionalProperties: false,
      description: "Land water budget outputs (PET proxy and aridity index).",
    }
  ),
  strategies,
});

export default ComputeLandWaterBudgetContract;
