type ValidationIssue = { message: string };

function issue(message: string): ValidationIssue {
  return { message };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Validate hooks for the resource planning artifacts (placement-realignment
 * S3 artifact hygiene: placement previously registered zero validators).
 * These check cross-field invariants the schemas cannot express.
 */
export function validateResourceDemandPlanArtifact(value: unknown): ValidationIssue[] {
  if (!isRecord(value)) return [issue("resourceDemandPlan artifact must be an object.")];
  const issues: ValidationIssue[] = [];
  const demands = Array.isArray(value.demands) ? value.demands : null;
  if (!demands) return [issue("resourceDemandPlan.demands must be an array.")];

  const resolution = isRecord(value.runtimeIdResolution) ? value.runtimeIdResolution : null;
  if (!resolution || resolution.status !== "verified") {
    issues.push(issue("resourceDemandPlan.runtimeIdResolution.status must be 'verified'."));
  } else if (resolution.checkedCount !== demands.length) {
    issues.push(
      issue(
        `resourceDemandPlan runtimeIdResolution.checkedCount ${String(resolution.checkedCount)} != demands.length ${demands.length}.`
      )
    );
  }

  const seenIds = new Set<number>();
  for (const row of demands) {
    if (!isRecord(row)) {
      issues.push(issue("resourceDemandPlan demand row must be an object."));
      continue;
    }
    const id = typeof row.resourceTypeId === "number" ? row.resourceTypeId : -1;
    if (id < 0) {
      issues.push(issue(`Demand ${String(row.resourceType)} has no proven runtime id.`));
      continue;
    }
    if (seenIds.has(id)) {
      issues.push(issue(`Demand runtime id ${id} appears more than once.`));
    }
    seenIds.add(id);
    const minCount = Number(row.minCount);
    const maxCount = Number(row.maxCount);
    const targetCount = Number(row.targetCount);
    if (minCount > maxCount) {
      issues.push(issue(`Demand ${String(row.resourceType)} minCount ${minCount} > maxCount ${maxCount}.`));
    }
    if (targetCount > maxCount) {
      issues.push(
        issue(`Demand ${String(row.resourceType)} targetCount ${targetCount} > maxCount ${maxCount}.`)
      );
    }
    if (Number(row.legalTileCount) <= 0) {
      issues.push(
        issue(`Demand ${String(row.resourceType)} has zero policy-legal tiles; it must be excluded, not planned.`)
      );
    }
  }
  return issues;
}

export function validateResourceEligibilityArtifact(value: unknown): ValidationIssue[] {
  if (!isRecord(value)) return [issue("resourceEligibility artifact must be an object.")];
  const issues: ValidationIssue[] = [];
  const width = Number(value.width);
  const height = Number(value.height);
  const size = width * height;
  if (!Number.isSafeInteger(size) || size <= 0) {
    return [issue(`resourceEligibility has invalid dimensions ${String(value.width)}x${String(value.height)}.`)];
  }
  const rows = Array.isArray(value.rows) ? value.rows : null;
  if (!rows) return [issue("resourceEligibility.rows must be an array.")];
  const seenTypes = new Set<string>();
  for (const row of rows) {
    if (!isRecord(row)) {
      issues.push(issue("resourceEligibility row must be an object."));
      continue;
    }
    const type = String(row.resourceType);
    if (seenTypes.has(type)) issues.push(issue(`resourceEligibility row ${type} appears more than once.`));
    seenTypes.add(type);
    for (const field of ["habitatMask", "legalMask", "intensity"] as const) {
      const mask = row[field] as { length?: number } | undefined;
      if (!mask || mask.length !== size) {
        issues.push(issue(`resourceEligibility ${type}.${field} length must equal ${size}.`));
      }
    }
  }
  return issues;
}

export function validateResourcePlanArtifact(value: unknown): ValidationIssue[] {
  if (!isRecord(value)) return [issue("resourcePlan artifact must be an object.")];
  const issues: ValidationIssue[] = [];
  const width = Number(value.width);
  const height = Number(value.height);
  const size = width * height;
  if (!Number.isSafeInteger(size) || size <= 0) {
    return [issue(`resourcePlan has invalid dimensions ${String(value.width)}x${String(value.height)}.`)];
  }
  const intents = Array.isArray(value.intents) ? value.intents : null;
  const perType = Array.isArray(value.perType) ? value.perType : null;
  if (!intents) return [issue("resourcePlan.intents must be an array.")];
  if (!perType) return [issue("resourcePlan.perType must be an array.")];

  if (value.plannedCount !== intents.length) {
    issues.push(
      issue(`resourcePlan.plannedCount ${String(value.plannedCount)} != intents.length ${intents.length}.`)
    );
  }

  const seenPlots = new Set<number>();
  const countsByType = new Map<string, number>();
  for (const intent of intents) {
    if (!isRecord(intent)) continue;
    const plotIndex = Number(intent.plotIndex);
    if (!Number.isInteger(plotIndex) || plotIndex < 0 || plotIndex >= size) {
      issues.push(issue(`resourcePlan intent plotIndex ${String(intent.plotIndex)} out of bounds.`));
      continue;
    }
    if (seenPlots.has(plotIndex)) {
      issues.push(issue(`resourcePlan plans two intents on plot ${plotIndex}.`));
    }
    seenPlots.add(plotIndex);
    const type = String(intent.resourceType);
    countsByType.set(type, (countsByType.get(type) ?? 0) + 1);
  }

  for (const row of perType) {
    if (!isRecord(row)) continue;
    const type = String(row.resourceType);
    const planned = Number(row.plannedCount);
    const observed = countsByType.get(type) ?? 0;
    if (planned !== observed) {
      issues.push(issue(`resourcePlan perType ${type} plannedCount ${planned} != intent count ${observed}.`));
    }
    const maxCount = Number(row.maxCount);
    if (planned > maxCount) {
      issues.push(issue(`resourcePlan perType ${type} plannedCount ${planned} exceeds maxCount ${maxCount}.`));
    }
  }
  return issues;
}
