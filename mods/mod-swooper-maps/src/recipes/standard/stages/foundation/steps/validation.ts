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

export function wrapFoundationValidateNoDims(
  value: unknown,
  validator: (value: unknown) => void
): ArtifactValidationIssue[] {
  try {
    validator(value);
    return [];
  } catch (error) {
    return [{ message: error instanceof Error ? error.message : String(error) }];
  }
}

export function validateMeshArtifact(value: unknown): void {
  if (!value || typeof value !== "object") {
    throw new Error("[FoundationArtifact] Missing foundation mesh artifact payload.");
  }
  const mesh = value as {
    cellCount?: number;
    wrapWidth?: number;
    siteX?: unknown;
    siteY?: unknown;
    neighborsOffsets?: unknown;
    neighbors?: unknown;
    areas?: unknown;
  };
  const cellCount = typeof mesh.cellCount === "number" ? (mesh.cellCount | 0) : 0;
  if (cellCount <= 0) {
    throw new Error("[FoundationArtifact] Invalid foundation mesh cellCount.");
  }
  if (typeof mesh.wrapWidth !== "number" || !Number.isFinite(mesh.wrapWidth) || mesh.wrapWidth <= 0) {
    throw new Error("[FoundationArtifact] Invalid foundation mesh.wrapWidth.");
  }
  if (!(mesh.siteX instanceof Float32Array) || mesh.siteX.length !== cellCount) {
    throw new Error("[FoundationArtifact] Invalid foundation mesh.siteX.");
  }
  if (!(mesh.siteY instanceof Float32Array) || mesh.siteY.length !== cellCount) {
    throw new Error("[FoundationArtifact] Invalid foundation mesh.siteY.");
  }
  if (!(mesh.areas instanceof Float32Array) || mesh.areas.length !== cellCount) {
    throw new Error("[FoundationArtifact] Invalid foundation mesh.areas.");
  }
  if (!(mesh.neighborsOffsets instanceof Int32Array) || mesh.neighborsOffsets.length !== cellCount + 1) {
    throw new Error("[FoundationArtifact] Invalid foundation mesh.neighborsOffsets.");
  }
  if (!(mesh.neighbors instanceof Int32Array)) {
    throw new Error("[FoundationArtifact] Invalid foundation mesh.neighbors.");
  }
}

export function validateCrustArtifact(value: unknown): void {
  if (!value || typeof value !== "object") {
    throw new Error("[FoundationArtifact] Missing foundation crust artifact payload.");
  }
  const crust = value as {
    maturity?: unknown;
    thickness?: unknown;
    thermalAge?: unknown;
    damage?: unknown;
    type?: unknown;
    age?: unknown;
    buoyancy?: unknown;
    baseElevation?: unknown;
    strength?: unknown;
  };
  if (!(crust.maturity instanceof Float32Array)) {
    throw new Error("[FoundationArtifact] Invalid foundation crust.maturity.");
  }
  if (!(crust.thickness instanceof Float32Array)) {
    throw new Error("[FoundationArtifact] Invalid foundation crust.thickness.");
  }
  if (!(crust.thermalAge instanceof Uint8Array)) {
    throw new Error("[FoundationArtifact] Invalid foundation crust.thermalAge.");
  }
  if (!(crust.damage instanceof Uint8Array)) {
    throw new Error("[FoundationArtifact] Invalid foundation crust.damage.");
  }
  if (!(crust.type instanceof Uint8Array)) {
    throw new Error("[FoundationArtifact] Invalid foundation crust.type.");
  }
  if (!(crust.age instanceof Uint8Array)) {
    throw new Error("[FoundationArtifact] Invalid foundation crust.age.");
  }
  if (!(crust.buoyancy instanceof Float32Array)) {
    throw new Error("[FoundationArtifact] Invalid foundation crust.buoyancy.");
  }
  if (!(crust.baseElevation instanceof Float32Array)) {
    throw new Error("[FoundationArtifact] Invalid foundation crust.baseElevation.");
  }
  if (!(crust.strength instanceof Float32Array)) {
    throw new Error("[FoundationArtifact] Invalid foundation crust.strength.");
  }
  if (crust.type.length <= 0 || crust.age.length <= 0 || crust.type.length !== crust.age.length) {
    throw new Error("[FoundationArtifact] Invalid foundation crust tensor lengths.");
  }
  if (
    crust.maturity.length !== crust.type.length ||
    crust.thickness.length !== crust.type.length ||
    crust.thermalAge.length !== crust.type.length ||
    crust.damage.length !== crust.type.length ||
    crust.buoyancy.length !== crust.type.length ||
    crust.baseElevation.length !== crust.type.length ||
    crust.strength.length !== crust.type.length
  ) {
    throw new Error("[FoundationArtifact] Invalid foundation crust driver tensor lengths.");
  }
}

export function validateMantlePotentialArtifact(value: unknown): void {
  if (!value || typeof value !== "object") {
    throw new Error("[FoundationArtifact] Missing foundation mantlePotential artifact payload.");
  }
  const mantle = value as {
    version?: unknown;
    cellCount?: unknown;
    potential?: unknown;
    sourceCount?: unknown;
    sourceType?: unknown;
    sourceCell?: unknown;
    sourceAmplitude?: unknown;
    sourceRadius?: unknown;
  };
  const version = typeof mantle.version === "number" ? (mantle.version | 0) : 0;
  if (version <= 0) {
    throw new Error("[FoundationArtifact] Invalid foundation mantlePotential.version.");
  }
  const cellCount = typeof mantle.cellCount === "number" ? (mantle.cellCount | 0) : 0;
  if (cellCount <= 0) {
    throw new Error("[FoundationArtifact] Invalid foundation mantlePotential.cellCount.");
  }
  if (!(mantle.potential instanceof Float32Array) || mantle.potential.length !== cellCount) {
    throw new Error("[FoundationArtifact] Invalid foundation mantlePotential.potential.");
  }

  const sourceCount = typeof mantle.sourceCount === "number" ? (mantle.sourceCount | 0) : -1;
  if (sourceCount < 0) {
    throw new Error("[FoundationArtifact] Invalid foundation mantlePotential.sourceCount.");
  }
  if (!(mantle.sourceType instanceof Int8Array) || mantle.sourceType.length !== sourceCount) {
    throw new Error("[FoundationArtifact] Invalid foundation mantlePotential.sourceType.");
  }
  if (!(mantle.sourceCell instanceof Uint32Array) || mantle.sourceCell.length !== sourceCount) {
    throw new Error("[FoundationArtifact] Invalid foundation mantlePotential.sourceCell.");
  }
  if (!(mantle.sourceAmplitude instanceof Float32Array) || mantle.sourceAmplitude.length !== sourceCount) {
    throw new Error("[FoundationArtifact] Invalid foundation mantlePotential.sourceAmplitude.");
  }
  if (!(mantle.sourceRadius instanceof Float32Array) || mantle.sourceRadius.length !== sourceCount) {
    throw new Error("[FoundationArtifact] Invalid foundation mantlePotential.sourceRadius.");
  }
}

export function validateMantleForcingArtifact(value: unknown): void {
  if (!value || typeof value !== "object") {
    throw new Error("[FoundationArtifact] Missing foundation mantleForcing artifact payload.");
  }
  const forcing = value as {
    version?: unknown;
    cellCount?: unknown;
    stress?: unknown;
    forcingU?: unknown;
    forcingV?: unknown;
    forcingMag?: unknown;
    upwellingClass?: unknown;
    divergence?: unknown;
  };
  const version = typeof forcing.version === "number" ? (forcing.version | 0) : 0;
  if (version <= 0) {
    throw new Error("[FoundationArtifact] Invalid foundation mantleForcing.version.");
  }
  const cellCount = typeof forcing.cellCount === "number" ? (forcing.cellCount | 0) : 0;
  if (cellCount <= 0) {
    throw new Error("[FoundationArtifact] Invalid foundation mantleForcing.cellCount.");
  }
  if (!(forcing.stress instanceof Float32Array) || forcing.stress.length !== cellCount) {
    throw new Error("[FoundationArtifact] Invalid foundation mantleForcing.stress.");
  }
  if (!(forcing.forcingU instanceof Float32Array) || forcing.forcingU.length !== cellCount) {
    throw new Error("[FoundationArtifact] Invalid foundation mantleForcing.forcingU.");
  }
  if (!(forcing.forcingV instanceof Float32Array) || forcing.forcingV.length !== cellCount) {
    throw new Error("[FoundationArtifact] Invalid foundation mantleForcing.forcingV.");
  }
  if (!(forcing.forcingMag instanceof Float32Array) || forcing.forcingMag.length !== cellCount) {
    throw new Error("[FoundationArtifact] Invalid foundation mantleForcing.forcingMag.");
  }
  if (!(forcing.upwellingClass instanceof Int8Array) || forcing.upwellingClass.length !== cellCount) {
    throw new Error("[FoundationArtifact] Invalid foundation mantleForcing.upwellingClass.");
  }
  if (!(forcing.divergence instanceof Float32Array) || forcing.divergence.length !== cellCount) {
    throw new Error("[FoundationArtifact] Invalid foundation mantleForcing.divergence.");
  }
}

export function validatePlateMotionArtifact(value: unknown): void {
  if (!value || typeof value !== "object") {
    throw new Error("[FoundationArtifact] Missing foundation plateMotion artifact payload.");
  }
  const motion = value as {
    version?: unknown;
    cellCount?: unknown;
    plateCount?: unknown;
    plateCenterX?: unknown;
    plateCenterY?: unknown;
    plateVelocityX?: unknown;
    plateVelocityY?: unknown;
    plateOmega?: unknown;
    plateFitRms?: unknown;
    plateFitP90?: unknown;
    plateQuality?: unknown;
    cellFitError?: unknown;
  };

  const version = typeof motion.version === "number" ? (motion.version | 0) : 0;
  if (version <= 0) {
    throw new Error("[FoundationArtifact] Invalid foundation plateMotion.version.");
  }
  const cellCount = typeof motion.cellCount === "number" ? (motion.cellCount | 0) : 0;
  if (cellCount <= 0) {
    throw new Error("[FoundationArtifact] Invalid foundation plateMotion.cellCount.");
  }
  const plateCount = typeof motion.plateCount === "number" ? (motion.plateCount | 0) : 0;
  if (plateCount <= 0) {
    throw new Error("[FoundationArtifact] Invalid foundation plateMotion.plateCount.");
  }

  const mustMatchPlates = [
    ["plateCenterX", motion.plateCenterX],
    ["plateCenterY", motion.plateCenterY],
    ["plateVelocityX", motion.plateVelocityX],
    ["plateVelocityY", motion.plateVelocityY],
    ["plateOmega", motion.plateOmega],
    ["plateFitRms", motion.plateFitRms],
    ["plateFitP90", motion.plateFitP90],
  ] as const;

  for (const [key, value] of mustMatchPlates) {
    if (!(value instanceof Float32Array) || value.length !== plateCount) {
      throw new Error(`[FoundationArtifact] Invalid foundation plateMotion.${key}.`);
    }
  }
  if (!(motion.plateQuality instanceof Uint8Array) || motion.plateQuality.length !== plateCount) {
    throw new Error("[FoundationArtifact] Invalid foundation plateMotion.plateQuality.");
  }
  if (!(motion.cellFitError instanceof Uint8Array) || motion.cellFitError.length !== cellCount) {
    throw new Error("[FoundationArtifact] Invalid foundation plateMotion.cellFitError.");
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
    throw new Error("[FoundationArtifact] Missing foundation tectonicHistoryTiles artifact payload.");
  }
  const history = value as {
    version?: unknown;
    eraCount?: unknown;
    perEra?: unknown;
    rollups?: unknown;
  };

  const version = typeof history.version === "number" ? (history.version | 0) : 0;
  if (version <= 0) {
    throw new Error("[FoundationArtifact] Invalid foundation tectonicHistoryTiles.version.");
  }
  const eraCount = typeof history.eraCount === "number" ? (history.eraCount | 0) : -1;
  if (eraCount < 5 || eraCount > 8) {
    throw new Error("[FoundationArtifact] Invalid foundation tectonicHistoryTiles.eraCount (expected 5..8).");
  }
  if (!Array.isArray(history.perEra) || history.perEra.length !== eraCount) {
    throw new Error("[FoundationArtifact] Invalid foundation tectonicHistoryTiles.perEra.");
  }

  const expectedLen = Math.max(0, (dims.width | 0) * (dims.height | 0));
  for (let e = 0; e < history.perEra.length; e++) {
    const era = history.perEra[e] as Record<string, unknown> | undefined;
    if (!era) {
      throw new Error("[FoundationArtifact] Invalid foundation tectonicHistoryTiles.perEra payload.");
    }
    const fields = ["boundaryType", "upliftPotential", "riftPotential", "shearStress", "volcanism", "fracture"] as const;
    for (const field of fields) {
      const v = era[field] as unknown;
      if (!(v instanceof Uint8Array) || v.length !== expectedLen) {
        throw new Error(`[FoundationArtifact] Invalid foundation tectonicHistoryTiles.perEra.${field}.`);
      }
    }
  }

  const rollups = history.rollups as Record<string, unknown> | undefined;
  if (!rollups || typeof rollups !== "object") {
    throw new Error("[FoundationArtifact] Invalid foundation tectonicHistoryTiles.rollups.");
  }
  const rollupFields = [
    ["upliftTotal", rollups.upliftTotal],
    ["fractureTotal", rollups.fractureTotal],
    ["volcanismTotal", rollups.volcanismTotal],
    ["upliftRecentFraction", rollups.upliftRecentFraction],
    ["lastActiveEra", rollups.lastActiveEra],
  ] as const;
  for (const [label, arr] of rollupFields) {
    if (!(arr instanceof Uint8Array) || arr.length !== expectedLen) {
      throw new Error(`[FoundationArtifact] Invalid foundation tectonicHistoryTiles.rollups.${label}.`);
    }
  }

  const movementU = (rollups as { movementU?: unknown }).movementU;
  if (!(movementU instanceof Int8Array) || movementU.length !== expectedLen) {
    throw new Error("[FoundationArtifact] Invalid foundation tectonicHistoryTiles.rollups.movementU.");
  }
  const movementV = (rollups as { movementV?: unknown }).movementV;
  if (!(movementV instanceof Int8Array) || movementV.length !== expectedLen) {
    throw new Error("[FoundationArtifact] Invalid foundation tectonicHistoryTiles.rollups.movementV.");
  }
}

export function validateTectonicProvenanceTilesArtifact(value: unknown, dims: MapDimensions): void {
  if (!value || typeof value !== "object") {
    throw new Error("[FoundationArtifact] Missing foundation tectonicProvenanceTiles artifact payload.");
  }
  const provenance = value as {
    version?: unknown;
    originEra?: unknown;
    originPlateId?: unknown;
    driftDistance?: unknown;
    lastBoundaryEra?: unknown;
    lastBoundaryType?: unknown;
  };
  const version = typeof provenance.version === "number" ? (provenance.version | 0) : 0;
  if (version <= 0) {
    throw new Error("[FoundationArtifact] Invalid foundation tectonicProvenanceTiles.version.");
  }

  const expectedLen = Math.max(0, (dims.width | 0) * (dims.height | 0));
  if (!(provenance.originEra instanceof Uint8Array) || provenance.originEra.length !== expectedLen) {
    throw new Error("[FoundationArtifact] Invalid foundation tectonicProvenanceTiles.originEra.");
  }
  if (!(provenance.originPlateId instanceof Int16Array) || provenance.originPlateId.length !== expectedLen) {
    throw new Error("[FoundationArtifact] Invalid foundation tectonicProvenanceTiles.originPlateId.");
  }
  if (!(provenance.driftDistance instanceof Uint8Array) || provenance.driftDistance.length !== expectedLen) {
    throw new Error("[FoundationArtifact] Invalid foundation tectonicProvenanceTiles.driftDistance.");
  }
  if (!(provenance.lastBoundaryEra instanceof Uint8Array) || provenance.lastBoundaryEra.length !== expectedLen) {
    throw new Error("[FoundationArtifact] Invalid foundation tectonicProvenanceTiles.lastBoundaryEra.");
  }
  if (!(provenance.lastBoundaryType instanceof Uint8Array) || provenance.lastBoundaryType.length !== expectedLen) {
    throw new Error("[FoundationArtifact] Invalid foundation tectonicProvenanceTiles.lastBoundaryType.");
  }
}

export function validatePlateGraphArtifact(value: unknown): void {
  if (!value || typeof value !== "object") {
    throw new Error("[FoundationArtifact] Missing foundation plateGraph artifact payload.");
  }
  const graph = value as { cellToPlate?: unknown; plates?: unknown };
  if (!(graph.cellToPlate instanceof Int16Array) || graph.cellToPlate.length <= 0) {
    throw new Error("[FoundationArtifact] Invalid foundation plateGraph.cellToPlate.");
  }
  if (!Array.isArray(graph.plates) || graph.plates.length <= 0) {
    throw new Error("[FoundationArtifact] Invalid foundation plateGraph.plates.");
  }
}

export function validateTectonicSegmentsArtifact(value: unknown): void {
  if (!value || typeof value !== "object") {
    throw new Error("[FoundationArtifact] Missing foundation tectonicSegments artifact payload.");
  }
  const seg = value as Record<string, unknown> & { segmentCount?: unknown };
  const segmentCount = typeof seg.segmentCount === "number" ? (seg.segmentCount | 0) : -1;
  if (segmentCount < 0) {
    throw new Error("[FoundationArtifact] Invalid foundation tectonicSegments.segmentCount.");
  }

  const arrays = [
    "aCell",
    "bCell",
    "plateA",
    "plateB",
    "regime",
    "polarity",
    "compression",
    "extension",
    "shear",
    "volcanism",
    "fracture",
    "driftU",
    "driftV",
  ] as const;

  for (const key of arrays) {
    const v = seg[key] as unknown;
    const ok =
      v instanceof Int32Array ||
      v instanceof Int16Array ||
      v instanceof Uint8Array ||
      v instanceof Int8Array;
    if (!ok) {
      throw new Error(`[FoundationArtifact] Invalid foundation tectonicSegments.${key}.`);
    }
    if ((v as { length: number }).length !== segmentCount) {
      throw new Error(`[FoundationArtifact] Invalid foundation tectonicSegments.${key} length.`);
    }
  }
}

export function validateTectonicHistoryArtifact(value: unknown): void {
  if (!value || typeof value !== "object") {
    throw new Error("[FoundationArtifact] Missing foundation tectonicHistory artifact payload.");
  }
  const history = value as {
    eraCount?: unknown;
    eras?: unknown;
    upliftTotal?: unknown;
    fractureTotal?: unknown;
    volcanismTotal?: unknown;
    upliftRecentFraction?: unknown;
    lastActiveEra?: unknown;
  };

  const eraCount = typeof history.eraCount === "number" ? (history.eraCount | 0) : -1;
  const minEraCount = 5;
  const maxEraCount = 8;
  if (eraCount < minEraCount || eraCount > maxEraCount) {
    throw new Error("[FoundationArtifact] Invalid foundation tectonicHistory.eraCount.");
  }
  if (!Array.isArray(history.eras) || history.eras.length !== eraCount) {
    throw new Error("[FoundationArtifact] Invalid foundation tectonicHistory.eras.");
  }

  const totals = [
    ["upliftTotal", history.upliftTotal],
    ["fractureTotal", history.fractureTotal],
    ["volcanismTotal", history.volcanismTotal],
    ["upliftRecentFraction", history.upliftRecentFraction],
    ["lastActiveEra", history.lastActiveEra],
  ] as const;

  let cellCount: number | null = null;
  for (const [label, arr] of totals) {
    if (!(arr instanceof Uint8Array)) {
      throw new Error(`[FoundationArtifact] Invalid foundation tectonicHistory.${label}.`);
    }
    if (cellCount == null) cellCount = arr.length;
    if (arr.length !== cellCount) {
      throw new Error(`[FoundationArtifact] Invalid foundation tectonicHistory.${label} length.`);
    }
  }

  for (let e = 0; e < history.eras.length; e++) {
    const era = history.eras[e] as Record<string, unknown> | undefined;
    if (!era) throw new Error("[FoundationArtifact] Invalid foundation tectonicHistory era payload.");
    const fields = ["boundaryType", "upliftPotential", "riftPotential", "shearStress", "volcanism", "fracture"] as const;
    for (const field of fields) {
      const v = era[field] as unknown;
      if (!(v instanceof Uint8Array)) {
        throw new Error(`[FoundationArtifact] Invalid foundation tectonicHistory.eras[${e}].${field}.`);
      }
      if (cellCount != null && v.length !== cellCount) {
        throw new Error(`[FoundationArtifact] Invalid foundation tectonicHistory.eras[${e}].${field} length.`);
      }
    }
  }
}

export function validateTectonicProvenanceArtifact(value: unknown): void {
  if (!value || typeof value !== "object") {
    throw new Error("[FoundationArtifact] Missing foundation tectonicProvenance artifact payload.");
  }

  const provenance = value as {
    version?: unknown;
    eraCount?: unknown;
    cellCount?: unknown;
    tracerIndex?: unknown;
    provenance?: unknown;
  };

  const version = typeof provenance.version === "number" ? (provenance.version | 0) : 0;
  if (version <= 0) {
    throw new Error("[FoundationArtifact] Invalid foundation tectonicProvenance.version.");
  }

  const eraCount = typeof provenance.eraCount === "number" ? (provenance.eraCount | 0) : -1;
  const minEraCount = 5;
  const maxEraCount = 8;
  if (eraCount < minEraCount || eraCount > maxEraCount) {
    throw new Error("[FoundationArtifact] Invalid foundation tectonicProvenance.eraCount.");
  }

  const cellCount = typeof provenance.cellCount === "number" ? (provenance.cellCount | 0) : -1;
  if (cellCount <= 0) {
    throw new Error("[FoundationArtifact] Invalid foundation tectonicProvenance.cellCount.");
  }

  if (!Array.isArray(provenance.tracerIndex) || provenance.tracerIndex.length !== eraCount) {
    throw new Error("[FoundationArtifact] Invalid foundation tectonicProvenance.tracerIndex.");
  }

  for (let e = 0; e < provenance.tracerIndex.length; e++) {
    const trace = provenance.tracerIndex[e] as unknown;
    if (!(trace instanceof Uint32Array) || trace.length !== cellCount) {
      throw new Error(`[FoundationArtifact] Invalid foundation tectonicProvenance.tracerIndex[${e}].`);
    }
  }

  const scalars = provenance.provenance as Record<string, unknown> | undefined;
  if (!scalars || typeof scalars !== "object") {
    throw new Error("[FoundationArtifact] Invalid foundation tectonicProvenance.provenance.");
  }

  const checks: Array<[string, unknown, "u8" | "i8" | "i16"]> = [
    ["originEra", scalars.originEra, "u8"],
    ["originPlateId", scalars.originPlateId, "i16"],
    ["lastBoundaryEra", scalars.lastBoundaryEra, "u8"],
    ["lastBoundaryType", scalars.lastBoundaryType, "u8"],
    ["lastBoundaryPolarity", scalars.lastBoundaryPolarity, "i8"],
    ["lastBoundaryIntensity", scalars.lastBoundaryIntensity, "u8"],
    ["crustAge", scalars.crustAge, "u8"],
  ];

  for (const [label, value, kind] of checks) {
    const ok =
      (kind === "u8" && value instanceof Uint8Array) ||
      (kind === "i8" && value instanceof Int8Array) ||
      (kind === "i16" && value instanceof Int16Array);
    if (!ok) {
      throw new Error(`[FoundationArtifact] Invalid foundation tectonicProvenance.provenance.${label}.`);
    }
    if ((value as { length: number }).length !== cellCount) {
      throw new Error(`[FoundationArtifact] Invalid foundation tectonicProvenance.provenance.${label} length.`);
    }
  }
}

export function validatePlateTopologyArtifact(value: unknown): void {
  if (!value || typeof value !== "object") {
    throw new Error("[FoundationArtifact] Missing foundation plateTopology artifact payload.");
  }
  const topology = value as {
    plateCount?: unknown;
    plates?: unknown;
  };
  const plateCount = typeof topology.plateCount === "number" ? (topology.plateCount | 0) : 0;
  if (plateCount <= 0) {
    throw new Error("[FoundationArtifact] Invalid foundation plateTopology.plateCount.");
  }
  if (!Array.isArray(topology.plates) || topology.plates.length !== plateCount) {
    throw new Error("[FoundationArtifact] Invalid foundation plateTopology.plates.");
  }
  for (let i = 0; i < topology.plates.length; i++) {
    const plate = topology.plates[i] as
      | { id?: unknown; area?: unknown; centroid?: unknown; neighbors?: unknown }
      | undefined;
    const id = typeof plate?.id === "number" ? (plate.id | 0) : -1;
    if (id < 0 || id >= plateCount) {
      throw new Error("[FoundationArtifact] Invalid foundation plateTopology plate id.");
    }
    const area = typeof plate?.area === "number" ? (plate.area | 0) : -1;
    if (area < 0) {
      throw new Error("[FoundationArtifact] Invalid foundation plateTopology plate area.");
    }
    const centroid = plate?.centroid as { x?: unknown; y?: unknown } | undefined;
    if (!centroid || typeof centroid !== "object") {
      throw new Error("[FoundationArtifact] Invalid foundation plateTopology plate centroid.");
    }
    if (typeof centroid.x !== "number" || typeof centroid.y !== "number") {
      throw new Error("[FoundationArtifact] Invalid foundation plateTopology plate centroid.");
    }
    if (plate?.neighbors != null && !Array.isArray(plate.neighbors)) {
      throw new Error("[FoundationArtifact] Invalid foundation plateTopology plate neighbors.");
    }
  }
}

export function validateTectonicsArtifact(value: unknown): void {
  if (!value || typeof value !== "object") {
    throw new Error("[FoundationArtifact] Missing foundation tectonics artifact payload.");
  }
  const tectonics = value as Record<string, unknown>;
  const fields = [
    "boundaryType",
    "upliftPotential",
    "riftPotential",
    "shearStress",
    "volcanism",
    "fracture",
    "cumulativeUplift",
  ] as const;

  let expectedLen: number | null = null;
  for (const field of fields) {
    const candidate = tectonics[field];
    if (!(candidate instanceof Uint8Array)) {
      throw new Error(`[FoundationArtifact] Invalid foundation tectonics.${field}.`);
    }
    if (expectedLen == null) expectedLen = candidate.length;
    if (candidate.length <= 0 || candidate.length !== expectedLen) {
      throw new Error("[FoundationArtifact] Invalid foundation tectonics tensor lengths.");
    }
  }
}

export const validatePlatesArtifact = validateFoundationPlatesArtifact;
