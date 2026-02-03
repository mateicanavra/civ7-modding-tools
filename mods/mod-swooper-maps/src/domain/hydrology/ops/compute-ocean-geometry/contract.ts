import { Type, TypedArraySchemas, defineOp } from "@swooper/mapgen-core/authoring";

/**
 * Computes ocean geometry helpers for obstacle-aware surface current modeling:
 * - basinId: connected water components (X-wrap)
 * - coastDistance: distance-to-coast over water (0 at coastal water)
 * - coastNormal/tangent: approximate coast frame vectors (advisory)
 *
 * This op is deterministic and bounded.
 */
const ComputeOceanGeometryInputSchema = Type.Object(
  {
    /** Tile grid width. */
    width: Type.Integer({ minimum: 1, description: "Tile grid width (columns)." }),
    /** Tile grid height. */
    height: Type.Integer({ minimum: 1, description: "Tile grid height (rows)." }),
    /** Water mask per tile (1=water, 0=land). */
    isWaterMask: TypedArraySchemas.u8({ description: "Water mask per tile (1=water, 0=land)." }),
    /**
     * Coastal water mask per tile (1=coastal water, 0=not). Produced by Morphology coastline metrics and treated
     * as authoritative for coast distance seeding.
     */
    coastalWaterMask: TypedArraySchemas.u8({ description: "Coastal water mask per tile (1=coastal water, 0=not)." }),
    /**
     * Distance-to-coast metric produced by Morphology. This may traverse land; Hydrology still computes a separate
     * water-only coast distance for ocean flow modeling, but consumes this artifact as part of the coastlines contract.
     */
    distanceToCoast: TypedArraySchemas.u16({ description: "Distance-to-coast from Morphology coastline metrics." }),
    /** Continental shelf mask per tile (1=shelf, 0=not) from Morphology coastline metrics. */
    shelfMask: TypedArraySchemas.u8({ description: "Continental shelf mask per tile (1=shelf, 0=not)." }),
    /** Optional bathymetry (negative below sea level; 0+ above), if available. */
    bathymetry: Type.Optional(TypedArraySchemas.f32({ description: "Bathymetry per tile (optional)." })),
  },
  {
    additionalProperties: false,
    description: "Inputs for ocean geometry computation (deterministic, data-only).",
  }
);

const ComputeOceanGeometryOutputSchema = Type.Object(
  {
    /** Basin id per tile (0 on land). Basin ids are 1..N, stable for a given input mask. */
    basinId: TypedArraySchemas.i32({ description: "Basin id per tile (0 on land)." }),
    /** Coast distance in steps over water (0 at coastal water; clamped on water; 65535 on land). */
    coastDistance: TypedArraySchemas.u16({
      description: "Coast distance in steps over water (0 at coastal water; clamped to maxCoastDistance on water; 65535 on land).",
    }),
    /** Advisory coast normal U component per tile (-127..127). */
    coastNormalU: TypedArraySchemas.i8({ description: "Advisory coast normal U component per tile (-127..127)." }),
    /** Advisory coast normal V component per tile (-127..127). */
    coastNormalV: TypedArraySchemas.i8({ description: "Advisory coast normal V component per tile (-127..127)." }),
    /** Advisory coast tangent U component per tile (-127..127). */
    coastTangentU: TypedArraySchemas.i8({ description: "Advisory coast tangent U component per tile (-127..127)." }),
    /** Advisory coast tangent V component per tile (-127..127). */
    coastTangentV: TypedArraySchemas.i8({ description: "Advisory coast tangent V component per tile (-127..127)." }),
  },
  {
    additionalProperties: false,
    description: "Ocean geometry helpers (basins + coast fields).",
  }
);

const ComputeOceanGeometryDefaultStrategySchema = Type.Object(
  {
    /** Max coast distance to compute in BFS steps (cap for cost + stability). */
    maxCoastDistance: Type.Integer({
      default: 64,
      minimum: 1,
      maximum: 1024,
      description: "Max coast distance to compute in BFS steps (cap for cost + stability).",
    }),
    /** Max coast distance at which to emit coast normal/tangent vectors. */
    maxCoastVectorDistance: Type.Integer({
      default: 10,
      minimum: 0,
      maximum: 256,
      description: "Max coast distance at which to emit coast normal/tangent vectors.",
    }),
  },
  {
    additionalProperties: false,
    description: "Ocean geometry parameters (default strategy).",
  }
);

const ComputeOceanGeometryContract = defineOp({
  kind: "compute",
  id: "hydrology/compute-ocean-geometry",
  input: ComputeOceanGeometryInputSchema,
  output: ComputeOceanGeometryOutputSchema,
  strategies: {
    default: ComputeOceanGeometryDefaultStrategySchema,
  },
});

export default ComputeOceanGeometryContract;
