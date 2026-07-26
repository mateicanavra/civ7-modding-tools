import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import boundedSnowIceDefinition from "./strategies/bounded-snow-ice/config.js";

/** Applies bounded snow-and-ice albedo feedback to an admitted surface-temperature field. */
const ApplyAlbedoFeedbackContract = defineOp({
  kind: "compute",
  id: "hydrology/apply-albedo-feedback",
  /**
   * Applies bounded snow/sea-ice albedo feedback to a base surface temperature proxy.
   *
   * Invariants:
   * - Fixed iteration budget (`iterations`) for deterministic, bounded runtime (no convergence loops).
   * - This op is purely data-driven: no runtime callbacks, views, or trace handles cross the boundary.
   *
   * Practical guidance:
   * - If you want stronger ice-albedo cooling: increase `snowCoolingC` / `seaIceCoolingC`.
   * - If you want to disable feedback: set `iterations` to 0 (the op becomes a no-op on temperature).
   */
  input: Type.Object(
    {
      /** Tile grid width. */
      width: Type.Integer({ minimum: 1, description: "Tile grid width (columns)." }),
      /** Tile grid height. */
      height: Type.Integer({ minimum: 1, description: "Tile grid height (rows)." }),
      /** Land mask per tile (1=land, 0=water). */
      landMask: TypedArraySchemas.u8({ description: "Land mask per tile (1=land, 0=water)." }),
      /** Rainfall (0..200) per tile (used as a precipitation signal for snow accumulation). */
      rainfall: TypedArraySchemas.u8({ description: "Rainfall (0..200) per tile." }),
      /** Base surface temperature proxy (C), before albedo feedback. */
      surfaceTemperatureC: TypedArraySchemas.f32({
        description: "Base surface temperature proxy (C).",
      }),
    },
    {
      additionalProperties: false,
      description: "Inputs for bounded albedo feedback (deterministic, data-only).",
    }
  ),
  /**
   * Surface temperature after bounded albedo feedback.
   */
  output: Type.Object(
    {
      /** Surface temperature after bounded albedo feedback (C). */
      surfaceTemperatureC: TypedArraySchemas.f32({
        description: "Surface temperature after bounded albedo feedback (C).",
      }),
    },
    {
      additionalProperties: false,
      description: "Albedo-feedback-adjusted surface temperature proxy (C).",
    }
  ),
  strategies: [boundedSnowIceDefinition],
});

export default ApplyAlbedoFeedbackContract;
