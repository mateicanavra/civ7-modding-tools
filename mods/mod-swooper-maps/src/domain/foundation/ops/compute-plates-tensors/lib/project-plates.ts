import { forEachHexNeighborOddQ, projectOddqToHexSpace } from "@swooper/mapgen-core/lib/grid";
import { wrapAbsDeltaPeriodic } from "@swooper/mapgen-core/lib/math";

import type { FoundationMesh } from "../../compute-mesh/contract.js";
import type { FoundationCrust } from "../../compute-crust/contract.js";
import type { FoundationPlateGraph } from "../../compute-plate-graph/contract.js";
import type { FoundationPlateMotion } from "../../compute-plate-motion/contract.js";
import { clampByte, clampInt8 } from "../../../lib/tectonics/shared.js";
import type {
  FoundationTectonicHistory,
  FoundationTectonicProvenance,
  FoundationTectonics,
} from "../../../lib/tectonics/schemas.js";
import { BOUNDARY_TYPE } from "../../../constants.js";

function hexDistanceSq(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  wrapWidth: number
): number {
  const dx = wrapAbsDeltaPeriodic(ax - bx, wrapWidth);
  const dy = ay - by;
  return dx * dx + dy * dy;
}

function computeHexWrappedDistanceField(
  isSeed: Uint8Array,
  width: number,
  height: number,
  maxDistance: number
): { distance: Uint8Array; nearestSeed: Int32Array } {
  const size = width * height;
  const distance = new Uint8Array(size);
  distance.fill(255);

  const nearestSeed = new Int32Array(size);
  nearestSeed.fill(-1);

  const queue: number[] = [];
  for (let i = 0; i < size; i++) {
    if (isSeed[i]) {
      distance[i] = 0;
      nearestSeed[i] = i;
      queue.push(i);
    }
  }

  let head = 0;
  while (head < queue.length) {
    const i = queue[head++]!;
    const d = distance[i]!;
    if (d >= maxDistance) continue;

    const x = i % width;
    const y = Math.floor(i / width);
    forEachHexNeighborOddQ(x, y, width, height, (nx, ny) => {
      const ni = ny * width + nx;
      if (distance[ni]! > d + 1) {
        distance[ni] = (d + 1) as number;
        nearestSeed[ni] = nearestSeed[i]!;
        queue.push(ni);
      }
    });
  }

  return { distance, nearestSeed } as const;
}

export function projectPlatesFromModel(input: {
  width: number;
  height: number;
  mesh: FoundationMesh;
  crust: FoundationCrust;
  plateGraph: FoundationPlateGraph;
  plateMotion: FoundationPlateMotion;
  tectonics: FoundationTectonics;
  tectonicHistory: FoundationTectonicHistory;
  tectonicProvenance?: FoundationTectonicProvenance | null;
  boundaryInfluenceDistance: number;
  boundaryDecay: number;
  movementScale: number;
  rotationScale: number;
}): {
  tileToCellIndex: Int32Array;
  crustTiles: {
    type: Uint8Array;
    maturity: Float32Array;
    thickness: Float32Array;
    damage: Uint8Array;
    age: Uint8Array;
    buoyancy: Float32Array;
    baseElevation: Float32Array;
    strength: Float32Array;
  };
  plates: {
    id: Int16Array;
    boundaryCloseness: Uint8Array;
    boundaryType: Uint8Array;
    tectonicStress: Uint8Array;
    upliftPotential: Uint8Array;
    riftPotential: Uint8Array;
    shieldStability: Uint8Array;
    volcanism: Uint8Array;
    movementU: Int8Array;
    movementV: Int8Array;
    rotation: Int8Array;
  };
  tectonicHistoryTiles: {
    version: number;
    eraCount: number;
    perEra: {
      boundaryType: Uint8Array;
      convergentMask: Uint8Array;
      divergentMask: Uint8Array;
      transformMask: Uint8Array;
      upliftPotential: Uint8Array;
      collisionPotential: Uint8Array;
      subductionPotential: Uint8Array;
      riftPotential: Uint8Array;
      shearStress: Uint8Array;
      volcanism: Uint8Array;
      fracture: Uint8Array;
    }[];
    rollups: {
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
      movementU: Int8Array;
      movementV: Int8Array;
    };
  };
  tectonicProvenanceTiles: {
    version: number;
    originEra: Uint8Array;
    originPlateId: Int16Array;
    driftDistance: Uint8Array;
    lastBoundaryEra: Uint8Array;
    lastBoundaryType: Uint8Array;
  };
} {
  const width = input.width | 0;
  const height = input.height | 0;
  const size = Math.max(0, width * height);
  const mesh = input.mesh;
  const crust = input.crust;
  const plateGraph = input.plateGraph;
  const tectonics = input.tectonics;
  const tectonicHistory = input.tectonicHistory;
  const tectonicProvenance = input.tectonicProvenance ?? null;

  const cellCount = mesh.cellCount | 0;
  const wrapWidth = mesh.wrapWidth;
  const meshHexX = mesh.siteX;
  const meshHexY = mesh.siteY;

  const plateMovementU = new Int8Array(plateGraph.plates.length);
  const plateMovementV = new Int8Array(plateGraph.plates.length);
  const plateRotation = new Int8Array(plateGraph.plates.length);
  for (let p = 0; p < plateGraph.plates.length; p++) {
    plateMovementU[p] = clampInt8((input.plateMotion.plateVelocityX[p] ?? 0) * input.movementScale);
    plateMovementV[p] = clampInt8((input.plateMotion.plateVelocityY[p] ?? 0) * input.movementScale);
    plateRotation[p] = clampInt8((input.plateMotion.plateOmega[p] ?? 0) * input.rotationScale);
  }

  const plateId = new Int16Array(size);
  const boundaryCloseness = new Uint8Array(size);
  const boundaryType = new Uint8Array(size);
  const tectonicStress = new Uint8Array(size);
  const upliftPotential = new Uint8Array(size);
  const riftPotential = new Uint8Array(size);
  const shieldStability = new Uint8Array(size);
  const volcanism = new Uint8Array(size);
  const movementU = new Int8Array(size);
  const movementV = new Int8Array(size);
  const rotation = new Int8Array(size);

  const tileToCellIndex = new Int32Array(size);

  const historyEraCount = tectonicHistory.eraCount | 0;
  const historyPerEra: {
    boundaryType: Uint8Array;
    convergentMask: Uint8Array;
    divergentMask: Uint8Array;
    transformMask: Uint8Array;
    upliftPotential: Uint8Array;
    collisionPotential: Uint8Array;
    subductionPotential: Uint8Array;
    riftPotential: Uint8Array;
    shearStress: Uint8Array;
    volcanism: Uint8Array;
    fracture: Uint8Array;
  }[] = [];
  for (let e = 0; e < historyEraCount; e++) {
    historyPerEra.push({
      boundaryType: new Uint8Array(size),
      convergentMask: new Uint8Array(size),
      divergentMask: new Uint8Array(size),
      transformMask: new Uint8Array(size),
      upliftPotential: new Uint8Array(size),
      collisionPotential: new Uint8Array(size),
      subductionPotential: new Uint8Array(size),
      riftPotential: new Uint8Array(size),
      shearStress: new Uint8Array(size),
      volcanism: new Uint8Array(size),
      fracture: new Uint8Array(size),
    });
  }
  const historyRollups = {
    upliftTotal: new Uint8Array(size),
    collisionTotal: new Uint8Array(size),
    subductionTotal: new Uint8Array(size),
    fractureTotal: new Uint8Array(size),
    volcanismTotal: new Uint8Array(size),
    upliftRecentFraction: new Uint8Array(size),
    collisionRecentFraction: new Uint8Array(size),
    subductionRecentFraction: new Uint8Array(size),
    lastActiveEra: new Uint8Array(size),
    lastCollisionEra: new Uint8Array(size),
    lastSubductionEra: new Uint8Array(size),
    movementU,
    movementV,
  } as const;

  const provenanceTiles = {
    originEra: new Uint8Array(size),
    originPlateId: new Int16Array(size),
    driftDistance: new Uint8Array(size),
    lastBoundaryEra: new Uint8Array(size),
    lastBoundaryType: new Uint8Array(size),
  } as const;

  const provenanceScalars = tectonicProvenance?.provenance ?? null;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const tileHex = projectOddqToHexSpace(x, y);

      let bestCell = 0;
      let bestDist = Infinity;
      for (let c = 0; c < cellCount; c++) {
        const dist = hexDistanceSq(tileHex.x, tileHex.y, meshHexX[c] ?? 0, meshHexY[c] ?? 0, wrapWidth);
        if (dist < bestDist) {
          bestDist = dist;
          bestCell = c;
        }
      }

      tileToCellIndex[i] = bestCell;
      const plate = plateGraph.cellToPlate[bestCell] ?? 0;
      plateId[i] = plate;

      const plateIndex = plate >= 0 && plate < plateGraph.plates.length ? plate : 0;
      movementU[i] = plateMovementU[plateIndex] ?? 0;
      movementV[i] = plateMovementV[plateIndex] ?? 0;
      rotation[i] = plateRotation[plateIndex] ?? 0;
    }
  }

  const crustType = new Uint8Array(size);
  const crustMaturity = new Float32Array(size);
  const crustThickness = new Float32Array(size);
  const crustDamage = new Uint8Array(size);
  const crustAge = new Uint8Array(size);
  const crustBuoyancy = new Float32Array(size);
  const crustBaseElevation = new Float32Array(size);
  const crustStrength = new Float32Array(size);
  for (let i = 0; i < size; i++) {
    const cellId = tileToCellIndex[i] ?? 0;
    crustType[i] = crust.type[cellId] ?? 0;
    crustMaturity[i] = crust.maturity[cellId] ?? 0;
    crustThickness[i] = crust.thickness[cellId] ?? 0;
    crustDamage[i] = crust.damage[cellId] ?? 0;
    crustAge[i] = crust.age[cellId] ?? 0;
    crustBuoyancy[i] = crust.buoyancy[cellId] ?? 0;
    crustBaseElevation[i] = crust.baseElevation[cellId] ?? 0;
    crustStrength[i] = crust.strength[cellId] ?? 0;

    for (let e = 0; e < historyEraCount; e++) {
      const era = tectonicHistory.eras[e];
      if (!era) continue;
      const perEra = historyPerEra[e];
      const boundary = era.boundaryType[cellId] ?? 0;
      perEra.boundaryType[i] = boundary;
      perEra.convergentMask[i] = boundary === BOUNDARY_TYPE.convergent ? 1 : 0;
      perEra.divergentMask[i] = boundary === BOUNDARY_TYPE.divergent ? 1 : 0;
      perEra.transformMask[i] = boundary === BOUNDARY_TYPE.transform ? 1 : 0;
      perEra.upliftPotential[i] = era.upliftPotential[cellId] ?? 0;
      perEra.collisionPotential[i] = era.collisionPotential[cellId] ?? 0;
      perEra.subductionPotential[i] = era.subductionPotential[cellId] ?? 0;
      perEra.riftPotential[i] = era.riftPotential[cellId] ?? 0;
      perEra.shearStress[i] = era.shearStress[cellId] ?? 0;
      perEra.volcanism[i] = era.volcanism[cellId] ?? 0;
      perEra.fracture[i] = era.fracture[cellId] ?? 0;
    }

    historyRollups.upliftTotal[i] = tectonicHistory.upliftTotal[cellId] ?? 0;
    historyRollups.collisionTotal[i] = tectonicHistory.collisionTotal[cellId] ?? 0;
    historyRollups.subductionTotal[i] = tectonicHistory.subductionTotal[cellId] ?? 0;
    historyRollups.fractureTotal[i] = tectonicHistory.fractureTotal[cellId] ?? 0;
    historyRollups.volcanismTotal[i] = tectonicHistory.volcanismTotal[cellId] ?? 0;
    historyRollups.upliftRecentFraction[i] = tectonicHistory.upliftRecentFraction[cellId] ?? 0;
    historyRollups.collisionRecentFraction[i] = tectonicHistory.collisionRecentFraction[cellId] ?? 0;
    historyRollups.subductionRecentFraction[i] = tectonicHistory.subductionRecentFraction[cellId] ?? 0;
    historyRollups.lastActiveEra[i] = tectonicHistory.lastActiveEra[cellId] ?? 255;
    historyRollups.lastCollisionEra[i] = tectonicHistory.lastCollisionEra[cellId] ?? 255;
    historyRollups.lastSubductionEra[i] = tectonicHistory.lastSubductionEra[cellId] ?? 255;

    if (provenanceScalars) {
      provenanceTiles.originEra[i] = provenanceScalars.originEra[cellId] ?? 0;
      provenanceTiles.originPlateId[i] =
        provenanceScalars.originPlateId[cellId] ?? plateGraph.cellToPlate[cellId] ?? -1;
      provenanceTiles.lastBoundaryEra[i] = provenanceScalars.lastBoundaryEra[cellId] ?? 255;
      provenanceTiles.lastBoundaryType[i] = provenanceScalars.lastBoundaryType[cellId] ?? 255;
      provenanceTiles.driftDistance[i] = 0;
    } else {
      provenanceTiles.originEra[i] = 0;
      provenanceTiles.originPlateId[i] = plateGraph.cellToPlate[cellId] ?? -1;
      provenanceTiles.lastBoundaryEra[i] = 255;
      provenanceTiles.lastBoundaryType[i] = 255;
      provenanceTiles.driftDistance[i] = 0;
    }
  }

  const isBoundarySeed = new Uint8Array(size);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const myPlate = plateId[i]!;
      let boundary = false;
      forEachHexNeighborOddQ(x, y, width, height, (nx, ny) => {
        const ni = ny * width + nx;
        if (plateId[ni] !== myPlate) boundary = true;
      });
      if (boundary) isBoundarySeed[i] = 1;
    }
  }

  const maxDistance = Math.max(1, input.boundaryInfluenceDistance | 0);
  const decay = input.boundaryDecay;
  const { distance: distanceField, nearestSeed } = computeHexWrappedDistanceField(
    isBoundarySeed,
    width,
    height,
    maxDistance + 1
  );
  void nearestSeed;

  for (let i = 0; i < size; i++) {
    const cellId = tileToCellIndex[i] ?? 0;
    const baseBoundaryType = tectonics.boundaryType[cellId] ?? BOUNDARY_TYPE.none;
    // `upliftPotential` in the newest-era field is intentionally scaled by era weights,
    // which compresses its dynamic range. For ridge/mountain planning, we want a stable
    // 0..255 uplift signal that represents "total orogeny opportunity" rather than
    // only the newest era.
    const baseUplift = tectonics.cumulativeUplift[cellId] ?? tectonics.upliftPotential[cellId] ?? 0;
    const baseRift = tectonics.riftPotential[cellId] ?? 0;
    const baseShear = tectonics.shearStress[cellId] ?? 0;
    const baseVolcanism = tectonics.volcanism[cellId] ?? 0;

    const dist = distanceField[i]!;
    const influence = dist >= maxDistance ? 0 : Math.exp(-dist * decay);
    boundaryCloseness[i] = clampByte(influence * 255);

    boundaryType[i] = clampByte(baseBoundaryType);
    upliftPotential[i] = clampByte(baseUplift);
    riftPotential[i] = clampByte(baseRift);
    const shearValue = clampByte(baseShear);
    volcanism[i] = clampByte(baseVolcanism);

    const stress = Math.max(upliftPotential[i]!, riftPotential[i]!, shearValue);
    tectonicStress[i] = clampByte(stress);
    shieldStability[i] = 255 - boundaryCloseness[i]!;
  }

  return {
    tileToCellIndex,
    crustTiles: {
      type: crustType,
      maturity: crustMaturity,
      thickness: crustThickness,
      damage: crustDamage,
      age: crustAge,
      buoyancy: crustBuoyancy,
      baseElevation: crustBaseElevation,
      strength: crustStrength,
    },
    plates: {
      id: plateId,
      boundaryCloseness,
      boundaryType,
      tectonicStress,
      upliftPotential,
      riftPotential,
      shieldStability,
      volcanism,
      movementU,
      movementV,
      rotation,
    },
    tectonicHistoryTiles: {
      version: 1,
      eraCount: historyEraCount,
      perEra: historyPerEra,
      rollups: historyRollups,
    },
    tectonicProvenanceTiles: {
      version: 1,
      originEra: provenanceTiles.originEra,
      originPlateId: provenanceTiles.originPlateId,
      driftDistance: provenanceTiles.driftDistance,
      lastBoundaryEra: provenanceTiles.lastBoundaryEra,
      lastBoundaryType: provenanceTiles.lastBoundaryType,
    },
  } as const;
}
