import { Type, TypedArraySchemas, defineOp } from "@swooper/mapgen-core/authoring";

const PlanLakesContract = defineOp({
  kind: "compute",
  id: "hydrology/plan-lakes",
  input: Type.Object({
    width: Type.Integer({ minimum: 1, description: "Tile grid width (columns)." }),
    height: Type.Integer({ minimum: 1, description: "Tile grid height (rows)." }),
    landMask: TypedArraySchemas.u8({ description: "Land mask per tile (1=land, 0=water)." }),
    flowDir: TypedArraySchemas.i32({
      description: "Steepest-descent receiver index per tile (or -1 for sinks/edges).",
    }),
    sinkMask: TypedArraySchemas.u8({
      description: "Hydrology sink mask (1=sink, 0=not sink), tile order.",
    }),
  }),
  output: Type.Object({
    lakeMask: TypedArraySchemas.u8({
      description: "Deterministic lake plan mask (1=planned lake tile, 0=non-lake).",
    }),
    plannedLakeTileCount: Type.Integer({
      minimum: 0,
      description: "Count of tiles marked as planned lakes.",
    }),
    sinkLakeCount: Type.Integer({
      minimum: 0,
      description: "Count of sink tiles mapped to lake tiles.",
    }),
  }),
  strategies: {
    default: Type.Object({
      maxUpstreamSteps: Type.Integer({
        minimum: 0,
        maximum: 8,
        default: 0,
        description:
          "How many upstream drainage hops to include from sink tiles when expanding planned lakes.",
      }),
    }),
  },
});

export default PlanLakesContract;
