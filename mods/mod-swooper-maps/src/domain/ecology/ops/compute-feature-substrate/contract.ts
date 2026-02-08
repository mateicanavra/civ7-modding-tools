import { Type, TypedArraySchemas, defineOp } from "@swooper/mapgen-core/authoring";

const FeatureSubstrateConfigSchema = Type.Object(
  {
    navigableRiverClass: Type.Integer({
      description: "riverClass value treated as a navigable river.",
      default: 2,
      minimum: 0,
      maximum: 255,
    }),
    nearRiverRadius: Type.Integer({
      description: "Square-radius used to compute near-river adjacency mask.",
      default: 2,
      minimum: 0,
    }),
    isolatedRiverRadius: Type.Integer({
      description: "Square-radius used to compute isolated-river adjacency mask.",
      default: 1,
      minimum: 0,
    }),
    coastalAdjacencyRadius: Type.Integer({
      description: "Square-radius used to compute coastal land adjacency mask.",
      default: 1,
      minimum: 0,
    }),
  },
  {
    additionalProperties: false,
    description:
      "Shared compute substrate tuning for feature planning masks. This should stay small and reusable.",
  }
);

/**
 * Computes reusable feature-planning substrate masks (rivers + coastal adjacency) for multiple planners.
 */
const ComputeFeatureSubstrateContract = defineOp({
  kind: "compute",
  id: "ecology/compute-feature-substrate",
  input: Type.Object(
    {
      width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
      height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
      riverClass: TypedArraySchemas.u8({
        description: "River class per tile (0=no river, >0 indicates river presence).",
      }),
      landMask: TypedArraySchemas.u8({
        description: "Land mask per tile (1=land, 0=water).",
      }),
    },
    { additionalProperties: false }
  ),
  output: Type.Object({
    navigableRiverMask: TypedArraySchemas.u8({
      description: "Mask (1/0): tiles that are navigable rivers (by riverClass).",
    }),
    nearRiverMask: TypedArraySchemas.u8({
      description: "Mask (1/0): tiles within nearRiverRadius of any river tile.",
    }),
    isolatedRiverMask: TypedArraySchemas.u8({
      description: "Mask (1/0): tiles within isolatedRiverRadius of any river tile.",
    }),
    coastalLandMask: TypedArraySchemas.u8({
      description: "Mask (1/0): land tiles within coastalAdjacencyRadius of any water tile.",
    }),
  }),
  strategies: {
    default: FeatureSubstrateConfigSchema,
  },
});

export default ComputeFeatureSubstrateContract;

