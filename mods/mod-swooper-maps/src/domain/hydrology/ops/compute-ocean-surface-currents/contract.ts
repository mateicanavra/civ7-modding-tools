import { Type, TypedArraySchemas, defineOp } from "@swooper/mapgen-core/authoring";

/**
 * Computes a simplified ocean surface current field from winds and water mask.
 *
 * This is a gameplay-oriented proxy, not a CFD ocean model. It exists to provide ocean coupling signals that
 * influence downstream moisture transport and coastal climate moderation.
 *
 * Practical guidance:
 * - If you want to disable ocean influence entirely, set strategy `strength` to 0 (or select a knob preset that does so).
 */
const ComputeOceanSurfaceCurrentsInputSchema = Type.Object(
  {
    /** Tile grid width. */
    width: Type.Integer({ minimum: 1, description: "Tile grid width (columns)." }),
    /** Tile grid height. */
    height: Type.Integer({ minimum: 1, description: "Tile grid height (rows)." }),
    /** Latitude by row in degrees; length must equal `height`. */
    latitudeByRow: TypedArraySchemas.f32({ description: "Latitude per row (degrees)." }),
    /** Water mask per tile (1=water, 0=land). */
    isWaterMask: TypedArraySchemas.u8({ description: "Water mask per tile (1=water, 0=land)." }),
    /** Wind U component per tile (-127..127). */
    windU: TypedArraySchemas.i8({ description: "Wind U component per tile (-127..127)." }),
    /** Wind V component per tile (-127..127). */
    windV: TypedArraySchemas.i8({ description: "Wind V component per tile (-127..127)." }),
    /** Optional basin id per tile (0 on land). */
    basinId: Type.Optional(TypedArraySchemas.i32({ description: "Optional basin id per tile (0 on land)." })),
    /** Optional coast distance over water (0 at coastal water; 65535 elsewhere). */
    coastDistance: Type.Optional(
      TypedArraySchemas.u16({ description: "Optional coast distance over water (0 at coastal water; 65535 elsewhere)." })
    ),
    /** Optional advisory coast tangent U component per tile (-127..127). */
    coastTangentU: Type.Optional(
      TypedArraySchemas.i8({ description: "Optional advisory coast tangent U component per tile (-127..127)." })
    ),
    /** Optional advisory coast tangent V component per tile (-127..127). */
    coastTangentV: Type.Optional(
      TypedArraySchemas.i8({ description: "Optional advisory coast tangent V component per tile (-127..127)." })
    ),
  },
  {
    additionalProperties: false,
    description: "Inputs for ocean surface current computation (deterministic, data-only).",
  }
);

/**
 * Surface current output (discrete i8 components).
 */
const ComputeOceanSurfaceCurrentsOutputSchema = Type.Object(
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
);

/**
 * Default surface current parameters.
 */
const ComputeOceanSurfaceCurrentsDefaultStrategySchema = Type.Object(
  {
    /**
     * Global current strength multiplier.
     *
     * Practical guidance:
     * - Increase for stronger ocean coupling (more coastal moisture/temperature moderation).
     * - Decrease toward 0 to fade out ocean influence.
     */
    strength: Type.Number({
      default: 1,
      minimum: 0,
      maximum: 4,
      description: "Global current strength multiplier.",
    }),
  },
  {
    additionalProperties: false,
    description: "Ocean surface current parameters (default strategy).",
  }
);

/**
 * Earthlike surface current parameters.
 *
 * This strategy blends wind imprint + Ekman deflection + (optional) basin gyres and coastal boundary currents,
 * then applies bounded smoothing and divergence reduction. It is deterministic and bounded-cost.
 */
const ComputeOceanSurfaceCurrentsEarthlikeStrategySchema = Type.Object(
  {
    /** Max speed used for quantization to i8 (higher = weaker output for same internal field). */
    maxSpeed: Type.Number({
      default: 80,
      minimum: 1,
      maximum: 400,
      description: "Max speed used for quantization to i8 (higher = weaker output for same internal field).",
    }),
    /** Wind imprint strength (along-wind component). */
    windStrength: Type.Number({
      default: 0.55,
      minimum: 0,
      maximum: 2,
      description: "Wind imprint strength (along-wind component).",
    }),
    /** Ekman deflection strength (cross-wind component; hemisphere-aware). */
    ekmanStrength: Type.Number({
      default: 0.35,
      minimum: 0,
      maximum: 2,
      description: "Ekman deflection strength (cross-wind component; hemisphere-aware).",
    }),
    /** Basin gyre strength (requires basinId; ignored if absent). */
    gyreStrength: Type.Number({
      default: 26,
      minimum: 0,
      maximum: 200,
      description: "Basin gyre strength (requires basinId; ignored if absent).",
    }),
    /** Coast-aligned boundary current strength (requires coastTangent; ignored if absent). */
    coastStrength: Type.Number({
      default: 32,
      minimum: 0,
      maximum: 200,
      description: "Coast-aligned boundary current strength (requires coastTangent; ignored if absent).",
    }),
    /** Bounded smoothing passes over water tiles. */
    smoothIters: Type.Integer({
      default: 3,
      minimum: 0,
      maximum: 16,
      description: "Bounded smoothing passes over water tiles.",
    }),
    /** Bounded Jacobi iterations for divergence reduction (water-only). */
    projectionIters: Type.Integer({
      default: 8,
      minimum: 0,
      maximum: 64,
      description: "Bounded Jacobi iterations for divergence reduction (water-only).",
    }),
  },
  {
    additionalProperties: false,
    description: "Ocean surface current parameters (earthlike strategy).",
  }
);

const ComputeOceanSurfaceCurrentsContract = defineOp({
  kind: "compute",
  id: "hydrology/compute-ocean-surface-currents",
  input: ComputeOceanSurfaceCurrentsInputSchema,
  output: ComputeOceanSurfaceCurrentsOutputSchema,
  strategies: {
    default: ComputeOceanSurfaceCurrentsEarthlikeStrategySchema,
    latitude: ComputeOceanSurfaceCurrentsDefaultStrategySchema,
  },
});

export default ComputeOceanSurfaceCurrentsContract;
