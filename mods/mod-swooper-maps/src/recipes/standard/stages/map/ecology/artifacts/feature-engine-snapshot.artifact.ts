import {
  type ArtifactValidationContext,
  type ArtifactValidationIssue,
  appendArtifactTypedArrayIssues,
  defineArtifact,
  type Static,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";

/**
 * Closed payload schema for the Civ7 feature surface observed immediately after Ecology projection.
 * Width and height admit the tile coordinate space; `featureType` contains exactly one observed
 * engine feature ID for every tile in row-major order, including the engine's no-feature sentinel.
 */
const Schema = Type.Object(
  {
    width: Type.Integer({
      minimum: 1,
      description: "Admitted map width in tiles for the observed engine feature surface.",
    }),
    height: Type.Integer({
      minimum: 1,
      description: "Admitted map height in tiles for the observed engine feature surface.",
    }),
    featureType: TypedArraySchemas.i32({
      description:
        "Post-Ecology Civ7 feature ID per tile in row-major order after feature stamping and terrain validation; the engine no-feature sentinel is retained as evidence.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Immutable, write-once diagnostic evidence of the complete engine feature surface produced by map-ecology.",
  }
);

/** Immutable-by-contract feature projection evidence admitted by this artifact authority. */
export type FeatureEngineSnapshot = Static<typeof Schema>;

/**
 * Registers post-projection diagnostic evidence for Ecology features. The apply step owns the
 * engine mutation; placement observes current engine state instead of consuming this snapshot.
 */
export const artifact = defineArtifact({
  name: "featureEngineSnapshot",
  id: "artifact:ecology.featureEngineSnapshot",
  schema: Schema,
  refine: validateLocal,
});

/**
 * Binds the typed feature surface to the payload dimensions and the payload dimensions to the run.
 */
function validateLocal(
  input: unknown,
  context?: ArtifactValidationContext
): readonly ArtifactValidationIssue[] {
  const value = input as Static<typeof Schema>;
  const issues: ArtifactValidationIssue[] = [];
  const admittedCellCount = value.width * value.height;
  appendArtifactTypedArrayIssues(
    issues,
    "featureEngineSnapshot.featureType",
    value.featureType,
    Int32Array,
    admittedCellCount
  );

  const dimensions = context?.dimensions;
  if (dimensions) {
    if (value.width !== dimensions.width || value.height !== dimensions.height) {
      issues.push({
        message: `Feature engine snapshot dimensions ${value.width}x${value.height} do not match map dimensions ${dimensions.width}x${dimensions.height}.`,
      });
    }
  }

  return issues;
}
