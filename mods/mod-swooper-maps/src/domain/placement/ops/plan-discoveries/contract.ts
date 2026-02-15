import { Type, TypedArraySchemas, defineOp } from "@swooper/mapgen-core/authoring";

const PlanDiscoveriesContract = defineOp({
  kind: "plan",
  id: "placement/plan-discoveries",
  input: Type.Object({
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    landMask: TypedArraySchemas.u8({ description: "Land mask per tile (1=land, 0=water)." }),
    elevation: TypedArraySchemas.i16({ description: "Elevation per tile (meters)." }),
    aridityIndex: TypedArraySchemas.f32({ description: "Aridity index per tile (0..1)." }),
    riverClass: TypedArraySchemas.u8({ description: "Hydrology river class per tile (0=none,1=minor,2=major)." }),
    lakeMask: TypedArraySchemas.u8({ description: "Hydrology lake mask per tile (1=lake, 0=non-lake)." }),
    discoveryVisualType: Type.Integer({ minimum: 0 }),
    discoveryActivationType: Type.Integer({ minimum: 0 }),
  }),
  output: Type.Object({
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    targetCount: Type.Integer({ minimum: 0 }),
    plannedCount: Type.Integer({ minimum: 0 }),
    placements: Type.Array(
      Type.Object({
        plotIndex: Type.Integer({ minimum: 0 }),
        discoveryVisualType: Type.Integer({ minimum: 0 }),
        discoveryActivationType: Type.Integer({ minimum: 0 }),
        priority: Type.Number({ minimum: 0, maximum: 1 }),
      })
    ),
  }),
  strategies: {
    default: Type.Object({
      densityPer100Tiles: Type.Number({
        minimum: 0,
        maximum: 50,
        default: 3,
        description: "Target discovery density over land tiles.",
      }),
      minSpacingTiles: Type.Integer({
        minimum: 0,
        maximum: 12,
        default: 3,
        description: "Minimum hex spacing between planned discovery placements.",
      }),
    }),
  },
});

export default PlanDiscoveriesContract;
