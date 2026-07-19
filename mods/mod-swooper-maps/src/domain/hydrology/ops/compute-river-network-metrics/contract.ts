import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

const ComputeRiverNetworkMetricsInputSchema = Type.Object(
  {
    width: Type.Integer({ minimum: 1, description: "Tile grid width (columns)." }),
    height: Type.Integer({ minimum: 1, description: "Tile grid height (rows)." }),
    landMask: TypedArraySchemas.u8({
      description: "Hydrology land mask per tile (1=land, 0=water).",
    }),
    elevation: TypedArraySchemas.i16({
      description: "Morphology-owned terrain elevation per tile.",
    }),
    routingElevation: TypedArraySchemas.f32({
      description:
        "Hydrologically conditioned routing surface used for spill-aware slope classification.",
    }),
    depressionDepth: TypedArraySchemas.f32({
      description: "Depression fill depth per tile from Hydrology drainage conditioning.",
    }),
    runoff: TypedArraySchemas.f32({
      description: "Local runoff proxy per tile from Hydrology discharge inputs.",
    }),
    discharge: TypedArraySchemas.f32({
      description: "Accumulated discharge proxy per tile.",
    }),
    riverClass: TypedArraySchemas.u8({
      description: "Hydrology river class per tile (0=none, 1=minor, >=2=major).",
    }),
    flowDir: TypedArraySchemas.i32({
      description:
        "Hydrology-conditioned receiver index per tile (land receiver, water receiver, or -1 for typed terminal).",
    }),
    basinId: TypedArraySchemas.i32({
      description: "Hydrology drainage basin identifier per tile (-1 on water/unassigned).",
    }),
    terminalType: TypedArraySchemas.u8({
      description: "Terminal classification per land tile: 0=none, 1=ocean, 2=closed basin.",
    }),
    lakeMask: TypedArraySchemas.u8({
      description: "Hydrology accepted lake mask per tile (1=accepted lake, 0=not lake).",
    }),
  },
  {
    additionalProperties: false,
    description: "Inputs for Hydrology river-network metrics.",
  }
);

const RiverNetworkBenchmarkSummarySchema = Type.Object(
  {
    version: Type.Literal(1),
    landTileCount: Type.Integer({ minimum: 0 }),
    waterTileCount: Type.Integer({ minimum: 0 }),
    lakeTileCount: Type.Integer({ minimum: 0 }),
    lakeLandShare: Type.Number({ minimum: 0, maximum: 1 }),
    riverTileCount: Type.Integer({ minimum: 0 }),
    minorRiverTileCount: Type.Integer({ minimum: 0 }),
    majorRiverTileCount: Type.Integer({ minimum: 0 }),
    riverLandShare: Type.Number({ minimum: 0, maximum: 1 }),
    minorRiverShareOfRiverTiles: Type.Number({ minimum: 0, maximum: 1 }),
    majorRiverShareOfRiverTiles: Type.Number({ minimum: 0, maximum: 1 }),
    streamOrder1RiverTileCount: Type.Integer({ minimum: 0 }),
    lowOrderRiverTileCount: Type.Integer({ minimum: 0 }),
    lowOrderRiverShareOfRiverTiles: Type.Number({ minimum: 0, maximum: 1 }),
    dryFlowTileCount: Type.Integer({ minimum: 0 }),
    ephemeralFlowTileCount: Type.Integer({ minimum: 0 }),
    intermittentFlowTileCount: Type.Integer({ minimum: 0 }),
    perennialFlowTileCount: Type.Integer({ minimum: 0 }),
    nonDryFlowLandShare: Type.Number({ minimum: 0, maximum: 1 }),
    riverDryTileCount: Type.Integer({ minimum: 0 }),
    riverEphemeralTileCount: Type.Integer({ minimum: 0 }),
    riverIntermittentTileCount: Type.Integer({ minimum: 0 }),
    riverPerennialTileCount: Type.Integer({ minimum: 0 }),
    nonPerennialRiverShareOfRiverTiles: Type.Number({ minimum: 0, maximum: 1 }),
    oceanMouthTileCount: Type.Integer({ minimum: 0 }),
    acceptedLakeMouthTileCount: Type.Integer({ minimum: 0 }),
    closedBasinMouthTileCount: Type.Integer({ minimum: 0 }),
    spillPathMouthTileCount: Type.Integer({ minimum: 0 }),
    unresolvedMouthTileCount: Type.Integer({ minimum: 0 }),
    resolvedMouthTileCount: Type.Integer({ minimum: 0 }),
    assignedBasinLandTileCount: Type.Integer({ minimum: 0 }),
    unassignedBasinLandTileCount: Type.Integer({ minimum: 0 }),
    invalidReceiverTileCount: Type.Integer({ minimum: 0 }),
    downstreamDischargeDropEdgeCount: Type.Integer({ minimum: 0 }),
    closedOrLakeTerminalLandShare: Type.Number({ minimum: 0, maximum: 1 }),
    lakeConnectedTerminalDischargeShare: Type.Number({ minimum: 0, maximum: 1 }),
    maxUpstreamArea: Type.Integer({ minimum: 0 }),
    maxStreamOrderProxy: Type.Integer({ minimum: 0 }),
  },
  {
    additionalProperties: false,
    description:
      "Hydrology-owned aggregate metrics used to compare generated drainage, river hierarchy, terminals, and lakes against external Earth benchmark families.",
  }
);

const ComputeRiverNetworkMetricsOutputSchema = Type.Object(
  {
    upstreamArea: TypedArraySchemas.i32({
      description: "Contributing land-tile count draining through each land tile.",
    }),
    streamOrderProxy: TypedArraySchemas.u8({
      description:
        "Strahler-like hierarchy proxy over Hydrology minor/major river truth (0 on non-river tiles).",
    }),
    mouthType: TypedArraySchemas.u8({
      description:
        "Drainage mouth classification per land tile: 0=unresolved, 1=ocean, 2=accepted lake, 3=closed basin, 4=spill-path routed.",
    }),
    slopeClass: TypedArraySchemas.u8({
      description:
        "Slope class per land tile: 0=none/water, 1=flat, 2=low, 3=moderate, 4=steep, 5=mountain-blocked closed basin.",
    }),
    flowPermanenceProxy: TypedArraySchemas.u8({
      description:
        "Flow permanence proxy per land tile: 0=dry/no-signal, 1=ephemeral, 2=intermittent, 3=perennial.",
    }),
    benchmarkSummary: RiverNetworkBenchmarkSummarySchema,
  },
  {
    additionalProperties: false,
    description: "Hydrology-owned river-network metrics and diagnostic classifications.",
  }
);

const ComputeRiverNetworkMetricsDefaultStrategySchema = Type.Object(
  {
    highOrderConfluenceUpstreamAreaMin: Type.Integer({
      minimum: 0,
      default: 64,
      description:
        "Minimum receiver upstream-area required before a >=2-tributary confluence may escalate stream-order proxy beyond order 2. Headwater (order 1->2) confluences ignore this floor; it suppresses spurious order-3 promotions on small networks where tiny equal-order branches merge.",
    }),
  },
  {
    additionalProperties: false,
    description: "Default Hydrology river-network metric derivation.",
  }
);

const ComputeRiverNetworkMetricsContract = defineOp({
  kind: "compute",
  id: "hydrology/compute-river-network-metrics",
  input: ComputeRiverNetworkMetricsInputSchema,
  output: ComputeRiverNetworkMetricsOutputSchema,
  defaultStrategy: "default",
  strategies: {
    default: ComputeRiverNetworkMetricsDefaultStrategySchema,
  },
});

export default ComputeRiverNetworkMetricsContract;
