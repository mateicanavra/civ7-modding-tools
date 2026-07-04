import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Cryosphere state products (snow/sea-ice/albedo proxies).
 *
 * When `cryosphere` knob is `"off"`, these layers are still published but intentionally neutralized by config.
 */
export const HydrologyCryosphereSchema = Type.Object(
  {
    /** Snow cover fraction (0..255) per tile. */
    snowCover: TypedArraySchemas.u8({ description: "Snow cover fraction (0..255) per tile." }),
    /** Sea ice cover fraction (0..255) per tile. */
    seaIceCover: TypedArraySchemas.u8({ description: "Sea ice cover fraction (0..255) per tile." }),
    /** Albedo proxy (0..255) per tile; may feed bounded albedo feedback into temperature refinement. */
    albedo: TypedArraySchemas.u8({ description: "Albedo proxy (0..255) per tile." }),
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
      description: "Melt potential proxy (0..1) per tile; land-only.",
    }),
  },
  {
    description:
      "Hydrology cryosphere state products (snow/sea-ice/albedo + cryosphere truth proxies).",
  }
);

export const Schema = HydrologyCryosphereSchema;

export const artifact = defineArtifact({
  name: "cryosphere",
  id: "artifact:hydrology.cryosphere",
  schema: Schema,
});
