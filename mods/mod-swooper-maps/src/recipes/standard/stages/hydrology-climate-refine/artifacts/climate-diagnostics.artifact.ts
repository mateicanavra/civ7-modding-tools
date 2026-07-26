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
 * Runtime contract for advisory rain-shadow, continentality, and convergence rasters. These
 * fields support diagnostics and narrative bias without becoming Hydrology source truth.
 */
export const Schema = Type.Object(
  {
    /** Advisory rain shadow proxy (0..1); used for debugging and optional downstream narrative biasing. */
    rainShadowIndex: TypedArraySchemas.f32({
      description:
        "Advisory rain shadow proxy (0..1) per tile (diagnostic projection; not Hydrology internal truth).",
    }),
    /** Advisory continentality proxy (0..1); higher values imply more interior/continental climate. */
    continentalityIndex: TypedArraySchemas.f32({
      description:
        "Advisory continentality proxy (0..1) per tile (diagnostic projection; not Hydrology internal truth).",
    }),
    /** Advisory convergence proxy (0..1); indicates likely convergence zones / storm tracks. */
    convergenceIndex: TypedArraySchemas.f32({
      description:
        "Advisory convergence proxy (0..1) per tile (diagnostic projection; not Hydrology internal truth).",
    }),
  },
  {
    description:
      "Hydrology refinement diagnostics (advisory indices; not Hydrology internal truth).",
  }
);

/**
 * Registers Hydrology's aggregate climate benchmark evidence after refinement. Diagnostics and
 * Studio consumers observe these summaries without feeding them back into climate truth.
 */
export const artifact = defineArtifact({
  name: "climateDiagnostics",
  id: "artifact:hydrology.climateDiagnostics",
  schema: Schema,
});

function validateLocal(
  input: unknown,
  context?: ArtifactValidationContext
): ArtifactValidationIssue[] {
  const value = input as Static<typeof Schema>;
  const expectedLength = artifactCellCount(context);
  const errors: ArtifactValidationIssue[] = [];
  const candidate = value as {
    rainShadowIndex?: unknown;
    continentalityIndex?: unknown;
    convergenceIndex?: unknown;
  };
  appendArtifactTypedArrayIssues(
    errors,
    "climateDiagnostics.rainShadowIndex",
    candidate.rainShadowIndex,
    Float32Array,
    expectedLength
  );
  appendArtifactTypedArrayIssues(
    errors,
    "climateDiagnostics.continentalityIndex",
    candidate.continentalityIndex,
    Float32Array,
    expectedLength
  );
  appendArtifactTypedArrayIssues(
    errors,
    "climateDiagnostics.convergenceIndex",
    candidate.convergenceIndex,
    Float32Array,
    expectedLength
  );
  return errors;
}

/**
 * Validates climate diagnostics against its closed schema and, when map dimensions are
 * supplied, verifies every tile field matches that width × height. It returns accumulated
 * issues so artifact admission can reject a structurally valid but spatially inconsistent
 * payload.
 */
export const validate = defineArtifactValidator(artifact, validateLocal);
