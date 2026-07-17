import { FEATURE_INTENT_KEYS } from "@mapgen/domain/ecology/model/schemas/index.js";
import type { ArtifactValidationContext } from "@swooper/mapgen-core/authoring/contracts";
import {
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

function expectedSize(dimensions: NonNullable<ArtifactValidationContext["dimensions"]>): number {
  return Math.max(0, (dimensions.width | 0) * (dimensions.height | 0));
}

function validateTypedArray(
  errors: ArtifactValidationIssue[],
  label: string,
  value: unknown,
  ctor: { new (...args: any[]): { length: number } },
  expectedLength?: number
): value is { length: number } {
  if (!(value instanceof ctor)) {
    errors.push({ message: `Expected ${label} to be ${ctor.name}.` });
    return false;
  }
  if (expectedLength != null && value.length !== expectedLength) {
    errors.push({
      message: `Expected ${label} length ${expectedLength} (received ${value.length}).`,
    });
  }
  return true;
}

function isScoreLayersArtifact(value: unknown): value is ScoreLayersArtifact {
  if (!value || typeof value !== "object") return false;
  const candidate = value as ScoreLayersArtifact;
  if (typeof candidate.width !== "number" || typeof candidate.height !== "number") return false;
  if (!isRecord(candidate.layers)) return false;
  for (const key of FEATURE_INTENT_KEYS) {
    if (!((candidate.layers as Record<string, unknown>)[key] instanceof Float32Array)) return false;
  }
  return true;
}

function validatePayload(
  value: unknown,
  dimensions: NonNullable<ArtifactValidationContext["dimensions"]>
): ArtifactValidationIssue[] {
  const errors: ArtifactValidationIssue[] = [];
  if (!isScoreLayersArtifact(value)) {
    errors.push({ message: "Invalid score layers artifact payload." });
    return errors;
  }
  const size = expectedSize(dimensions);
  if (value.width !== dimensions.width || value.height !== dimensions.height) {
    errors.push({ message: "Score layers dimensions mismatch." });
  }
  for (const key of FEATURE_INTENT_KEYS) {
    validateTypedArray(errors, `layers.${key}`, value.layers[key], Float32Array, size);
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
  if (!context?.dimensions) return schemaIssues;
  return Object.freeze([...schemaIssues, ...validatePayload(value, context.dimensions)]);
}
