import {
  defineArtifact,
  type Static,
  Type,
  validateArtifactSchema,
} from "@swooper/mapgen-core/authoring/contracts";

/** Terminal placement summary (`artifact:placementOutputs`). One artifact per file by repo convention. */

export const PlacementOutputsV1Schema = Type.Object(
  {
    naturalWondersCount: Type.Number(),
    resourcesCount: Type.Number(),
    startsAssigned: Type.Number(),
    discoveriesCount: Type.Number(),
  },
  { additionalProperties: false }
);

export type PlacementOutputsV1 = Static<typeof PlacementOutputsV1Schema>;

/** Canonical artifact schema alias for the terminal placement-count summary. */
export const Schema = PlacementOutputsV1Schema;

/** Registers the compact terminal count summary used to verify placement completion. */
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

/** Requires every published product total to be a nonnegative integer count. */
export function validate(value: unknown): readonly { message: string }[] {
  return Object.freeze([...validateArtifactSchema(Schema, value), ...validatePayload(value)]);
}
