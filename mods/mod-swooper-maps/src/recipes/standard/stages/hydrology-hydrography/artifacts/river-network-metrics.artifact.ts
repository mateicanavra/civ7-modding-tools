import {
  defineArtifact,
  Type,
  TypedArraySchemas,
  validateArtifactSchema,
} from "@swooper/mapgen-core/authoring/contracts";

const HydrologyRiverNetworkBenchmarkSummarySchema = Type.Object(
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
      "Aggregate Hydrology river/lake benchmark metrics for diagnostics, Studio, and product evidence rows.",
  }
);

/**
 * Runtime contract for per-tile river hierarchy, mouth, slope, and permanence classifications
 * plus aggregate benchmark evidence derived before engine projection.
 */
export const HydrologyRiverNetworkMetricsArtifactSchema = Type.Object(
  {
    upstreamArea: TypedArraySchemas.i32({
      description: "Contributing land-tile count draining through each land tile.",
    }),
    streamOrderProxy: TypedArraySchemas.u8({
      description:
        "Strahler-like hierarchy proxy over Hydrology river truth (0 on non-river tiles).",
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
    benchmarkSummary: HydrologyRiverNetworkBenchmarkSummarySchema,
  },
  {
    additionalProperties: false,
    description:
      "Hydrology-owned river-network diagnostic metrics derived from routing/discharge/lake truth before map projection.",
  }
);

/** Canonical schema entrypoint for publishing and validating river-network evidence. */
export const Schema = HydrologyRiverNetworkMetricsArtifactSchema;

/**
 * Registers Hydrology-owned network hierarchy, mouth, slope, permanence, and aggregate
 * benchmark evidence. It supports diagnostics and product proof without becoming
 * river-placement authority.
 */
export const artifact = defineArtifact({
  name: "riverNetworkMetrics",
  id: "artifact:hydrology.riverNetworkMetrics",
  schema: Schema,
});

/** Returns every TypeBox schema issue for classified river-network metrics without throwing. */
export function validate(value: unknown): readonly { message: string }[] {
  return validateArtifactSchema(Schema, value);
}
