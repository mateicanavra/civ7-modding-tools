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
 * Validate hook for the natural-wonder placement outcome artifact
 * (placement-realignment S6). Cross-field invariants the schema cannot
 * express: outcome counts reconcile against the plan, coordinate-proof digests
 * agree with the row corpus, and every row carries the matching status. The
 * publish-time guarantee replaces the old read-side re-normalization helper
 * that downstream steps imported across step boundaries.
 */
export function validateNaturalWonderPlacementArtifact(value: unknown): ValidationIssue[] {
  if (!isRecord(value)) return [issue("naturalWonderPlacement artifact must be an object.")];
  const issues: ValidationIssue[] = [];
  for (const key of [
    "plannedCount",
    "targetCount",
    "placedCount",
    "terrainAdjustedCount",
    "skippedOutOfBoundsCount",
    "rejectedCount",
    "shortfallCount",
  ] as const) {
    if (!isCount(value[key])) {
      issues.push(issue(`naturalWonderPlacement.${key} ${String(value[key])} must be a count.`));
    }
  }
  if (issues.length > 0) return issues;

  const plannedCount = value.plannedCount as number;
  const placedCount = value.placedCount as number;
  const rejectedCount = value.rejectedCount as number;
  const skippedOutOfBoundsCount = value.skippedOutOfBoundsCount as number;
  if (placedCount + rejectedCount + skippedOutOfBoundsCount !== plannedCount) {
    issues.push(
      issue(
        `placed ${placedCount} + rejected ${rejectedCount} + skipped ${skippedOutOfBoundsCount} != planned ${plannedCount}.`
      )
    );
  }

  const rows = Array.isArray(value.coordinateRows) ? value.coordinateRows : null;
  if (!rows) return [...issues, issue("naturalWonderPlacement.coordinateRows must be an array.")];
  let placedRows = 0;
  let rejectedRows = 0;
  for (const row of rows) {
    if (!isRecord(row)) continue;
    if (row.status === "placed") placedRows += 1;
    else if (row.status === "rejected") rejectedRows += 1;
    else issues.push(issue(`naturalWonderPlacement row has untyped status ${String(row.status)}.`));
  }
  // Out-of-bounds skips are recorded as rejected coordinate rows.
  const rejectedRowsExpected = rejectedCount + skippedOutOfBoundsCount;
  if (placedRows !== placedCount) {
    issues.push(issue(`coordinateRows placed ${placedRows} != placedCount ${placedCount}.`));
  }
  if (rejectedRows !== rejectedRowsExpected) {
    issues.push(
      issue(`coordinateRows rejected ${rejectedRows} != rejected+skipped ${rejectedRowsExpected}.`)
    );
  }

  const proof = isRecord(value.coordinateProof) ? value.coordinateProof : null;
  const placedDigest = proof && isRecord(proof.placed) ? proof.placed : null;
  const rejectedDigest = proof && isRecord(proof.rejected) ? proof.rejected : null;
  if (placedDigest?.count !== placedCount) {
    issues.push(
      issue(
        `coordinateProof.placed.count ${String(placedDigest?.count)} != placedCount ${placedCount}.`
      )
    );
  }
  if (rejectedDigest?.count !== rejectedRowsExpected) {
    issues.push(
      issue(
        `coordinateProof.rejected.count ${String(rejectedDigest?.count)} != rejected+skipped ${rejectedRowsExpected}.`
      )
    );
  }
  return issues;
}
