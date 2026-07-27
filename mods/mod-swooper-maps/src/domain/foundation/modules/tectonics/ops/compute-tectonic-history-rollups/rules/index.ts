import { quantizeU8 } from "@swooper/mapgen-core/lib/math";
import type { TectonicHistoryEra } from "../../../model/atoms/tectonic-history-era.schema.js";

type TectonicEraInput = {
  readonly boundaryType: ArrayLike<number>;
  readonly upliftPotential: ArrayLike<number>;
  readonly collisionPotential: ArrayLike<number>;
  readonly subductionPotential: ArrayLike<number>;
  readonly riftPotential: ArrayLike<number>;
  readonly shearStress: ArrayLike<number>;
  readonly volcanism: ArrayLike<number>;
  readonly fracture: ArrayLike<number>;
};

type TectonicHistoryRollup = Readonly<{
  eraCount: number;
  eras: ReadonlyArray<TectonicHistoryEra>;
  plateIdByEra: ReadonlyArray<Int16Array>;
  upliftTotal: Uint8Array;
  collisionTotal: Uint8Array;
  subductionTotal: Uint8Array;
  fractureTotal: Uint8Array;
  volcanismTotal: Uint8Array;
  upliftRecentFraction: Uint8Array;
  collisionRecentFraction: Uint8Array;
  subductionRecentFraction: Uint8Array;
  lastActiveEra: Uint8Array;
  lastCollisionEra: Uint8Array;
  lastSubductionEra: Uint8Array;
}>;

/**
 * Accumulates aligned era fields into totals, activity counts, and plate-membership history.
 * The rollup is deterministic and preserves the original era sequence for downstream interpretation.
 */
export function buildTectonicHistoryRollups(params: {
  eras: readonly TectonicEraInput[];
  plateIdByEra: readonly ArrayLike<number>[];
  activityThreshold: number;
}): TectonicHistoryRollup {
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
      upliftSum = quantizeU8(upliftSum + (e.upliftPotential[i] ?? 0));
      collisionSum = quantizeU8(collisionSum + (e.collisionPotential[i] ?? 0));
      subductionSum = quantizeU8(subductionSum + (e.subductionPotential[i] ?? 0));
      fracSum = quantizeU8(fracSum + (e.fracture[i] ?? 0));
      volcSum = quantizeU8(volcSum + (e.volcanism[i] ?? 0));
    }
    upliftTotal[i] = upliftSum;
    collisionTotal[i] = collisionSum;
    subductionTotal[i] = subductionSum;
    fractureTotal[i] = fracSum;
    volcanismTotal[i] = volcSum;

    const recent = eras[eraCount - 1]!.upliftPotential[i] ?? 0;
    upliftRecentFraction[i] = upliftSum > 0 ? quantizeU8((recent / upliftSum) * 255) : 0;

    const recentCollision = eras[eraCount - 1]!.collisionPotential[i] ?? 0;
    collisionRecentFraction[i] =
      collisionSum > 0 ? quantizeU8((recentCollision / collisionSum) * 255) : 0;

    const recentSubduction = eras[eraCount - 1]!.subductionPotential[i] ?? 0;
    subductionRecentFraction[i] =
      subductionSum > 0 ? quantizeU8((recentSubduction / subductionSum) * 255) : 0;
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
      boundaryType: Uint8Array.from(era.boundaryType),
      upliftPotential: Uint8Array.from(era.upliftPotential),
      collisionPotential: Uint8Array.from(era.collisionPotential),
      subductionPotential: Uint8Array.from(era.subductionPotential),
      riftPotential: Uint8Array.from(era.riftPotential),
      shearStress: Uint8Array.from(era.shearStress),
      volcanism: Uint8Array.from(era.volcanism),
      fracture: Uint8Array.from(era.fracture),
    })),
    plateIdByEra: params.plateIdByEra.map((membership) => Int16Array.from(membership)),
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
