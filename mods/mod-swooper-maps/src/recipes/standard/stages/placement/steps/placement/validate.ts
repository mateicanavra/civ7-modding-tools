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
export function validatePlacementOutputsArtifact(value: unknown): ValidationIssue[] {
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

/**
 * Validate hook for the terminal engine-state evidence artifact: full-grid
 * buffers and slot counts that partition the grid.
 */
export function validatePlacementEngineStateArtifact(value: unknown): ValidationIssue[] {
  if (!isRecord(value)) return [issue("engineState artifact must be an object.")];
  const issues: ValidationIssue[] = [];
  const width = Number(value.width);
  const height = Number(value.height);
  const size = width * height;
  if (!Number.isSafeInteger(size) || size <= 0) {
    return [
      issue(`engineState has invalid dimensions ${String(value.width)}x${String(value.height)}.`),
    ];
  }
  for (const key of ["slotByTile", "engineLandMask"] as const) {
    const buffer = value[key] as { length?: number } | undefined;
    if (typeof buffer?.length !== "number" || buffer.length !== size) {
      issues.push(
        issue(`engineState.${key} length ${String(buffer?.length)} != map size ${size}.`)
      );
    }
  }
  const slotCounts = isRecord(value.slotCounts) ? value.slotCounts : null;
  if (
    !slotCounts ||
    !isCount(slotCounts.none) ||
    !isCount(slotCounts.west) ||
    !isCount(slotCounts.east)
  ) {
    issues.push(issue("engineState.slotCounts must carry none/west/east counts."));
  } else if (slotCounts.none + slotCounts.west + slotCounts.east !== size) {
    issues.push(
      issue(
        `slotCounts ${slotCounts.none}+${slotCounts.west}+${slotCounts.east} != map size ${size}.`
      )
    );
  }
  if (
    isCount(value.wondersPlanned) &&
    isCount(value.wondersPlaced) &&
    value.wondersPlaced > value.wondersPlanned
  ) {
    issues.push(
      issue(`wondersPlaced ${value.wondersPlaced} exceeds wondersPlanned ${value.wondersPlanned}.`)
    );
  }
  if (
    isCount(value.discoveriesPlanned) &&
    isCount(value.discoveriesPlaced) &&
    value.discoveriesPlaced > value.discoveriesPlanned
  ) {
    issues.push(
      issue(
        `discoveriesPlaced ${value.discoveriesPlaced} exceeds discoveriesPlanned ${value.discoveriesPlanned}.`
      )
    );
  }
  return issues;
}

/**
 * Validate hook for the terminal engine terrain snapshot: full-grid parity
 * buffers (the snapshot exists for physics-vs-engine drift comparison).
 */
export function validatePlacementEngineTerrainSnapshotArtifact(value: unknown): ValidationIssue[] {
  if (!isRecord(value)) {
    return [issue("placementEngineTerrainSnapshot artifact must be an object.")];
  }
  const issues: ValidationIssue[] = [];
  const width = Number(value.width);
  const height = Number(value.height);
  const size = width * height;
  if (!Number.isSafeInteger(size) || size <= 0) {
    return [
      issue(
        `placementEngineTerrainSnapshot has invalid dimensions ${String(value.width)}x${String(value.height)}.`
      ),
    ];
  }
  for (const key of ["landMask", "terrain", "elevation"] as const) {
    const buffer = value[key] as { length?: number } | undefined;
    if (typeof buffer?.length !== "number" || buffer.length !== size) {
      issues.push(
        issue(
          `placementEngineTerrainSnapshot.${key} length ${String(buffer?.length)} != map size ${size}.`
        )
      );
    }
  }
  return issues;
}
