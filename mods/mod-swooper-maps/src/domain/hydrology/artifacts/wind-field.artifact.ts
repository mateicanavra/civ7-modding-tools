import {
  type ArtifactValidationContext,
  type ArtifactValidationIssue,
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  defineArtifact,
  type Static,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";

/**
 * Closed schema for dimension-aligned atmospheric wind and ocean-current vectors.
 * Winds are atmosphere-wide forcing while currents are ocean-only coupling; compact signed
 * components preserve their direction and relative intensity without pretending to be SI units.
 */
const Schema = Type.Object(
  {
    windU: TypedArraySchemas.i8({
      description: "Atmospheric east-west forcing component per map tile (-127..127).",
    }),
    windV: TypedArraySchemas.i8({
      description: "Atmospheric north-south forcing component per map tile (-127..127).",
    }),
    currentU: TypedArraySchemas.i8({
      description: "Ocean-surface east-west current component per map tile (-127..127).",
    }),
    currentV: TypedArraySchemas.i8({
      description: "Ocean-surface north-south current component per map tile (-127..127).",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Dimension-aligned Hydrology wind forcing and ocean-surface current vectors used by climate transport.",
  }
);

/**
 * Registers the baseline atmosphere-wide wind and ocean-only surface-current vectors used
 * inside Hydrology. The internal artifact keeps discrete forcing fields on the same map
 * dimensions as climate transport.
 */
export const artifact = defineArtifact({
  name: "windField",
  id: "artifact:hydrology._internal.windField",
  schema: Schema,
  refine: validateLocal,
});

/**
 * Validates internal wind and current field against its closed schema and, when map dimensions
 * are supplied, verifies every tile field matches that width × height. It returns accumulated
 * issues so artifact admission can reject a structurally valid but spatially inconsistent
 * payload.
 */
function validateLocal(
  input: unknown,
  context?: ArtifactValidationContext
): ArtifactValidationIssue[] {
  const value = input as Static<typeof Schema>;
  const expectedLength = artifactCellCount(context);
  const errors: ArtifactValidationIssue[] = [];
  const candidate = value as {
    windU?: unknown;
    windV?: unknown;
    currentU?: unknown;
    currentV?: unknown;
  };
  appendArtifactTypedArrayIssues(errors, "wind.windU", candidate.windU, Int8Array, expectedLength);
  appendArtifactTypedArrayIssues(errors, "wind.windV", candidate.windV, Int8Array, expectedLength);
  appendArtifactTypedArrayIssues(
    errors,
    "wind.currentU",
    candidate.currentU,
    Int8Array,
    expectedLength
  );
  appendArtifactTypedArrayIssues(
    errors,
    "wind.currentV",
    candidate.currentV,
    Int8Array,
    expectedLength
  );
  return errors;
}
