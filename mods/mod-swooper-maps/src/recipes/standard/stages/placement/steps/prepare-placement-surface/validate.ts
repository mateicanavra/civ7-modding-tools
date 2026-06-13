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
 * Validate hook for the surface preparation evidence artifact
 * (placement-realignment S6): slot counts must partition the grid and the
 * lake drift counters must stay within the accepted lake corpus.
 */
export function validatePlacementSurfacePreparationArtifact(value: unknown): ValidationIssue[] {
  if (!isRecord(value)) return [issue("placementSurfacePreparation artifact must be an object.")];
  const issues: ValidationIssue[] = [];
  const width = Number(value.width);
  const height = Number(value.height);
  const size = width * height;
  if (!Number.isSafeInteger(size) || size <= 0) {
    return [
      issue(
        `placementSurfacePreparation has invalid dimensions ${String(value.width)}x${String(value.height)}.`
      ),
    ];
  }
  const slotCounts = isRecord(value.slotCounts) ? value.slotCounts : null;
  if (
    !slotCounts ||
    !isCount(slotCounts.none) ||
    !isCount(slotCounts.west) ||
    !isCount(slotCounts.east)
  ) {
    issues.push(issue("placementSurfacePreparation.slotCounts must carry none/west/east counts."));
  } else if (slotCounts.none + slotCounts.west + slotCounts.east !== size) {
    issues.push(
      issue(
        `slotCounts ${slotCounts.none}+${slotCounts.west}+${slotCounts.east} != map size ${size}.`
      )
    );
  }
  const accepted = value.acceptedLakeTileCount;
  for (const key of ["finalLakeWaterDriftCount", "finalLakeClassificationDriftCount"] as const) {
    const drift = value[key];
    if (!isCount(drift)) {
      issues.push(issue(`placementSurfacePreparation.${key} ${String(drift)} must be a count.`));
    } else if (isCount(accepted) && drift > accepted) {
      issues.push(issue(`${key} ${drift} exceeds acceptedLakeTileCount ${String(accepted)}.`));
    }
  }
  return issues;
}

/**
 * Validate hook for the validation-boundary readback artifact: each captured
 * boundary snapshot must cover the full grid so drift comparisons are sound.
 */
export function validatePlacementSurfaceValidationBoundaryArtifact(
  value: unknown
): ValidationIssue[] {
  if (!isRecord(value)) {
    return [issue("placementSurfaceValidationBoundary artifact must be an object.")];
  }
  const issues: ValidationIssue[] = [];
  const width = Number(value.width);
  const height = Number(value.height);
  const size = width * height;
  if (!Number.isSafeInteger(size) || size <= 0) {
    return [
      issue(
        `placementSurfaceValidationBoundary has invalid dimensions ${String(value.width)}x${String(value.height)}.`
      ),
    ];
  }
  for (const key of ["beforeValidate", "afterValidate", "afterMaintenance"] as const) {
    const snapshot = isRecord(value[key]) ? (value[key] as Record<string, unknown>) : null;
    if (!snapshot) {
      issues.push(issue(`placementSurfaceValidationBoundary.${key} must be an object.`));
      continue;
    }
    for (const field of ["terrain", "waterMask", "lakeMask", "areaId"] as const) {
      const buffer = snapshot[field] as { length?: number } | undefined;
      if (typeof buffer?.length !== "number" || buffer.length !== size) {
        issues.push(issue(`${key}.${field} length ${String(buffer?.length)} != map size ${size}.`));
      }
    }
  }
  return issues;
}
