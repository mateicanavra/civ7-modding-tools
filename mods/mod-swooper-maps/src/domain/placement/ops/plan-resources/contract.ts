import { Type, TypedArraySchemas, defineOp } from "@swooper/mapgen-core/authoring";

const PlanResourcesContract = defineOp({
  kind: "plan",
  id: "placement/plan-resources",
  input: Type.Object({
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    noResourceSentinel: Type.Integer({
      description: "Adapter-level sentinel used to represent an empty resource slot.",
    }),
    runtimeCandidateResourceTypes: Type.Array(Type.Integer(), {
      description:
        "Adapter-provided resource candidates (deterministic ordering).",
      default: [],
    }),
    landMask: TypedArraySchemas.u8({ description: "Land mask per tile (1=land, 0=water)." }),
    fertility: TypedArraySchemas.f32({ description: "Pedology fertility field (0..1)." }),
    effectiveMoisture: TypedArraySchemas.f32({
      description: "Ecology effective moisture field (normalized in strategy).",
    }),
    surfaceTemperature: TypedArraySchemas.f32({
      description: "Surface temperature per tile (C).",
    }),
    aridityIndex: TypedArraySchemas.f32({
      description: "Aridity index per tile (0..1).",
    }),
    riverClass: TypedArraySchemas.u8({
      description: "Hydrology river class per tile (0=none,1=minor,2=major).",
    }),
    lakeMask: TypedArraySchemas.u8({
      description: "Hydrology deterministic lake plan mask (1=lake, 0=non-lake).",
    }),
  }),
  output: Type.Object({
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    candidateResourceTypes: Type.Array(Type.Integer({ minimum: 0 })),
    targetCount: Type.Integer({ minimum: 0 }),
    plannedCount: Type.Integer({ minimum: 0 }),
    placements: Type.Array(
      Type.Object({
        plotIndex: Type.Integer({ minimum: 0 }),
        preferredResourceType: Type.Integer({ minimum: 0 }),
        preferredTypeOffset: Type.Integer({ minimum: 0 }),
        priority: Type.Number({ minimum: 0, maximum: 1 }),
      })
    ),
  }),
  strategies: {
    default: Type.Object({
      candidateResourceTypes: Type.Array(Type.Integer({ minimum: 0 }), {
        default: [
          0, 1, 2, 3, 4, 5, 6, 7,
          8, 9, 10, 11, 12, 13, 14, 15,
          16, 17, 18, 19, 20, 21, 22, 23,
          24, 25, 26, 27, 28, 29, 30, 31,
          32, 33, 34, 35, 36, 37, 38, 39,
          40,
        ],
      }),
      densityPer100Tiles: Type.Number({
        minimum: 0,
        maximum: 50,
        default: 9,
        description: "Target resource density over land tiles.",
      }),
      minSpacingTiles: Type.Integer({
        minimum: 0,
        maximum: 8,
        default: 2,
        description: "Minimum odd-q hex spacing between planned resources.",
      }),
      maxPlacementsPerResourceShare: Type.Number({
        minimum: 0.05,
        maximum: 1,
        default: 0.3,
        description: "Upper share cap for each resource type to avoid single-type collapse.",
      }),
    }),
  },
});

export default PlanResourcesContract;
