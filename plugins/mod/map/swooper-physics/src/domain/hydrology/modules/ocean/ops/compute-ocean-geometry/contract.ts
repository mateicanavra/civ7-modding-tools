import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import connectedBasinsDefinition from "./strategies/connected-basins/config.js";

/** Resolves ocean basins, coast distance, and coast orientation from admitted water geometry. */
const ComputeOceanGeometryContract = defineOp({
  kind: "compute",
  id: "hydrology/compute-ocean-geometry",
  /**
   * Computes ocean geometry helpers for obstacle-aware surface current modeling:
   * - basinId: connected water components (X-wrap)
   * - coastDistance: distance-to-coast over water (0 at coastal water)
   * - coastNormal/tangent: approximate coast frame vectors (advisory)
   *
   * This op is deterministic and bounded.
   */
  input: Type.Object(
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
      coastalWaterMask: TypedArraySchemas.u8({
        description: "Coastal water mask per tile (1=coastal water, 0=not).",
      }),
      /**
       * Distance-to-coast metric produced by Morphology. This may traverse land; Hydrology still computes a separate
       * water-only coast distance for ocean flow modeling, but consumes this artifact as part of the coastlines contract.
       */
      distanceToCoast: TypedArraySchemas.u16({
        description: "Distance-to-coast from Morphology coastline metrics.",
      }),
      /** Continental shelf mask per tile (1=shelf, 0=not) from Morphology coastline metrics. */
      shelfMask: TypedArraySchemas.u8({
        description: "Continental shelf mask per tile (1=shelf, 0=not).",
      }),
      /** Optional bathymetry (negative below sea level; 0+ above), if available. */
      bathymetry: Type.Optional(
        TypedArraySchemas.f32({ description: "Bathymetry per tile (optional)." })
      ),
    },
    {
      additionalProperties: false,
      description:
        "Morphology water, coast, and shelf evidence admitted once so basin identity and coast frames share one topology.",
    }
  ),
  output: Type.Object(
    {
      /** Basin id per tile (0 on land). Basin ids are 1..N, stable for a given input mask. */
      basinId: TypedArraySchemas.i32({ description: "Basin id per tile (0 on land)." }),
      /** Coast distance in steps over water (0 at coastal water; clamped on water; 65535 on land). */
      coastDistance: TypedArraySchemas.u16({
        description:
          "Coast distance in steps over water (0 at coastal water; clamped to maxCoastDistance on water; 65535 on land).",
      }),
      /** Advisory coast normal U component per tile (-127..127). */
      coastNormalU: TypedArraySchemas.i8({
        description: "Advisory coast normal U component per tile (-127..127).",
      }),
      /** Advisory coast normal V component per tile (-127..127). */
      coastNormalV: TypedArraySchemas.i8({
        description: "Advisory coast normal V component per tile (-127..127).",
      }),
      /** Advisory coast tangent U component per tile (-127..127). */
      coastTangentU: TypedArraySchemas.i8({
        description: "Advisory coast tangent U component per tile (-127..127).",
      }),
      /** Advisory coast tangent V component per tile (-127..127). */
      coastTangentV: TypedArraySchemas.i8({
        description: "Advisory coast tangent V component per tile (-127..127).",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Shared basin and coastline evidence consumed by current projection, with map-grid sentinels retained on land.",
    }
  ),
  strategies: [connectedBasinsDefinition],
});

export default ComputeOceanGeometryContract;
