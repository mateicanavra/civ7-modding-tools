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
 * Validate hook for the shared placement inputs artifact: the seat counts and
 * the wonder-count plan must be coherent non-negative integers because every
 * downstream product step plans against them.
 */
export function validatePlacementInputsArtifact(value: unknown): ValidationIssue[] {
  if (!isRecord(value)) return [issue("placementInputs artifact must be an object.")];
  const issues: ValidationIssue[] = [];
  const starts = isRecord(value.starts) ? value.starts : null;
  if (!starts) {
    issues.push(issue("placementInputs.starts must be an object."));
  } else {
    if (!isCount(starts.playersLandmass1)) {
      issues.push(
        issue(`starts.playersLandmass1 ${String(starts.playersLandmass1)} must be a count.`)
      );
    }
    if (!isCount(starts.playersLandmass2)) {
      issues.push(
        issue(`starts.playersLandmass2 ${String(starts.playersLandmass2)} must be a count.`)
      );
    }
  }
  const wonders = isRecord(value.wonders) ? value.wonders : null;
  if (!wonders || !isCount(wonders.wondersCount)) {
    issues.push(issue("placementInputs.wonders.wondersCount must be a count."));
  }
  if (!isRecord(value.placementConfig)) {
    issues.push(issue("placementInputs.placementConfig must be an object."));
  }
  return issues;
}

/**
 * Validate hook for the natural-wonder plan: count coherence, in-bounds
 * unique anchors, and priorities in [0,1] — the cheap invariants the stamping
 * step assumes instead of re-normalizing the plan.
 */
export function validateNaturalWonderPlanArtifact(value: unknown): ValidationIssue[] {
  if (!isRecord(value)) return [issue("naturalWonderPlan artifact must be an object.")];
  const issues: ValidationIssue[] = [];
  const width = Number(value.width);
  const height = Number(value.height);
  const size = width * height;
  if (!Number.isSafeInteger(size) || size <= 0) {
    return [
      issue(
        `naturalWonderPlan has invalid dimensions ${String(value.width)}x${String(value.height)}.`
      ),
    ];
  }
  const placements = Array.isArray(value.placements) ? value.placements : null;
  if (!placements) return [issue("naturalWonderPlan.placements must be an array.")];
  if (value.plannedCount !== placements.length) {
    issues.push(
      issue(`plannedCount ${String(value.plannedCount)} != placements.length ${placements.length}.`)
    );
  }
  if (
    !isCount(value.targetCount) ||
    (isCount(value.plannedCount) && value.plannedCount > (value.targetCount as number))
  ) {
    issues.push(
      issue(
        `plannedCount ${String(value.plannedCount)} exceeds targetCount ${String(value.targetCount)}.`
      )
    );
  }
  const seenPlots = new Set<number>();
  for (const placement of placements) {
    if (!isRecord(placement)) continue;
    const plotIndex = Number(placement.plotIndex);
    if (!Number.isInteger(plotIndex) || plotIndex < 0 || plotIndex >= size) {
      issues.push(issue(`naturalWonderPlan anchor ${String(placement.plotIndex)} out of bounds.`));
      continue;
    }
    if (seenPlots.has(plotIndex)) {
      issues.push(issue(`naturalWonderPlan plans two wonders anchored on plot ${plotIndex}.`));
    }
    seenPlots.add(plotIndex);
    const priority = Number(placement.priority);
    if (!(priority >= 0 && priority <= 1)) {
      issues.push(
        issue(
          `naturalWonderPlan priority ${String(placement.priority)} outside [0,1] on plot ${plotIndex}.`
        )
      );
    }
  }
  return issues;
}
