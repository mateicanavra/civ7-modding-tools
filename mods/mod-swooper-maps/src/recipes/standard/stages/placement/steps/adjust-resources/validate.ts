type ValidationIssue = { message: string };

function issue(message: string): ValidationIssue {
  return { message };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Validate hook for the adjusted resource plan (placement-realignment S5).
 * Cross-field invariants the schema cannot express: count coherence, unique
 * plots, and provenance coherence (support-phase intents are additions; every
 * adjustment row maps onto an intent that carries matching provenance).
 */
export function validateResourcePlanAdjustedArtifact(value: unknown): ValidationIssue[] {
  if (!isRecord(value)) return [issue("resourcePlanAdjusted artifact must be an object.")];
  const issues: ValidationIssue[] = [];
  const width = Number(value.width);
  const height = Number(value.height);
  const size = width * height;
  if (!Number.isSafeInteger(size) || size <= 0) {
    return [
      issue(
        `resourcePlanAdjusted has invalid dimensions ${String(value.width)}x${String(value.height)}.`
      ),
    ];
  }
  const intents = Array.isArray(value.intents) ? value.intents : null;
  const adjustments = Array.isArray(value.adjustments) ? value.adjustments : null;
  if (!intents) return [issue("resourcePlanAdjusted.intents must be an array.")];
  if (!adjustments) return [issue("resourcePlanAdjusted.adjustments must be an array.")];

  if (value.plannedCount !== intents.length) {
    issues.push(
      issue(
        `resourcePlanAdjusted.plannedCount ${String(value.plannedCount)} != intents.length ${intents.length}.`
      )
    );
  }

  const seenPlots = new Set<number>();
  const adjustedByPlot = new Map<number, Record<string, unknown>>();
  let supportPhaseCount = 0;
  let provenancedCount = 0;
  for (const intent of intents) {
    if (!isRecord(intent)) continue;
    const plotIndex = Number(intent.plotIndex);
    if (!Number.isInteger(plotIndex) || plotIndex < 0 || plotIndex >= size) {
      issues.push(
        issue(`resourcePlanAdjusted intent plotIndex ${String(intent.plotIndex)} out of bounds.`)
      );
      continue;
    }
    if (seenPlots.has(plotIndex)) {
      issues.push(issue(`resourcePlanAdjusted plans two intents on plot ${plotIndex}.`));
    }
    seenPlots.add(plotIndex);
    const support = isRecord(intent.support) ? intent.support : null;
    if (intent.phase === "support") {
      supportPhaseCount += 1;
      if (!support || support.action !== "add") {
        issues.push(issue(`support-phase intent on plot ${plotIndex} must carry add provenance.`));
      }
    }
    if (support) {
      provenancedCount += 1;
      adjustedByPlot.set(plotIndex, support);
      if (support.action === "move" && typeof support.fromPlotIndex !== "number") {
        issues.push(issue(`moved intent on plot ${plotIndex} must record fromPlotIndex.`));
      }
    }
  }

  const moveCount = Number(value.moveCount);
  const addCount = Number(value.addCount);
  const moves = adjustments.filter((row) => isRecord(row) && row.action === "move").length;
  const adds = adjustments.filter((row) => isRecord(row) && row.action === "add").length;
  if (moves !== moveCount || adds !== addCount) {
    issues.push(
      issue(
        `adjustment counts (moves ${moves}, adds ${adds}) != recorded moveCount ${moveCount}/addCount ${addCount}.`
      )
    );
  }
  if (adds !== supportPhaseCount) {
    issues.push(issue(`add adjustments ${adds} != support-phase intents ${supportPhaseCount}.`));
  }
  if (adjustments.length !== provenancedCount) {
    issues.push(
      issue(
        `adjustments ${adjustments.length} != intents carrying support provenance ${provenancedCount}.`
      )
    );
  }
  for (const row of adjustments) {
    if (!isRecord(row)) continue;
    const toPlot = Number(row.toPlotIndex);
    const provenance = adjustedByPlot.get(toPlot);
    if (!provenance || provenance.action !== row.action) {
      issues.push(
        issue(
          `adjustment to plot ${toPlot} has no matching intent provenance (${String(row.action)}).`
        )
      );
    }
  }
  return issues;
}
