import { defineArtifact } from "@swooper/mapgen-core/authoring/contracts";
import { validateArtifactSchema } from "@swooper/mapgen-core/authoring/contracts";
import { PlacementOutputsV1Schema } from "../placement-outputs.js";

/** Terminal placement summary (`artifact:placementOutputs`). One artifact per file by repo convention. */

export const Schema = PlacementOutputsV1Schema;

export const artifact = defineArtifact({
  name: "placementOutputs",
  id: "artifact:placementOutputs",
  schema: Schema,
});

type ValidationIssue = { message: string };

function issue(message: string): ValidationIssue {
  return { message };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isCount(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 0;
}

/**
 * Validate hook for the terminal placement summary (placement-realignment
 * S6): every published count is measured, so anything non-finite or negative
 * is a publish-site bug, not gate noise.
 */

function validatePayload(value: unknown): ValidationIssue[] {
  if (!isRecord(value)) return [issue("placementOutputs artifact must be an object.")];
  const issues: ValidationIssue[] = [];
  for (const key of [
    "naturalWondersCount",
    "resourcesCount",
    "startsAssigned",
    "discoveriesCount",
  ] as const) {
    if (!isCount(value[key])) {
      issues.push(issue(`placementOutputs.${key} ${String(value[key])} must be a count.`));
    }
  }
  return issues;
}

export function validate(value: unknown): readonly { message: string }[] {
  return Object.freeze([...validateArtifactSchema(Schema, value), ...validatePayload(value)]);
}
