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

/**
 * Aggregate measurements produced with the river-network classifications.
 * Metric studies may compare these observations with targets, but the operation
 * owns their causal definitions and does not encode benchmark policy.
 */
export const RiverNetworkMeasurementsSchema = Type.Object(
  {
    version: Type.Literal(1, {
      description: "Schema version for the river-network measurement record.",
    }),
    landTileCount: Type.Integer({
      minimum: 0,
      description: "Number of tiles classified as land by Hydrology.",
    }),
    waterTileCount: Type.Integer({
      minimum: 0,
      description: "Number of grid tiles not classified as land by Hydrology.",
    }),
    lakeTileCount: Type.Integer({
      minimum: 0,
      description: "Number of land tiles admitted into accepted lake surfaces.",
    }),
    lakeLandShare: Type.Number({
      minimum: 0,
      maximum: 1,
      description: "Accepted lake-tile count divided by total land-tile count.",
    }),
    riverTileCount: Type.Integer({
      minimum: 0,
      description: "Number of land tiles classified as either minor or major river.",
    }),
    minorRiverTileCount: Type.Integer({
      minimum: 0,
      description: "Number of land tiles classified as minor river.",
    }),
    majorRiverTileCount: Type.Integer({
      minimum: 0,
      description: "Number of land tiles classified as major river.",
    }),
    riverLandShare: Type.Number({
      minimum: 0,
      maximum: 1,
      description: "River-tile count divided by total land-tile count.",
    }),
    minorRiverShareOfRiverTiles: Type.Number({
      minimum: 0,
      maximum: 1,
      description: "Minor-river tile count divided by total river-tile count.",
    }),
    majorRiverShareOfRiverTiles: Type.Number({
      minimum: 0,
      maximum: 1,
      description: "Major-river tile count divided by total river-tile count.",
    }),
    streamOrder1RiverTileCount: Type.Integer({
      minimum: 0,
      description: "Number of river tiles classified as first-order headwaters.",
    }),
    lowOrderRiverTileCount: Type.Integer({
      minimum: 0,
      description: "Number of river tiles with stream-order proxy 1 or 2.",
    }),
    lowOrderRiverShareOfRiverTiles: Type.Number({
      minimum: 0,
      maximum: 1,
      description: "Order-1-or-2 river-tile count divided by total river-tile count.",
    }),
    dryFlowTileCount: Type.Integer({
      minimum: 0,
      description: "Number of land tiles whose discharge signal is classified as dry.",
    }),
    ephemeralFlowTileCount: Type.Integer({
      minimum: 0,
      description: "Number of land tiles whose discharge signal is classified as ephemeral.",
    }),
    intermittentFlowTileCount: Type.Integer({
      minimum: 0,
      description: "Number of land tiles whose discharge signal is classified as intermittent.",
    }),
    perennialFlowTileCount: Type.Integer({
      minimum: 0,
      description: "Number of land tiles whose discharge signal is classified as perennial.",
    }),
    nonDryFlowLandShare: Type.Number({
      minimum: 0,
      maximum: 1,
      description:
        "Ephemeral, intermittent, and perennial flow-tile count divided by total land-tile count.",
    }),
    riverDryTileCount: Type.Integer({
      minimum: 0,
      description: "Number of river tiles whose discharge signal is classified as dry.",
    }),
    riverEphemeralTileCount: Type.Integer({
      minimum: 0,
      description: "Number of river tiles whose discharge signal is classified as ephemeral.",
    }),
    riverIntermittentTileCount: Type.Integer({
      minimum: 0,
      description: "Number of river tiles whose discharge signal is classified as intermittent.",
    }),
    riverPerennialTileCount: Type.Integer({
      minimum: 0,
      description: "Number of river tiles whose discharge signal is classified as perennial.",
    }),
    nonPerennialRiverShareOfRiverTiles: Type.Number({
      minimum: 0,
      maximum: 1,
      description:
        "Dry, ephemeral, and intermittent river-tile count divided by total river-tile count.",
    }),
    oceanMouthTileCount: Type.Integer({
      minimum: 0,
      description: "Number of land tiles whose drainage path resolves to an ocean mouth.",
    }),
    acceptedLakeMouthTileCount: Type.Integer({
      minimum: 0,
      description: "Number of land tiles whose drainage path resolves to an accepted lake.",
    }),
    closedBasinMouthTileCount: Type.Integer({
      minimum: 0,
      description: "Number of land tiles whose drainage path terminates in a closed basin.",
    }),
    spillPathMouthTileCount: Type.Integer({
      minimum: 0,
      description:
        "Number of land tiles whose drainage reaches ocean or lake through a conditioned spill path.",
    }),
    unresolvedMouthTileCount: Type.Integer({
      minimum: 0,
      description: "Number of land tiles whose drainage terminal remains unclassified.",
    }),
    resolvedMouthTileCount: Type.Integer({
      minimum: 0,
      description: "Number of land tiles whose drainage terminal has a recognized mouth class.",
    }),
    assignedBasinLandTileCount: Type.Integer({
      minimum: 0,
      description: "Number of land tiles assigned a nonnegative drainage-basin identifier.",
    }),
    unassignedBasinLandTileCount: Type.Integer({
      minimum: 0,
      description: "Number of land tiles without an assigned drainage-basin identifier.",
    }),
    invalidReceiverTileCount: Type.Integer({
      minimum: 0,
      description: "Number of land tiles whose encoded receiver lies outside the grid contract.",
    }),
    downstreamDischargeDropEdgeCount: Type.Integer({
      minimum: 0,
      description:
        "Number of land-to-land flow edges where accumulated discharge decreases downstream.",
    }),
    closedOrLakeTerminalLandShare: Type.Number({
      minimum: 0,
      maximum: 1,
      description:
        "Land tiles draining to accepted lakes or closed basins divided by total land-tile count.",
    }),
    lakeConnectedTerminalDischargeShare: Type.Number({
      minimum: 0,
      maximum: 1,
      description:
        "Terminal discharge connected to accepted lakes divided by all measured terminal discharge.",
    }),
    maxUpstreamArea: Type.Integer({
      minimum: 0,
      description: "Largest contributing land-tile count observed at any land tile.",
    }),
    maxStreamOrderProxy: Type.Integer({
      minimum: 0,
      description: "Highest Strahler-like stream-order proxy observed on the river network.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Hydrology measurements of generated drainage, river hierarchy, terminal resolution, and lakes.",
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
    measurements: RiverNetworkMeasurementsSchema,
  },
  {
    additionalProperties: false,
    description: "Hydrology-owned river-network metrics and diagnostic classifications.",
  }
);

const HydrographicClassificationStrategySchema = Type.Object(
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
    description:
      "Hydrographic classification controls for deriving river hierarchy from confluences and contributing area.",
  }
);

const ComputeRiverNetworkMetricsContract = defineOp({
  kind: "compute",
  id: "hydrology/compute-river-network-metrics",
  input: ComputeRiverNetworkMetricsInputSchema,
  output: ComputeRiverNetworkMetricsOutputSchema,
  strategies: {
    "hydrographic-classification": HydrographicClassificationStrategySchema,
  },
});

export default ComputeRiverNetworkMetricsContract;
