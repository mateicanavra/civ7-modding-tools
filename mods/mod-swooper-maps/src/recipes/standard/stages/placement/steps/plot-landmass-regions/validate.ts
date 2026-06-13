type ValidationIssue = { message: string };

function issue(message: string): ValidationIssue {
  return { message };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Validate hook for the projection metadata artifact (topology locks). */
export function validateProjectionMetaArtifact(value: unknown): ValidationIssue[] {
  if (!isRecord(value)) return [issue("projectionMeta artifact must be an object.")];
  const issues: ValidationIssue[] = [];
  if (!Number.isInteger(value.width) || (value.width as number) < 1) {
    issues.push(issue(`projectionMeta.width ${String(value.width)} must be a positive integer.`));
  }
  if (!Number.isInteger(value.height) || (value.height as number) < 1) {
    issues.push(issue(`projectionMeta.height ${String(value.height)} must be a positive integer.`));
  }
  if (value.wrapX !== true || value.wrapY !== false) {
    issues.push(
      issue("projectionMeta must carry the Civ7 topology locks (wrapX=true, wrapY=false).")
    );
  }
  return issues;
}

/** Validate hook for the per-tile landmass region slot projection. */
export function validateLandmassRegionSlotByTileArtifact(value: unknown): ValidationIssue[] {
  if (!isRecord(value)) return [issue("landmassRegionSlotByTile artifact must be an object.")];
  const slotByTile = value.slotByTile;
  if (!(slotByTile instanceof Uint8Array) || slotByTile.length === 0) {
    return [issue("landmassRegionSlotByTile.slotByTile must be a non-empty Uint8Array.")];
  }
  for (let i = 0; i < slotByTile.length; i++) {
    const slot = slotByTile[i] ?? 0;
    if (slot > 2) {
      return [issue(`slotByTile[${i}] = ${slot} outside the slot domain {0,1,2}.`)];
    }
  }
  return [];
}
