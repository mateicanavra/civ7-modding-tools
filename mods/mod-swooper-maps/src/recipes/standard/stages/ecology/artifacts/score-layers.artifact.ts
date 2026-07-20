import { FEATURE_INTENT_KEYS } from "@mapgen/domain/ecology/model/schemas/index.js";
import type { ArtifactValidationContext } from "@swooper/mapgen-core/authoring/contracts";
import {
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  defineArtifact,
  type Static,
  Type,
  TypedArraySchemas,
  validateArtifactSchema,
} from "@swooper/mapgen-core/authoring/contracts";

/**
 * Runtime contract for one map-sized normalized suitability raster per admitted Ecology feature
 * intent key, ensuring all family planners score the same tile field vintage.
 */
export const ScoreLayersArtifactSchema = Type.Object({
  width: Type.Integer({ minimum: 1 }),
  height: Type.Integer({ minimum: 1 }),
  layers: Type.Object(
    Object.fromEntries(
      FEATURE_INTENT_KEYS.map((intentKey) => [
        intentKey,
        TypedArraySchemas.f32({ description: "Suitability score (0..1) per tile." }),
      ])
    )
  ),
});

export type ScoreLayersArtifact = Static<typeof ScoreLayersArtifactSchema>;

/** Canonical schema entrypoint used to register and validate feature score layers. */
export const Schema = ScoreLayersArtifactSchema;

/**
 * Registers one normalized per-tile suitability layer for every Ecology feature key plus the
 * shared dimensions. Ordered family planners consume the same score vintage while occupancy
 * alone resolves claims.
 */
export const artifact = defineArtifact({
  name: "scoreLayers",
  id: "artifact:ecology.scoreLayers",
  schema: Schema,
});

export type ArtifactValidationIssue = Readonly<{ message: string }>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validatePayload(
  value: unknown,
  context?: ArtifactValidationContext
): ArtifactValidationIssue[] {
  const errors: ArtifactValidationIssue[] = [];
  if (!isRecord(value) || !isRecord(value.layers)) {
    if (context?.dimensions) errors.push({ message: "Invalid score layers artifact payload." });
    return errors;
  }
  const dimensions = context?.dimensions;
  const size = artifactCellCount(context);
  if (dimensions && (value.width !== dimensions.width || value.height !== dimensions.height)) {
    errors.push({ message: "Score layers dimensions mismatch." });
  }
  for (const key of FEATURE_INTENT_KEYS) {
    appendArtifactTypedArrayIssues(errors, `layers.${key}`, value.layers[key], Float32Array, size);
  }
  return errors;
}

/**
 * Validates feature score layers against its closed schema and, when map dimensions are
 * supplied, verifies every tile field matches that width × height. It returns accumulated
 * issues so artifact admission can reject a structurally valid but spatially inconsistent
 * payload.
 */
export function validate(
  value: unknown,
  context?: ArtifactValidationContext
): readonly { message: string }[] {
  const schemaIssues = validateArtifactSchema(Schema, value);
  return Object.freeze([...schemaIssues, ...validatePayload(value, context)]);
}
