type ValidationIssue = { message: string };

function issue(message: string): ValidationIssue {
  return { message };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Validate hook for the discovery placement outcomes artifact
 * (placement-realignment S6): count coherence between the summary and the
 * outcome rows, and typed reasons on every non-placed row.
 */
export function validateDiscoveryPlacementOutcomesArtifact(value: unknown): ValidationIssue[] {
  if (!isRecord(value)) return [issue("discoveryPlacementOutcomes artifact must be an object.")];
  const issues: ValidationIssue[] = [];
  const summary = isRecord(value.summary) ? value.summary : null;
  const outcomes = Array.isArray(value.outcomes) ? value.outcomes : null;
  if (!summary) return [issue("discoveryPlacementOutcomes.summary must be an object.")];
  if (!outcomes) return [issue("discoveryPlacementOutcomes.outcomes must be an array.")];

  if (summary.plannedCount !== outcomes.length) {
    issues.push(
      issue(
        `summary.plannedCount ${String(summary.plannedCount)} != outcomes.length ${outcomes.length}.`
      )
    );
  }
  let placed = 0;
  let rejected = 0;
  for (const outcome of outcomes) {
    if (!isRecord(outcome)) continue;
    if (outcome.status === "placed") {
      placed += 1;
    } else if (outcome.status === "rejected") {
      rejected += 1;
      if (typeof outcome.reason !== "string" || outcome.reason.length === 0) {
        issues.push(
          issue(
            `rejected discovery outcome on plot ${String(outcome.plotIndex)} has no typed reason.`
          )
        );
      }
    } else {
      issues.push(issue(`discovery outcome has untyped status ${String(outcome.status)}.`));
    }
  }
  if (summary.placedCount !== placed) {
    issues.push(
      issue(`summary.placedCount ${String(summary.placedCount)} != placed rows ${placed}.`)
    );
  }
  if (summary.rejectedCount !== rejected) {
    issues.push(
      issue(`summary.rejectedCount ${String(summary.rejectedCount)} != rejected rows ${rejected}.`)
    );
  }
  return issues;
}
