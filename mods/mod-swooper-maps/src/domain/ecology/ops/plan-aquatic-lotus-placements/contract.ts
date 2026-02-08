import { Type, TypedArraySchemas, defineOp } from "@swooper/mapgen-core/authoring";

const PlanAquaticLotusPlacementsContract = defineOp({
  kind: "plan",
  id: "ecology/features/aquatic-placement/lotus",
  input: Type.Object({
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    seed: Type.Number({ description: "Deterministic seed for aquatic placement RNG." }),
    landMask: TypedArraySchemas.u8({ description: "Land mask per tile (1=land, 0=water)." }),
    terrainType: TypedArraySchemas.u8({ description: "Terrain type id per tile." }),
    latitude: TypedArraySchemas.f32({ description: "Latitude per tile (degrees)." }),
    featureKeyField: TypedArraySchemas.i16({
      description: "Existing feature key indices per tile (-1 for empty).",
    }),
    coastTerrain: Type.Integer({ description: "Terrain id for coast/shallow water." }),
  }),
  output: Type.Object({
    placements: Type.Array(
      Type.Object({
        x: Type.Integer({ minimum: 0 }),
        y: Type.Integer({ minimum: 0 }),
        feature: Type.Literal("FEATURE_LOTUS"),
      })
    ),
  }),
  strategies: {
    default: Type.Object({
      multiplier: Type.Number({
        description: "Scalar multiplier applied to lotus chance (0..2 typical).",
        default: 1,
        minimum: 0,
      }),
      chance: Type.Number({ default: 15, minimum: 0, maximum: 100 }),
    }),
  },
});

export default PlanAquaticLotusPlacementsContract;

