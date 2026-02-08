import { Type, TypedArraySchemas, defineOp } from "@swooper/mapgen-core/authoring";

const AtollRulesSchema = Type.Object({
  enableClustering: Type.Boolean({ default: true }),
  clusterRadius: Type.Number({ default: 1, minimum: 0, maximum: 2 }),
  equatorialBandMaxAbsLatitude: Type.Number({ default: 23, minimum: 0, maximum: 90 }),
  shallowWaterAdjacencyGateChance: Type.Number({ default: 30, minimum: 0, maximum: 100 }),
  shallowWaterAdjacencyRadius: Type.Number({ default: 1, minimum: 1 }),
  growthChanceEquatorial: Type.Number({ default: 15, minimum: 0, maximum: 100 }),
  growthChanceNonEquatorial: Type.Number({ default: 5, minimum: 0, maximum: 100 }),
});

const PlanAquaticAtollPlacementsContract = defineOp({
  kind: "plan",
  id: "ecology/features/aquatic-placement/atoll",
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
        feature: Type.Literal("FEATURE_ATOLL"),
      })
    ),
  }),
  strategies: {
    default: Type.Object({
      multiplier: Type.Number({
        description: "Scalar multiplier applied to base atoll chance (0..2 typical).",
        default: 1,
        minimum: 0,
      }),
      chance: Type.Number({ default: 12, minimum: 0, maximum: 100 }),
      rules: AtollRulesSchema,
    }),
  },
});

export default PlanAquaticAtollPlacementsContract;

