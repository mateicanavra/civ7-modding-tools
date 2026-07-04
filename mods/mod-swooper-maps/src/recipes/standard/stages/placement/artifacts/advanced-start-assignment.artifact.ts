import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";
import { validateArtifactSchema } from "@swooper/mapgen-core/authoring/contracts";

/** Advanced-start evidence (`artifact:placement.advancedStartAssignment`). One artifact per file by repo convention. */
const AdvancedStartAssignmentArtifactSchema = Type.Object(
  {
    fertilityRecalculated: Type.Boolean(),
    advancedStartsAssigned: Type.Boolean(),
  },
  {
    additionalProperties: false,
    description:
      "Engine-owned advanced-start assignment evidence after all placement products materialize.",
  }
);

export const Schema = AdvancedStartAssignmentArtifactSchema;

export const artifact = defineArtifact({
  name: "advancedStartAssignment",
  id: "artifact:placement.advancedStartAssignment",
  schema: Schema,
});

type ValidationIssue = { message: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Validate hook for the advanced-start assignment evidence artifact
 * (placement-realignment S6): the step publishes only after both engine
 * passes ran, so anything other than two `true` flags is a publish-site bug.
 */

function validatePayload(value: unknown): ValidationIssue[] {
  if (!isRecord(value)) {
    return [{ message: "advancedStartAssignment artifact must be an object." }];
  }
  const issues: ValidationIssue[] = [];
  if (value.fertilityRecalculated !== true) {
    issues.push({ message: "fertilityRecalculated must be true at publish time." });
  }
  if (value.advancedStartsAssigned !== true) {
    issues.push({ message: "advancedStartsAssigned must be true at publish time." });
  }
  return issues;
}

export function validate(value: unknown): readonly { message: string }[] {
  return Object.freeze([...validateArtifactSchema(Schema, value), ...validatePayload(value)]);
}
