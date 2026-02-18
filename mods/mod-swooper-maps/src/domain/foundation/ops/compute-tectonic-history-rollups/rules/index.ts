import type { FoundationTectonicHistory } from "../../../lib/tectonics/schemas.js";
import type { FoundationTectonicEraFieldsInternal } from "../../../lib/tectonics/internal-contract.js";

import { clampByte } from "../../../lib/tectonics/shared.js";

export function buildTectonicHistoryRollups(params: {
  eras: ReadonlyArray<FoundationTectonicEraFieldsInternal>;
  plateIdByEra: ReadonlyArray<Int16Array>;
  activityThreshold: number;
}): FoundationTectonicHistory {
  const eras = params.eras;
  const eraCount = eras.length;
  const cellCount = eras[0]?.boundaryType.length ?? 0;
  const upliftTotal = new Uint8Array(cellCount);
  const collisionTotal = new Uint8Array(cellCount);
  const subductionTotal = new Uint8Array(cellCount);
  const fractureTotal = new Uint8Array(cellCount);
  const volcanismTotal = new Uint8Array(cellCount);
  const upliftRecentFraction = new Uint8Array(cellCount);
  const collisionRecentFraction = new Uint8Array(cellCount);
  const subductionRecentFraction = new Uint8Array(cellCount);

  for (let i = 0; i < cellCount; i++) {
    let upliftSum = 0;
    let collisionSum = 0;
    let subductionSum = 0;
    let fracSum = 0;
    let volcSum = 0;
    for (let era = 0; era < eraCount; era++) {
      const e = eras[era]!;
      upliftSum = clampByte(upliftSum + (e.upliftPotential[i] ?? 0));
      collisionSum = clampByte(collisionSum + (e.collisionPotential[i] ?? 0));
      subductionSum = clampByte(subductionSum + (e.subductionPotential[i] ?? 0));
      fracSum = clampByte(fracSum + (e.fracture[i] ?? 0));
      volcSum = clampByte(volcSum + (e.volcanism[i] ?? 0));
    }
    upliftTotal[i] = upliftSum;
    collisionTotal[i] = collisionSum;
    subductionTotal[i] = subductionSum;
    fractureTotal[i] = fracSum;
    volcanismTotal[i] = volcSum;

    const recent = eras[eraCount - 1]!.upliftPotential[i] ?? 0;
    upliftRecentFraction[i] = upliftSum > 0 ? clampByte((recent / upliftSum) * 255) : 0;

    const recentCollision = eras[eraCount - 1]!.collisionPotential[i] ?? 0;
    collisionRecentFraction[i] = collisionSum > 0 ? clampByte((recentCollision / collisionSum) * 255) : 0;

    const recentSubduction = eras[eraCount - 1]!.subductionPotential[i] ?? 0;
    subductionRecentFraction[i] = subductionSum > 0 ? clampByte((recentSubduction / subductionSum) * 255) : 0;
  }

  const lastActiveEra = (() => {
    const last = new Uint8Array(cellCount);
    last.fill(255);

    for (let i = 0; i < cellCount; i++) {
      let lastEra = 255;
      for (let e = eras.length - 1; e >= 0; e--) {
        const era = eras[e]!;
        const max = Math.max(
          era.upliftPotential[i] ?? 0,
          era.riftPotential[i] ?? 0,
          era.shearStress[i] ?? 0,
          era.volcanism[i] ?? 0,
          era.fracture[i] ?? 0
        );
        if (max > (params.activityThreshold | 0)) {
          lastEra = e;
          break;
        }
      }
      last[i] = lastEra;
    }
    return last;
  })();

  const lastCollisionEra = (() => {
    const last = new Uint8Array(cellCount);
    last.fill(255);

    for (let i = 0; i < cellCount; i++) {
      let lastEra = 255;
      for (let e = eras.length - 1; e >= 0; e--) {
        const era = eras[e]!;
        const value = era.collisionPotential[i] ?? 0;
        if (value > (params.activityThreshold | 0)) {
          lastEra = e;
          break;
        }
      }
      last[i] = lastEra;
    }
    return last;
  })();

  const lastSubductionEra = (() => {
    const last = new Uint8Array(cellCount);
    last.fill(255);

    for (let i = 0; i < cellCount; i++) {
      let lastEra = 255;
      for (let e = eras.length - 1; e >= 0; e--) {
        const era = eras[e]!;
        const value = era.subductionPotential[i] ?? 0;
        if (value > (params.activityThreshold | 0)) {
          lastEra = e;
          break;
        }
      }
      last[i] = lastEra;
    }
    return last;
  })();

  return {
    eraCount,
    eras: eras.map((era) => ({
      boundaryType: era.boundaryType,
      upliftPotential: era.upliftPotential,
      collisionPotential: era.collisionPotential,
      subductionPotential: era.subductionPotential,
      riftPotential: era.riftPotential,
      shearStress: era.shearStress,
      volcanism: era.volcanism,
      fracture: era.fracture,
    })),
    plateIdByEra: params.plateIdByEra,
    upliftTotal,
    collisionTotal,
    subductionTotal,
    fractureTotal,
    volcanismTotal,
    upliftRecentFraction,
    collisionRecentFraction,
    subductionRecentFraction,
    lastActiveEra,
    lastCollisionEra,
    lastSubductionEra,
  };
}
