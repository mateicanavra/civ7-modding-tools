import type { FoundationMesh } from "../ops/compute-mesh/contract.js";
import type { FoundationCrust } from "../ops/compute-crust/contract.js";
import type { FoundationMantleForcing } from "../ops/compute-mantle-forcing/contract.js";
import type { FoundationMantlePotential } from "../ops/compute-mantle-potential/contract.js";
import type { FoundationPlateMotion } from "../ops/compute-plate-motion/contract.js";
import type { FoundationPlateGraph } from "../ops/compute-plate-graph/contract.js";
import type {
  FoundationTectonicHistory,
  FoundationTectonicProvenance,
  FoundationTectonics,
} from "./tectonics/schemas.js";

const ERA_COUNT_MIN = 5;
const ERA_COUNT_MAX = 8;

export function requireMesh(mesh: FoundationMesh | undefined, scope: string): FoundationMesh {
  if (!mesh) {
    throw new Error(`[Foundation] Mesh not provided for ${scope}.`);
  }

  const cellCount = mesh.cellCount | 0;
  if (cellCount <= 0) throw new Error(`[Foundation] Invalid mesh.cellCount for ${scope}.`);

  if (typeof mesh.wrapWidth !== "number" || !Number.isFinite(mesh.wrapWidth) || mesh.wrapWidth <= 0) {
    throw new Error(`[Foundation] Invalid mesh.wrapWidth for ${scope}.`);
  }

  if (!(mesh.siteX instanceof Float32Array) || mesh.siteX.length !== cellCount) {
    throw new Error(`[Foundation] Invalid mesh.siteX for ${scope}.`);
  }
  if (!(mesh.siteY instanceof Float32Array) || mesh.siteY.length !== cellCount) {
    throw new Error(`[Foundation] Invalid mesh.siteY for ${scope}.`);
  }

  if (!(mesh.neighborsOffsets instanceof Int32Array) || mesh.neighborsOffsets.length !== cellCount + 1) {
    throw new Error(`[Foundation] Invalid mesh.neighborsOffsets for ${scope}.`);
  }
  if (!(mesh.neighbors instanceof Int32Array)) {
    throw new Error(`[Foundation] Invalid mesh.neighbors for ${scope}.`);
  }

  if (!(mesh.areas instanceof Float32Array) || mesh.areas.length !== cellCount) {
    throw new Error(`[Foundation] Invalid mesh.areas for ${scope}.`);
  }

  return mesh;
}

export function requireCrust(crust: FoundationCrust | undefined, cellCount: number, scope: string): FoundationCrust {
  if (!crust) {
    throw new Error(`[Foundation] Crust not provided for ${scope}.`);
  }

  if (!(crust.type instanceof Uint8Array) || crust.type.length !== cellCount) {
    throw new Error(`[Foundation] Invalid crust.type for ${scope}.`);
  }
  if (!(crust.maturity instanceof Float32Array) || crust.maturity.length !== cellCount) {
    throw new Error(`[Foundation] Invalid crust.maturity for ${scope}.`);
  }
  if (!(crust.thickness instanceof Float32Array) || crust.thickness.length !== cellCount) {
    throw new Error(`[Foundation] Invalid crust.thickness for ${scope}.`);
  }
  if (!(crust.thermalAge instanceof Uint8Array) || crust.thermalAge.length !== cellCount) {
    throw new Error(`[Foundation] Invalid crust.thermalAge for ${scope}.`);
  }
  if (!(crust.damage instanceof Uint8Array) || crust.damage.length !== cellCount) {
    throw new Error(`[Foundation] Invalid crust.damage for ${scope}.`);
  }
  if (!(crust.age instanceof Uint8Array) || crust.age.length !== cellCount) {
    throw new Error(`[Foundation] Invalid crust.age for ${scope}.`);
  }
  if (!(crust.buoyancy instanceof Float32Array) || crust.buoyancy.length !== cellCount) {
    throw new Error(`[Foundation] Invalid crust.buoyancy for ${scope}.`);
  }
  if (!(crust.baseElevation instanceof Float32Array) || crust.baseElevation.length !== cellCount) {
    throw new Error(`[Foundation] Invalid crust.baseElevation for ${scope}.`);
  }
  if (!(crust.strength instanceof Float32Array) || crust.strength.length !== cellCount) {
    throw new Error(`[Foundation] Invalid crust.strength for ${scope}.`);
  }

  return crust;
}

export function requireMantlePotential(
  mantle: FoundationMantlePotential | undefined,
  cellCount: number,
  scope: string
): FoundationMantlePotential {
  if (!mantle) {
    throw new Error(`[Foundation] MantlePotential not provided for ${scope}.`);
  }

  if ((mantle.cellCount | 0) !== cellCount) {
    throw new Error(`[Foundation] Invalid mantlePotential.cellCount for ${scope}.`);
  }
  if (!(mantle.potential instanceof Float32Array) || mantle.potential.length !== cellCount) {
    throw new Error(`[Foundation] Invalid mantlePotential.potential for ${scope}.`);
  }

  const sourceCount = mantle.sourceCount | 0;
  if (sourceCount < 0) {
    throw new Error(`[Foundation] Invalid mantlePotential.sourceCount for ${scope}.`);
  }
  if (!(mantle.sourceType instanceof Int8Array) || mantle.sourceType.length !== sourceCount) {
    throw new Error(`[Foundation] Invalid mantlePotential.sourceType for ${scope}.`);
  }
  if (!(mantle.sourceCell instanceof Uint32Array) || mantle.sourceCell.length !== sourceCount) {
    throw new Error(`[Foundation] Invalid mantlePotential.sourceCell for ${scope}.`);
  }
  if (!(mantle.sourceAmplitude instanceof Float32Array) || mantle.sourceAmplitude.length !== sourceCount) {
    throw new Error(`[Foundation] Invalid mantlePotential.sourceAmplitude for ${scope}.`);
  }
  if (!(mantle.sourceRadius instanceof Float32Array) || mantle.sourceRadius.length !== sourceCount) {
    throw new Error(`[Foundation] Invalid mantlePotential.sourceRadius for ${scope}.`);
  }

  return mantle;
}

export function requireMantleForcing(
  forcing: FoundationMantleForcing | undefined,
  cellCount: number,
  scope: string
): FoundationMantleForcing {
  if (!forcing) {
    throw new Error(`[Foundation] MantleForcing not provided for ${scope}.`);
  }

  if ((forcing.cellCount | 0) !== cellCount) {
    throw new Error(`[Foundation] Invalid mantleForcing.cellCount for ${scope}.`);
  }
  if (!(forcing.stress instanceof Float32Array) || forcing.stress.length !== cellCount) {
    throw new Error(`[Foundation] Invalid mantleForcing.stress for ${scope}.`);
  }
  if (!(forcing.forcingU instanceof Float32Array) || forcing.forcingU.length !== cellCount) {
    throw new Error(`[Foundation] Invalid mantleForcing.forcingU for ${scope}.`);
  }
  if (!(forcing.forcingV instanceof Float32Array) || forcing.forcingV.length !== cellCount) {
    throw new Error(`[Foundation] Invalid mantleForcing.forcingV for ${scope}.`);
  }
  if (!(forcing.forcingMag instanceof Float32Array) || forcing.forcingMag.length !== cellCount) {
    throw new Error(`[Foundation] Invalid mantleForcing.forcingMag for ${scope}.`);
  }
  if (!(forcing.upwellingClass instanceof Int8Array) || forcing.upwellingClass.length !== cellCount) {
    throw new Error(`[Foundation] Invalid mantleForcing.upwellingClass for ${scope}.`);
  }
  if (!(forcing.divergence instanceof Float32Array) || forcing.divergence.length !== cellCount) {
    throw new Error(`[Foundation] Invalid mantleForcing.divergence for ${scope}.`);
  }

  return forcing;
}

export function requirePlateGraph(
  graph: FoundationPlateGraph | undefined,
  cellCount: number,
  scope: string
): FoundationPlateGraph {
  if (!graph) {
    throw new Error(`[Foundation] PlateGraph not provided for ${scope}.`);
  }

  if (!(graph.cellToPlate instanceof Int16Array) || graph.cellToPlate.length !== cellCount) {
    throw new Error(`[Foundation] Invalid plateGraph.cellToPlate for ${scope}.`);
  }
  if (!Array.isArray(graph.plates) || graph.plates.length <= 0) {
    throw new Error(`[Foundation] Invalid plateGraph.plates for ${scope}.`);
  }

  return graph;
}

export function requirePlateMotion(
  motion: FoundationPlateMotion | undefined,
  cellCount: number,
  plateCount: number,
  scope: string
): FoundationPlateMotion {
  if (!motion) {
    throw new Error(`[Foundation] PlateMotion not provided for ${scope}.`);
  }

  if ((motion.cellCount | 0) !== cellCount) {
    throw new Error(`[Foundation] Invalid plateMotion.cellCount for ${scope}.`);
  }
  if ((motion.plateCount | 0) !== plateCount) {
    throw new Error(`[Foundation] Invalid plateMotion.plateCount for ${scope}.`);
  }

  const mustMatchPlates: ReadonlyArray<readonly [string, Float32Array]> = [
    ["plateCenterX", motion.plateCenterX],
    ["plateCenterY", motion.plateCenterY],
    ["plateVelocityX", motion.plateVelocityX],
    ["plateVelocityY", motion.plateVelocityY],
    ["plateOmega", motion.plateOmega],
    ["plateFitRms", motion.plateFitRms],
    ["plateFitP90", motion.plateFitP90],
  ];

  for (const [key, value] of mustMatchPlates) {
    if (!(value instanceof Float32Array) || value.length !== plateCount) {
      throw new Error(`[Foundation] Invalid plateMotion.${key} for ${scope}.`);
    }
  }

  if (!(motion.plateQuality instanceof Uint8Array) || motion.plateQuality.length !== plateCount) {
    throw new Error(`[Foundation] Invalid plateMotion.plateQuality for ${scope}.`);
  }
  if (!(motion.cellFitError instanceof Uint8Array) || motion.cellFitError.length !== cellCount) {
    throw new Error(`[Foundation] Invalid plateMotion.cellFitError for ${scope}.`);
  }

  return motion;
}

export function requireTectonics(
  tectonics: FoundationTectonics | undefined,
  cellCount: number,
  scope: string
): FoundationTectonics {
  if (!tectonics) {
    throw new Error(`[Foundation] Tectonics not provided for ${scope}.`);
  }

  const mustMatch = [
    ["boundaryType", tectonics.boundaryType],
    ["upliftPotential", tectonics.upliftPotential],
    ["riftPotential", tectonics.riftPotential],
    ["shearStress", tectonics.shearStress],
    ["volcanism", tectonics.volcanism],
    ["fracture", tectonics.fracture],
    ["cumulativeUplift", tectonics.cumulativeUplift],
  ] as const;

  for (const [key, value] of mustMatch) {
    if (!(value instanceof Uint8Array) || value.length !== cellCount) {
      throw new Error(`[Foundation] Invalid tectonics.${key} for ${scope}.`);
    }
  }

  return tectonics;
}

export function requireTectonicHistory(
  history: FoundationTectonicHistory | undefined,
  cellCount: number,
  scope: string
): FoundationTectonicHistory {
  if (!history) {
    throw new Error(`[Foundation] TectonicHistory not provided for ${scope}.`);
  }

  const eraCount = history.eraCount | 0;
  if (
    eraCount < ERA_COUNT_MIN ||
    eraCount > ERA_COUNT_MAX ||
    !Array.isArray(history.eras) ||
    history.eras.length !== eraCount
  ) {
    throw new Error(`[Foundation] Invalid tectonicHistory.eraCount for ${scope}.`);
  }

  const totals = [
    ["upliftTotal", history.upliftTotal],
    ["collisionTotal", history.collisionTotal],
    ["subductionTotal", history.subductionTotal],
    ["fractureTotal", history.fractureTotal],
    ["volcanismTotal", history.volcanismTotal],
    ["upliftRecentFraction", history.upliftRecentFraction],
    ["collisionRecentFraction", history.collisionRecentFraction],
    ["subductionRecentFraction", history.subductionRecentFraction],
    ["lastActiveEra", history.lastActiveEra],
    ["lastCollisionEra", history.lastCollisionEra],
    ["lastSubductionEra", history.lastSubductionEra],
  ] as const;

  for (const [label, arr] of totals) {
    if (!(arr instanceof Uint8Array) || arr.length !== cellCount) {
      throw new Error(`[Foundation] Invalid tectonicHistory.${label} for ${scope}.`);
    }
  }

  for (let e = 0; e < history.eras.length; e++) {
    const era = history.eras[e] as Record<string, unknown> | undefined;
    if (!era) {
      throw new Error(`[Foundation] Invalid tectonicHistory.eras[${e}] for ${scope}.`);
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
      if (!(v instanceof Uint8Array) || v.length !== cellCount) {
        throw new Error(`[Foundation] Invalid tectonicHistory.eras[${e}].${field} for ${scope}.`);
      }
    }
  }

  return history;
}

export function requireTectonicProvenance(
  provenance: FoundationTectonicProvenance | undefined,
  cellCount: number,
  scope: string
): FoundationTectonicProvenance {
  if (!provenance) {
    throw new Error(`[Foundation] TectonicProvenance not provided for ${scope}.`);
  }

  const eraCount = provenance.eraCount | 0;
  if (
    eraCount < ERA_COUNT_MIN ||
    eraCount > ERA_COUNT_MAX ||
    !Array.isArray(provenance.tracerIndex) ||
    provenance.tracerIndex.length !== eraCount
  ) {
    throw new Error(`[Foundation] Invalid tectonicProvenance.eraCount for ${scope}.`);
  }

  if ((provenance.cellCount | 0) !== cellCount) {
    throw new Error(`[Foundation] Invalid tectonicProvenance.cellCount for ${scope}.`);
  }

  for (let e = 0; e < provenance.tracerIndex.length; e++) {
    const tracer = provenance.tracerIndex[e];
    if (!(tracer instanceof Uint32Array) || tracer.length !== cellCount) {
      throw new Error(`[Foundation] Invalid tectonicProvenance.tracerIndex[${e}] for ${scope}.`);
    }
  }

  const scalars = provenance.provenance as Record<string, unknown> | undefined;
  if (!scalars || typeof scalars !== "object") {
    throw new Error(`[Foundation] Invalid tectonicProvenance.provenance for ${scope}.`);
  }

  const scalarFields: Array<[string, unknown, { new (...args: any[]): { length: number } }]> = [
    ["originEra", scalars.originEra, Uint8Array],
    ["originPlateId", scalars.originPlateId, Int16Array],
    ["lastBoundaryEra", scalars.lastBoundaryEra, Uint8Array],
    ["lastBoundaryType", scalars.lastBoundaryType, Uint8Array],
    ["lastBoundaryPolarity", scalars.lastBoundaryPolarity, Int8Array],
    ["lastBoundaryIntensity", scalars.lastBoundaryIntensity, Uint8Array],
    ["crustAge", scalars.crustAge, Uint8Array],
  ];

  for (const [label, arr, ctor] of scalarFields) {
    if (!(arr instanceof ctor) || arr.length !== cellCount) {
      throw new Error(`[Foundation] Invalid tectonicProvenance.provenance.${label} for ${scope}.`);
    }
  }

  return provenance;
}
