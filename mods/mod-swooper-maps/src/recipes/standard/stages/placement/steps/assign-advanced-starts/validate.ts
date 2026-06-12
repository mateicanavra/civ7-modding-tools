type ValidationIssue = { message: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Validate hook for the advanced-start assignment evidence artifact
 * (placement-realignment S6): the step publishes only after both engine
 * passes ran, so anything other than two `true` flags is a publish-site bug.
 */
export function validateAdvancedStartAssignmentArtifact(value: unknown): ValidationIssue[] {
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
