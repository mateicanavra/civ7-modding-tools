import type { ArtifactValidationContext } from "@swooper/mapgen-core/authoring/contracts";
import { defineArtifact, validateArtifactSchema } from "@swooper/mapgen-core/authoring/contracts";

import { HydrologyWindFieldSchema } from "./wind-field.schema.js";

/**
 * Canonical schema entrypoint for dimension-aligned atmospheric wind and ocean-current vectors.
 */
export const Schema = HydrologyWindFieldSchema;

/**
 * Registers the baseline atmosphere-wide wind and ocean-only surface-current vectors used
 * inside Hydrology. The internal artifact keeps discrete forcing fields on the same map
 * dimensions as climate transport.
 */
export const artifact = defineArtifact({
  name: "windField",
  id: "artifact:hydrology._internal.windField",
  schema: Schema,
});

export type ArtifactValidationIssue = Readonly<{ message: string }>;

type TypedArrayConstructor = { new (...args: unknown[]): { length: number } };

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
  ctor: TypedArrayConstructor,
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

function validatePayload(
  value: unknown,
  dimensions: NonNullable<ArtifactValidationContext["dimensions"]>
): ArtifactValidationIssue[] {
  const errors: ArtifactValidationIssue[] = [];
  const size = expectedSize(dimensions);
  if (!isRecord(value)) {
    return [{ message: "Missing wind field artifact payload." }];
  }
  const candidate = value as {
    windU?: unknown;
    windV?: unknown;
    currentU?: unknown;
    currentV?: unknown;
  };
  validateTypedArray(errors, "wind.windU", candidate.windU, Int8Array, size);
  validateTypedArray(errors, "wind.windV", candidate.windV, Int8Array, size);
  validateTypedArray(errors, "wind.currentU", candidate.currentU, Int8Array, size);
  validateTypedArray(errors, "wind.currentV", candidate.currentV, Int8Array, size);
  return errors;
}

/**
 * Validates internal wind and current field against its closed schema and, when map dimensions
 * are supplied, verifies every tile field matches that width × height. It returns accumulated
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
