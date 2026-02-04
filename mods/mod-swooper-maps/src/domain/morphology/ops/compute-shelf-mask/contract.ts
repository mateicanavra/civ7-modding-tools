import { Type, TypedArraySchemas, defineOp } from "@swooper/mapgen-core/authoring";

const ShelfMaskConfigSchema = Type.Object(
  {
    nearshoreDistance: Type.Integer({
      default: 3,
      minimum: 0,
      description: "Candidate nearshore water distance cap (tiles) used to sample bathymetry for the shallow cutoff.",
    }),
    shallowQuantile: Type.Number({
      default: 0.7,
      minimum: 0,
      maximum: 1,
      description:
        "Quantile (0..1) of nearshore bathymetry used as the shallow cutoff (higher => narrower shelf; lower => wider).",
    }),
    activeClosenessThreshold: Type.Number({
      default: 0.45,
      minimum: 0,
      maximum: 1,
      description:
        "Boundary closeness threshold (0..1) for treating convergent/transform margins as active for shelf narrowing.",
    }),
    capTilesActive: Type.Integer({
      default: 2,
      minimum: 0,
      description: "Max distance to coast (tiles) for shelf classification near active margins.",
    }),
    capTilesPassive: Type.Integer({
      default: 4,
      minimum: 0,
      description: "Max distance to coast (tiles) for shelf classification away from active margins.",
    }),
    capTilesMax: Type.Integer({
      default: 8,
      minimum: 0,
      description: "Hard clamp on the per-tile distance cap (tiles).",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Shelf classifier controls (steering inputs): nearshore sampling distance, shallow cutoff quantile, and margin-aware distance caps.",
  }
);

/**
 * Computes a shallow-shelf water mask for projecting to Civ7 TERRAIN_COAST.
 *
 * Intent:
 * - Deterministic, Morphology-derived shelf band (no Civ RNG helpers).
 * - Narrow shelves near active (convergent/transform) margins; wider elsewhere.
 */
const ComputeShelfMaskContract = defineOp({
  kind: "compute",
  id: "morphology/compute-shelf-mask",
  input: Type.Object({
    width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
    height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
    landMask: TypedArraySchemas.u8({ description: "Land mask per tile (1=land, 0=water)." }),
    bathymetry: TypedArraySchemas.i16({
      description: "Bathymetry per tile (meters): 0 on land; <=0 in water; closer to 0 is shallower.",
    }),
    distanceToCoast: TypedArraySchemas.u16({
      description: "Distance to coast per tile (0=coast).",
    }),
    boundaryCloseness: TypedArraySchemas.u8({ description: "Boundary proximity per tile (0..255)." }),
    boundaryType: TypedArraySchemas.u8({ description: "Boundary type per tile (1=conv,2=div,3=trans)." }),
  }),
  output: Type.Object({
    shelfMask: TypedArraySchemas.u8({
      description: "Mask (1/0): shallow shelf water eligible for TERRAIN_COAST projection.",
    }),
    activeMarginMask: TypedArraySchemas.u8({
      description:
        "Mask (1/0): tiles treated as active margin for shelf narrowing (convergent/transform with high closeness).",
    }),
    capTilesByTile: TypedArraySchemas.u8({
      description:
        "Per-tile distance cap (tiles) used by the shelf classifier (active margins narrower, passive wider).",
    }),
    nearshoreCandidateMask: TypedArraySchemas.u8({
      description:
        "Mask (1/0): water tiles within nearshoreDistance used to sample bathymetry for the shallow cutoff.",
    }),
    depthGateMask: TypedArraySchemas.u8({
      description: "Mask (1/0): water tiles passing the shallow bathymetry cutoff (bathymetry >= shallowCutoff).",
    }),
    shallowCutoff: Type.Number({
      description:
        "Bathymetry cutoff (meters, <=0) selected deterministically from nearshore samples; bathymetry >= cutoff is treated as shallow.",
    }),
  }),
  strategies: {
    default: ShelfMaskConfigSchema,
  },
});

export default ComputeShelfMaskContract;
