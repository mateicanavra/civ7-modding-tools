import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import strategies from "./strategies/contract.js";

/** Derives snow, sea-ice, albedo, freeze, permafrost, and melt state from admitted climate fields. */
const ComputeCryosphereStateContract = defineOp({
  kind: "compute",
  id: "hydrology/compute-cryosphere-state",
  /**
   * Computes cryosphere state (snow/sea-ice/albedo proxies) and a freeze persistence index.
   *
   * This op is deterministic and bounded. It exists to provide gameplay-facing “coldness” and ice masks that downstream
   * domains can consume without embedding cryosphere heuristics elsewhere.
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
      /** Rainfall (0..200) per tile; used as a precipitation signal for snow cover. */
      rainfall: TypedArraySchemas.u8({ description: "Rainfall (0..200) per tile." }),
    },
    {
      additionalProperties: false,
      description: "Inputs for cryosphere state computation (deterministic, data-only).",
    }
  ),
  /**
   * Cryosphere outputs (snow/ice cover, albedo, freeze index).
   */
  output: Type.Object(
    {
      /** Snow cover fraction (0..255) per tile. */
      snowCover: TypedArraySchemas.u8({ description: "Snow cover fraction (0..255) per tile." }),
      /** Sea ice cover fraction (0..255) per tile. */
      seaIceCover: TypedArraySchemas.u8({
        description: "Sea ice cover fraction (0..255) per tile.",
      }),
      /** Albedo proxy (0..255) per tile. */
      albedo: TypedArraySchemas.u8({ description: "Albedo proxy (0..255) per tile." }),
      /** Freeze persistence index (0..1) per tile (advisory). */
      freezeIndex: TypedArraySchemas.f32({
        description: "Freeze persistence index (0..1) per tile (advisory).",
      }),
      /** Ground ice persistence proxy (0..1) per tile; land-only. */
      groundIce01: TypedArraySchemas.f32({
        description: "Ground ice persistence proxy (0..1) per tile; land-only.",
      }),
      /** Permafrost proxy (0..1) per tile; land-only. */
      permafrost01: TypedArraySchemas.f32({
        description: "Permafrost proxy (0..1) per tile; land-only.",
      }),
      /** Melt potential proxy (0..1) per tile; land-only and snow-weighted. */
      meltPotential01: TypedArraySchemas.f32({
        description: "Melt potential proxy (0..1) per tile; land-only and snow-weighted.",
      }),
    },
    {
      additionalProperties: false,
      description: "Cryosphere outputs (snow/sea-ice/albedo proxies + freeze persistence index).",
    }
  ),
  strategies,
});

export default ComputeCryosphereStateContract;
