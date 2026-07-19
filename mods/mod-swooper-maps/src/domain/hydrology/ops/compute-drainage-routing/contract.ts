import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

const ComputeDrainageRoutingInputSchema = Type.Object(
  {
    width: Type.Integer({ minimum: 1, description: "Tile grid width (columns)." }),
    height: Type.Integer({ minimum: 1, description: "Tile grid height (rows)." }),
    elevation: TypedArraySchemas.i16({
      description: "Morphology-owned terrain elevation per tile.",
    }),
    landMask: TypedArraySchemas.u8({
      description: "Morphology-owned land mask per tile (1=land, 0=water).",
    }),
  },
  {
    additionalProperties: false,
    description: "Inputs for Hydrology drainage routing over Morphology terrain.",
  }
);

const ComputeDrainageRoutingOutputSchema = Type.Object(
  {
    flowDir: TypedArraySchemas.i32({
      description:
        "Depression-conditioned receiver index per tile. Land receivers may point to land or water; -1 marks typed external/closed terminals only.",
    }),
    flowAccum: TypedArraySchemas.f32({
      description: "Unweighted contributing land-tile count accumulated along flowDir.",
    }),
    basinId: TypedArraySchemas.i32({
      description: "Drainage basin id per tile (-1 on water/unassigned).",
    }),
    routingElevation: TypedArraySchemas.f32({
      description:
        "Hydrologically conditioned routing surface used to drain filled depressions without mutating Morphology elevation.",
    }),
    depressionDepth: TypedArraySchemas.f32({
      description:
        "Positive where the conditioned routing surface stands above raw terrain, indicating filled depression storage/spill depth.",
    }),
    sinkMask: TypedArraySchemas.u8({
      description:
        "Lake/closed-basin candidate mask derived from raw local drainage minima; not a discharge stop unless terminalType marks closed-basin.",
    }),
    outletMask: TypedArraySchemas.u8({
      description: "Land tiles that drain directly to ocean/water or an external map edge.",
    }),
    terminalType: TypedArraySchemas.u8({
      description:
        "Terminal classification per land tile: 0=none/nonterminal, 1=ocean/water outlet, 2=closed basin.",
    }),
  },
  {
    additionalProperties: false,
    description: "Hydrology drainage routing truth and diagnostics.",
  }
);

const ComputeDrainageRoutingDefaultStrategySchema = Type.Object(
  {
    allowExternalEdgeOutlets: Type.Boolean({
      default: false,
      description:
        "Allows north/south map-edge land to drain externally when no lower water outlet exists.",
    }),
  },
  {
    additionalProperties: false,
    description: "Drainage routing parameters (default strategy).",
  }
);

const ComputeDrainageRoutingContract = defineOp({
  kind: "compute",
  id: "hydrology/compute-drainage-routing",
  input: ComputeDrainageRoutingInputSchema,
  output: ComputeDrainageRoutingOutputSchema,
  defaultStrategy: "default",
  strategies: {
    default: ComputeDrainageRoutingDefaultStrategySchema,
  },
});

export default ComputeDrainageRoutingContract;
