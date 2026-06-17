type ValidationIssue = { message: string };

function issue(message: string): ValidationIssue {
  return { message };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isCount(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

/**
 * Validate hook for the discovery placement summary artifact. Discoveries are
 * placed by the official generator, so this checks count coherence only:
 * non-negative integers, placed within planned (attempts), and
 * planned = placed + rejected.
 */
export function validateDiscoveryPlacementOutcomesArtifact(value: unknown): ValidationIssue[] {
  if (!isRecord(value)) return [issue("discoveryPlacementOutcomes artifact must be an object.")];
  const summary = isRecord(value.summary) ? value.summary : null;
  if (!summary) return [issue("discoveryPlacementOutcomes.summary must be an object.")];

  const issues: ValidationIssue[] = [];
  const { plannedCount, placedCount, rejectedCount } = summary;
  for (const [name, count] of [
    ["plannedCount", plannedCount],
    ["placedCount", placedCount],
    ["rejectedCount", rejectedCount],
  ] as const) {
    if (!isCount(count)) {
      issues.push(issue(`summary.${name} must be a non-negative integer (got ${String(count)}).`));
    }
  }
  if (isCount(plannedCount) && isCount(placedCount) && placedCount > plannedCount) {
    issues.push(
      issue(`summary.placedCount ${placedCount} exceeds summary.plannedCount ${plannedCount}.`)
    );
  }
  if (
    isCount(plannedCount) &&
    isCount(placedCount) &&
    isCount(rejectedCount) &&
    placedCount + rejectedCount !== plannedCount
  ) {
    issues.push(
      issue(
        `summary.placedCount ${placedCount} + rejectedCount ${rejectedCount} != plannedCount ${plannedCount}.`
      )
    );
  }
  return issues;
}
