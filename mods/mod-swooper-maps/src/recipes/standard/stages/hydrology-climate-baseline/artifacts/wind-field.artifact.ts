import type { ArtifactValidationContext } from "@swooper/mapgen-core/authoring/contracts";
import {
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  defineArtifact,
  validateArtifactSchema,
} from "@swooper/mapgen-core/authoring/contracts";

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validatePayload(value: unknown, expectedLength?: number): ArtifactValidationIssue[] {
  const errors: ArtifactValidationIssue[] = [];
  if (!isRecord(value)) {
    return [{ message: "Missing wind field artifact payload." }];
  }
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
  return Object.freeze([
    ...validateArtifactSchema(Schema, value),
    ...validatePayload(value, artifactCellCount(context)),
  ]);
}
