import type { MapDimensions } from "@civ7/adapter";
import { validateFoundationPlatesArtifact } from "@swooper/mapgen-core";

export type ArtifactValidationIssue = Readonly<{ message: string }>;

export function wrapFoundationValidate(
  value: unknown,
  dimensions: MapDimensions,
  validator: (value: unknown, dims: MapDimensions) => void
): ArtifactValidationIssue[] {
  try {
    validator(value, dimensions);
    return [];
  } catch (error) {
    return [{ message: error instanceof Error ? error.message : String(error) }];
  }
}

export function validateTileToCellIndexArtifact(value: unknown, dims: MapDimensions): void {
  if (!(value instanceof Int32Array)) {
    throw new Error("[FoundationArtifact] Invalid foundation tileToCellIndex.");
  }

  const expectedLen = Math.max(0, (dims.width | 0) * (dims.height | 0));
  if (value.length !== expectedLen) {
    throw new Error("[FoundationArtifact] Invalid foundation tileToCellIndex tensor length.");
  }
  for (let i = 0; i < value.length; i++) {
    const v = value[i] | 0;
    if (v < 0) {
      throw new Error("[FoundationArtifact] Invalid foundation tileToCellIndex value.");
    }
  }
}

export function validateCrustTilesArtifact(value: unknown, dims: MapDimensions): void {
  if (!value || typeof value !== "object") {
    throw new Error("[FoundationArtifact] Missing foundation crustTiles artifact payload.");
  }
  const crust = value as {
    type?: unknown;
    maturity?: unknown;
    thickness?: unknown;
    damage?: unknown;
    age?: unknown;
    buoyancy?: unknown;
    baseElevation?: unknown;
    strength?: unknown;
  };
  if (!(crust.type instanceof Uint8Array)) {
    throw new Error("[FoundationArtifact] Invalid foundation crustTiles.type.");
  }
  if (!(crust.maturity instanceof Float32Array)) {
    throw new Error("[FoundationArtifact] Invalid foundation crustTiles.maturity.");
  }
  if (!(crust.thickness instanceof Float32Array)) {
    throw new Error("[FoundationArtifact] Invalid foundation crustTiles.thickness.");
  }
  if (!(crust.damage instanceof Uint8Array)) {
    throw new Error("[FoundationArtifact] Invalid foundation crustTiles.damage.");
  }
  if (!(crust.age instanceof Uint8Array)) {
    throw new Error("[FoundationArtifact] Invalid foundation crustTiles.age.");
  }
  if (!(crust.buoyancy instanceof Float32Array)) {
    throw new Error("[FoundationArtifact] Invalid foundation crustTiles.buoyancy.");
  }
  if (!(crust.baseElevation instanceof Float32Array)) {
    throw new Error("[FoundationArtifact] Invalid foundation crustTiles.baseElevation.");
  }
  if (!(crust.strength instanceof Float32Array)) {
    throw new Error("[FoundationArtifact] Invalid foundation crustTiles.strength.");
  }

  const expectedLen = Math.max(0, (dims.width | 0) * (dims.height | 0));
  if (
    crust.type.length !== expectedLen ||
    crust.maturity.length !== expectedLen ||
    crust.thickness.length !== expectedLen ||
    crust.damage.length !== expectedLen ||
    crust.age.length !== expectedLen ||
    crust.buoyancy.length !== expectedLen ||
    crust.baseElevation.length !== expectedLen ||
    crust.strength.length !== expectedLen
  ) {
    throw new Error("[FoundationArtifact] Invalid foundation crustTiles tensor lengths.");
  }
}

export function validateTectonicHistoryTilesArtifact(value: unknown, dims: MapDimensions): void {
  if (!value || typeof value !== "object") {
    throw new Error(
      "[FoundationArtifact] Missing foundation tectonicHistoryTiles artifact payload."
    );
  }
  const history = value as {
    version?: unknown;
    eraCount?: unknown;
    perEra?: unknown;
    rollups?: unknown;
  };

  const version = typeof history.version === "number" ? history.version | 0 : 0;
  if (version <= 0) {
    throw new Error("[FoundationArtifact] Invalid foundation tectonicHistoryTiles.version.");
  }
  const eraCount = typeof history.eraCount === "number" ? history.eraCount | 0 : -1;
  if (eraCount < 5 || eraCount > 8) {
    throw new Error(
      "[FoundationArtifact] Invalid foundation tectonicHistoryTiles.eraCount (expected 5..8)."
    );
  }
  if (!Array.isArray(history.perEra) || history.perEra.length !== eraCount) {
    throw new Error("[FoundationArtifact] Invalid foundation tectonicHistoryTiles.perEra.");
  }

  const expectedLen = Math.max(0, (dims.width | 0) * (dims.height | 0));
  for (let e = 0; e < history.perEra.length; e++) {
    const era = history.perEra[e] as Record<string, unknown> | undefined;
    if (!era) {
      throw new Error(
        "[FoundationArtifact] Invalid foundation tectonicHistoryTiles.perEra payload."
      );
    }
    const fields = [
      "boundaryType",
      "upliftPotential",
      "collisionPotential",
      "subductionPotential",
      "riftPotential",
      "shearStress",
      "volcanism",
      "fracture",
    ] as const;
    for (const field of fields) {
      const v = era[field] as unknown;
      if (!(v instanceof Uint8Array) || v.length !== expectedLen) {
        throw new Error(
          `[FoundationArtifact] Invalid foundation tectonicHistoryTiles.perEra.${field}.`
        );
      }
    }
  }

  const rollups = history.rollups as Record<string, unknown> | undefined;
  if (!rollups || typeof rollups !== "object") {
    throw new Error("[FoundationArtifact] Invalid foundation tectonicHistoryTiles.rollups.");
  }
  const rollupFields = [
    ["upliftTotal", rollups.upliftTotal],
    ["collisionTotal", rollups.collisionTotal],
    ["subductionTotal", rollups.subductionTotal],
    ["fractureTotal", rollups.fractureTotal],
    ["volcanismTotal", rollups.volcanismTotal],
    ["upliftRecentFraction", rollups.upliftRecentFraction],
    ["collisionRecentFraction", rollups.collisionRecentFraction],
    ["subductionRecentFraction", rollups.subductionRecentFraction],
    ["lastActiveEra", rollups.lastActiveEra],
    ["lastCollisionEra", rollups.lastCollisionEra],
    ["lastSubductionEra", rollups.lastSubductionEra],
  ] as const;
  for (const [label, arr] of rollupFields) {
    if (!(arr instanceof Uint8Array) || arr.length !== expectedLen) {
      throw new Error(
        `[FoundationArtifact] Invalid foundation tectonicHistoryTiles.rollups.${label}.`
      );
    }
  }

  const movementU = (rollups as { movementU?: unknown }).movementU;
  if (!(movementU instanceof Int8Array) || movementU.length !== expectedLen) {
    throw new Error(
      "[FoundationArtifact] Invalid foundation tectonicHistoryTiles.rollups.movementU."
    );
  }
  const movementV = (rollups as { movementV?: unknown }).movementV;
  if (!(movementV instanceof Int8Array) || movementV.length !== expectedLen) {
    throw new Error(
      "[FoundationArtifact] Invalid foundation tectonicHistoryTiles.rollups.movementV."
    );
  }
}

export function validateTectonicProvenanceTilesArtifact(
  value: unknown,
  dims: MapDimensions
): void {
  if (!value || typeof value !== "object") {
    throw new Error(
      "[FoundationArtifact] Missing foundation tectonicProvenanceTiles artifact payload."
    );
  }
  const provenance = value as {
    version?: unknown;
    originEra?: unknown;
    originPlateId?: unknown;
    driftDistance?: unknown;
    lastBoundaryEra?: unknown;
    lastBoundaryType?: unknown;
  };
  const version = typeof provenance.version === "number" ? provenance.version | 0 : 0;
  if (version <= 0) {
    throw new Error("[FoundationArtifact] Invalid foundation tectonicProvenanceTiles.version.");
  }

  const expectedLen = Math.max(0, (dims.width | 0) * (dims.height | 0));
  if (
    !(provenance.originEra instanceof Uint8Array) ||
    provenance.originEra.length !== expectedLen
  ) {
    throw new Error("[FoundationArtifact] Invalid foundation tectonicProvenanceTiles.originEra.");
  }
  if (
    !(provenance.originPlateId instanceof Int16Array) ||
    provenance.originPlateId.length !== expectedLen
  ) {
    throw new Error(
      "[FoundationArtifact] Invalid foundation tectonicProvenanceTiles.originPlateId."
    );
  }
  if (
    !(provenance.driftDistance instanceof Uint8Array) ||
    provenance.driftDistance.length !== expectedLen
  ) {
    throw new Error(
      "[FoundationArtifact] Invalid foundation tectonicProvenanceTiles.driftDistance."
    );
  }
  if (
    !(provenance.lastBoundaryEra instanceof Uint8Array) ||
    provenance.lastBoundaryEra.length !== expectedLen
  ) {
    throw new Error(
      "[FoundationArtifact] Invalid foundation tectonicProvenanceTiles.lastBoundaryEra."
    );
  }
  if (
    !(provenance.lastBoundaryType instanceof Uint8Array) ||
    provenance.lastBoundaryType.length !== expectedLen
  ) {
    throw new Error(
      "[FoundationArtifact] Invalid foundation tectonicProvenanceTiles.lastBoundaryType."
    );
  }
}

export const validatePlatesArtifact = validateFoundationPlatesArtifact;
