import type { ArtifactValidationContext } from "@swooper/mapgen-core/authoring/contracts";
import {
  defineArtifact,
  type Static,
  Type,
  TypedArraySchemas,
  validateArtifactSchema,
} from "@swooper/mapgen-core/authoring/contracts";

/**
 * Closed payload schema for the Civ7 feature surface observed immediately after Ecology projection.
 * Width and height admit the tile coordinate space; `featureType` contains exactly one observed
 * engine feature ID for every tile in row-major order, including the engine's no-feature sentinel.
 */
export const Schema = Type.Object(
  {
    width: Type.Integer({
      minimum: 1,
      description: "Admitted map width in tiles for the observed engine feature surface.",
    }),
    height: Type.Integer({
      minimum: 1,
      description: "Admitted map height in tiles for the observed engine feature surface.",
    }),
    featureType: TypedArraySchemas.i16({
      description:
        "Post-Ecology Civ7 feature ID per tile in row-major order after feature stamping and terrain validation; the engine no-feature sentinel is retained as evidence.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Immutable, write-once evidence of the complete engine feature surface produced by map-ecology and consumed by placement planning.",
  }
);

/** Immutable-by-contract feature projection evidence admitted by the artifact module. */
export type FeatureEngineSnapshot = Static<typeof Schema>;

/**
 * Registers the only cross-step Ecology feature projection state. The apply step owns the engine
 * mutation; this copied snapshot records its post-Ecology result without becoming mutation authority.
 */
export const artifact = defineArtifact({
  name: "featureEngineSnapshot",
  id: "artifact:ecology.featureEngineSnapshot",
  schema: Schema,
});

type ValidationIssue = Readonly<{ message: string }>;

function validateSpatialCardinality(
  value: unknown,
  context?: ArtifactValidationContext
): readonly ValidationIssue[] {
  if (!value || typeof value !== "object") return [];
  const candidate = value as Partial<FeatureEngineSnapshot>;
  const issues: ValidationIssue[] = [];

  if (!(candidate.featureType instanceof Int16Array)) {
    issues.push({ message: "Expected featureEngineSnapshot.featureType to be an Int16Array." });
  }

  if (
    Number.isInteger(candidate.width) &&
    Number.isInteger(candidate.height) &&
    candidate.featureType instanceof Int16Array
  ) {
    const admittedCellCount = (candidate.width as number) * (candidate.height as number);
    if (candidate.featureType.length !== admittedCellCount) {
      issues.push({
        message: `featureType length ${candidate.featureType.length} does not match admitted dimensions ${String(candidate.width)}x${String(candidate.height)} (${admittedCellCount} tiles).`,
      });
    }
  }

  const dimensions = context?.dimensions;
  if (dimensions) {
    if (candidate.width !== dimensions.width || candidate.height !== dimensions.height) {
      issues.push({
        message: `Feature engine snapshot dimensions ${String(candidate.width)}x${String(candidate.height)} do not match map dimensions ${dimensions.width}x${dimensions.height}.`,
      });
    }
    if (
      candidate.featureType instanceof Int16Array &&
      candidate.featureType.length !== dimensions.width * dimensions.height
    ) {
      issues.push({
        message: `featureType length ${candidate.featureType.length} does not match map cardinality ${dimensions.width * dimensions.height}.`,
      });
    }
  }

  return issues;
}

/**
 * Admits the snapshot through the shared artifact mechanism: TypeBox closes its shape and typed
 * surface, while semantic checks bind dimensions and cardinality to both the payload and run.
 */
export function validate(
  value: unknown,
  context?: ArtifactValidationContext
): readonly ValidationIssue[] {
  return Object.freeze([
    ...validateArtifactSchema(Schema, value),
    ...validateSpatialCardinality(value, context),
  ]);
}
