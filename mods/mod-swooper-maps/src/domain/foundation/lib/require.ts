import type { FoundationMesh } from "../ops/compute-mesh/contract.js";
import type { FoundationCrust } from "../ops/compute-crust/contract.js";
import type { FoundationPlateGraph } from "../ops/compute-plate-graph/contract.js";
import type {
  FoundationTectonicHistory,
  FoundationTectonics,
} from "../ops/compute-tectonic-history/contract.js";
import type { FoundationTectonicProvenance } from "../ops/compute-plates-tensors/contract.js";

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
  if (eraCount <= 0 || !Array.isArray(history.eras) || history.eras.length !== eraCount) {
    throw new Error(`[Foundation] Invalid tectonicHistory.eraCount for ${scope}.`);
  }

  const totals = [
    ["upliftTotal", history.upliftTotal],
    ["fractureTotal", history.fractureTotal],
    ["volcanismTotal", history.volcanismTotal],
    ["upliftRecentFraction", history.upliftRecentFraction],
    ["lastActiveEra", history.lastActiveEra],
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
    const fields = ["boundaryType", "upliftPotential", "riftPotential", "shearStress", "volcanism", "fracture"] as const;
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
  if (eraCount <= 0 || !Array.isArray(provenance.tracerIndex) || provenance.tracerIndex.length !== eraCount) {
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
