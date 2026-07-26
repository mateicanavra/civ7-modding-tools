import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import latitudeDefinition from "./strategies/latitude/config.js";
import windGyreProjectionDefinition from "./strategies/wind-gyre-projection/config.js";

/** Surface-current contract whose wind/gyre projection is the product default and latitude is the fallback. */
const ComputeOceanSurfaceCurrentsContract = defineOp({
  kind: "compute",
  id: "hydrology/compute-ocean-surface-currents",
  /**
   * Computes a simplified ocean surface current field from winds and water mask.
   *
   * This is a gameplay-oriented proxy, not a CFD ocean model. It exists to provide ocean coupling signals that
   * influence downstream moisture transport and coastal climate moderation.
   *
   * Practical guidance:
   * - If you want to disable ocean influence entirely, set strategy `strength` to 0 (or select a knob preset that does so).
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
      /** Wind U component per tile (-127..127). */
      windU: TypedArraySchemas.i8({ description: "Wind U component per tile (-127..127)." }),
      /** Wind V component per tile (-127..127). */
      windV: TypedArraySchemas.i8({ description: "Wind V component per tile (-127..127)." }),
      /** Optional basin id per tile (0 on land). */
      basinId: Type.Optional(
        TypedArraySchemas.i32({ description: "Optional basin id per tile (0 on land)." })
      ),
      /** Optional coast distance over water (0 at coastal water; 65535 elsewhere). */
      coastDistance: Type.Optional(
        TypedArraySchemas.u16({
          description: "Optional coast distance over water (0 at coastal water; 65535 elsewhere).",
        })
      ),
      /** Optional advisory coast tangent U component per tile (-127..127). */
      coastTangentU: Type.Optional(
        TypedArraySchemas.i8({
          description: "Optional advisory coast tangent U component per tile (-127..127).",
        })
      ),
      /** Optional advisory coast tangent V component per tile (-127..127). */
      coastTangentV: Type.Optional(
        TypedArraySchemas.i8({
          description: "Optional advisory coast tangent V component per tile (-127..127).",
        })
      ),
    },
    {
      additionalProperties: false,
      description: "Inputs for ocean surface current computation (deterministic, data-only).",
    }
  ),
  /**
   * Surface current output (discrete i8 components).
   */
  output: Type.Object(
    {
      /** Current U component per tile (-127..127). */
      currentU: TypedArraySchemas.i8({ description: "Current U component per tile (-127..127)." }),
      /** Current V component per tile (-127..127). */
      currentV: TypedArraySchemas.i8({ description: "Current V component per tile (-127..127)." }),
    },
    {
      additionalProperties: false,
      description: "Surface current output per tile (U/V components).",
    }
  ),
  defaultStrategy: "wind-gyre-projection",
  strategies: [windGyreProjectionDefinition, latitudeDefinition],
});

export default ComputeOceanSurfaceCurrentsContract;
