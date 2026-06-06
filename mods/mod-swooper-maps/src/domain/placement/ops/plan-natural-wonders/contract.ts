import { Type, TypedArraySchemas, defineOp } from "@swooper/mapgen-core/authoring";

const PlanNaturalWondersContract = defineOp({
  kind: "plan",
  id: "placement/plan-natural-wonders",
  input: Type.Object({
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    wondersCount: Type.Integer({ minimum: 0 }),
    landMask: TypedArraySchemas.u8({ description: "Land mask per tile (1=land, 0=water)." }),
    elevation: TypedArraySchemas.i16({ description: "Elevation per tile (meters)." }),
    aridityIndex: TypedArraySchemas.f32({ description: "Aridity index per tile (0..1)." }),
    riverClass: TypedArraySchemas.u8({ description: "Hydrology river class per tile (0=none,1=minor,2=major)." }),
    lakeMask: TypedArraySchemas.u8({ description: "Hydrology lake mask per tile (1=lake, 0=non-lake)." }),
    coastTerrainType: Type.Integer({ minimum: 0 }),
    mountainTerrainType: Type.Integer({ minimum: 0 }),
    iceFeatureType: Type.Integer({ minimum: 0 }),
    terrainType: TypedArraySchemas.u8({ description: "Current engine terrain type per tile." }),
    biomeType: TypedArraySchemas.u8({ description: "Current engine biome type per tile." }),
    featureType: TypedArraySchemas.i16({ description: "Current engine feature type per tile." }),
    noFeatureType: Type.Integer({ description: "Engine sentinel for an unoccupied feature slot." }),
    naturalWonderBlockedMask: TypedArraySchemas.u8({
      description:
        "Mask (1/0): tile terrain/placement is protected by static map policy and must not host natural-wonder placement.",
    }),
    featureCatalog: Type.Array(
      Type.Object({
        featureType: Type.Integer({ minimum: 0 }),
        direction: Type.Integer(),
        validTerrainTypes: Type.Optional(Type.Array(Type.Integer({ minimum: 0 }))),
        validBiomeTypes: Type.Optional(Type.Array(Type.Integer({ minimum: 0 }))),
        minimumElevation: Type.Optional(Type.Number()),
        noLake: Type.Optional(Type.Boolean()),
        placementClass: Type.Optional(Type.String()),
        naturalWonderTiles: Type.Optional(Type.Integer({ minimum: 1 })),
        featureTags: Type.Optional(Type.Array(Type.String())),
        footprintOffsets: Type.Optional(
          Type.Array(
            Type.Object({
              dx: Type.Integer(),
              dy: Type.Integer(),
            })
          )
        ),
      })
    ),
  }),
  output: Type.Object({
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    wondersCount: Type.Integer({ minimum: 0 }),
    targetCount: Type.Integer({ minimum: 0 }),
    plannedCount: Type.Integer({ minimum: 0 }),
    placements: Type.Array(
      Type.Object({
        plotIndex: Type.Integer({ minimum: 0 }),
        featureType: Type.Integer({ minimum: 0 }),
        direction: Type.Integer(),
        elevation: Type.Number(),
        priority: Type.Number({ minimum: 0, maximum: 1 }),
      })
    ),
  }),
  strategies: {
    default: Type.Object({
      minSpacingTiles: Type.Integer({
        minimum: 0,
        maximum: 16,
        default: 6,
        description: "Minimum hex spacing between planned natural wonder placements.",
      }),
    }),
  },
});

export default PlanNaturalWondersContract;
