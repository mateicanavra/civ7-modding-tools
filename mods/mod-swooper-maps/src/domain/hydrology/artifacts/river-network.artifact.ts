import {
  type ArtifactValidationContext,
  type ArtifactValidationIssue,
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  defineArtifact,
  defineArtifactValidator,
  type Static,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";

/**
 * Runtime contract for per-tile river hierarchy, mouth, slope, and permanence classifications
 * derived before engine projection.
 */
export const Schema = Type.Object(
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
  },
  {
    additionalProperties: false,
    description:
      "Hydrology-owned river-network hierarchy and flow classifications derived from routing, discharge, and lake truth before map projection.",
  }
);

/**
 * Registers Hydrology-owned network hierarchy, mouth, slope, and permanence. Benchmark evidence
 * is projected separately into the metrics sink so it cannot become pipeline state or
 * river-placement authority.
 */
export const artifact = defineArtifact({
  name: "riverNetwork",
  id: "artifact:hydrology.riverNetwork",
  schema: Schema,
});

/**
 * Validates river-network structure, exact field kinds, and map-sized cardinality when known.
 */
function validateLocal(
  input: unknown,
  context?: ArtifactValidationContext
): readonly ArtifactValidationIssue[] {
  const value = input as Static<typeof Schema>;
  const issues: ArtifactValidationIssue[] = [];
  const candidate = value as Record<string, unknown>;
  const cellCount = artifactCellCount(context);
  appendArtifactTypedArrayIssues(
    issues,
    "upstreamArea",
    candidate.upstreamArea,
    Int32Array,
    cellCount
  );
  appendArtifactTypedArrayIssues(
    issues,
    "streamOrderProxy",
    candidate.streamOrderProxy,
    Uint8Array,
    cellCount
  );
  appendArtifactTypedArrayIssues(issues, "mouthType", candidate.mouthType, Uint8Array, cellCount);
  appendArtifactTypedArrayIssues(issues, "slopeClass", candidate.slopeClass, Uint8Array, cellCount);
  appendArtifactTypedArrayIssues(
    issues,
    "flowPermanenceProxy",
    candidate.flowPermanenceProxy,
    Uint8Array,
    cellCount
  );
  return Object.freeze(issues);
}

/** Admits map-sized typed river-network fields after structural admission. */
export const validate = defineArtifactValidator(artifact, validateLocal);
