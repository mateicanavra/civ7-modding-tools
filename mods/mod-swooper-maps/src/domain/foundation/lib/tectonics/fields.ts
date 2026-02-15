import { wrapDeltaPeriodic } from "@swooper/mapgen-core/lib/math";

import { BOUNDARY_TYPE } from "../../constants.js";
import type { FoundationTectonicEraFieldsInternal, TectonicEventRecord } from "./internal-contract.js";

import { EVENT_TYPE } from "./constants.js";
import {
  chooseDriftNeighbor,
  clampByte,
  clampInt8,
  computeMeanEdgeLen,
  type NeighborhoodMesh,
} from "./shared.js";

const EMISSION_RADIUS_MUL = {
  uplift: 2.0,
  rift: 1.25,
  shear: 1.0,
  volcanism: 0.875,
  fracture: 1.25,
} as const;

const EMISSION_DECAY_MUL = {
  uplift: 0.3 / 0.55,
  rift: 1.0,
  shear: 0.7 / 0.55,
  volcanism: 0.85 / 0.55,
  fracture: 0.65 / 0.55,
} as const;

type EmissionParams = Readonly<{
  radius: Readonly<{
    uplift: number;
    rift: number;
    shear: number;
    volcanism: number;
    fracture: number;
  }>;
  decay: Readonly<{
    uplift: number;
    rift: number;
    shear: number;
    volcanism: number;
    fracture: number;
  }>;
}>;

export function deriveEmissionParams(config: {
  beltInfluenceDistance: number;
  beltDecay: number;
}): EmissionParams {
  const baseRadius = Math.max(1, Math.min(64, Math.round(config.beltInfluenceDistance ?? 0))) | 0;
  const baseDecay = Math.max(0.01, Number.isFinite(config.beltDecay) ? config.beltDecay : 0);

  return {
    radius: {
      uplift: Math.max(1, Math.round(baseRadius * EMISSION_RADIUS_MUL.uplift)),
      rift: Math.max(1, Math.round(baseRadius * EMISSION_RADIUS_MUL.rift)),
      shear: Math.max(1, Math.round(baseRadius * EMISSION_RADIUS_MUL.shear)),
      volcanism: Math.max(1, Math.round(baseRadius * EMISSION_RADIUS_MUL.volcanism)),
      fracture: Math.max(1, Math.round(baseRadius * EMISSION_RADIUS_MUL.fracture)),
    },
    decay: {
      uplift: baseDecay * EMISSION_DECAY_MUL.uplift,
      rift: baseDecay * EMISSION_DECAY_MUL.rift,
      shear: baseDecay * EMISSION_DECAY_MUL.shear,
      volcanism: baseDecay * EMISSION_DECAY_MUL.volcanism,
      fracture: baseDecay * EMISSION_DECAY_MUL.fracture,
    },
  };
}

function driftSeedCells(
  seeds: readonly number[],
  driftU: number,
  driftV: number,
  steps: number,
  mesh: NeighborhoodMesh
): Int32Array {
  if (steps <= 0 || (driftU === 0 && driftV === 0)) {
    return Int32Array.from(seeds);
  }

  const out = new Int32Array(seeds.length);
  for (let i = 0; i < seeds.length; i++) {
    let cell = seeds[i] ?? -1;
    if (cell < 0 || cell >= mesh.siteX.length) {
      out[i] = -1;
      continue;
    }
    for (let step = 0; step < steps; step++) {
      cell = chooseDriftNeighbor({ cellId: cell, driftU, driftV, mesh });
    }
    out[i] = cell;
  }
  return out;
}

export function buildEraFields(params: {
  mesh: NeighborhoodMesh;
  events: ReadonlyArray<TectonicEventRecord>;
  weight: number;
  eraGain: number;
  driftSteps: number;
  emission: EmissionParams;
}): FoundationTectonicEraFieldsInternal {
  const cellCount = params.mesh.cellCount | 0;
  const R = params.emission.radius;
  const D = params.emission.decay;

  const upliftPotential = new Uint8Array(cellCount);
  const collisionPotential = new Uint8Array(cellCount);
  const subductionPotential = new Uint8Array(cellCount);
  const riftPotential = new Uint8Array(cellCount);
  const shearStress = new Uint8Array(cellCount);
  const volcanism = new Uint8Array(cellCount);
  const fracture = new Uint8Array(cellCount);

  const upliftScore = new Float32Array(cellCount);
  const collisionScore = new Float32Array(cellCount);
  const subductionScore = new Float32Array(cellCount);
  const riftScore = new Float32Array(cellCount);
  const shearScore = new Float32Array(cellCount);
  const volcanismScore = new Float32Array(cellCount);
  const fractureScore = new Float32Array(cellCount);
  upliftScore.fill(-1);
  collisionScore.fill(-1);
  subductionScore.fill(-1);
  riftScore.fill(-1);
  shearScore.fill(-1);
  volcanismScore.fill(-1);
  fractureScore.fill(-1);

  const upliftIntensity = new Uint8Array(cellCount);
  const collisionIntensity = new Uint8Array(cellCount);
  const subductionIntensity = new Uint8Array(cellCount);
  const riftIntensity = new Uint8Array(cellCount);
  const shearIntensity = new Uint8Array(cellCount);
  const volcanismIntensity = new Uint8Array(cellCount);
  const fractureIntensity = new Uint8Array(cellCount);

  const upliftEventType = new Uint8Array(cellCount);
  const collisionEventType = new Uint8Array(cellCount);
  const subductionEventType = new Uint8Array(cellCount);
  const riftEventType = new Uint8Array(cellCount);
  const shearEventType = new Uint8Array(cellCount);
  const volcanismEventType = new Uint8Array(cellCount);
  const fractureEventType = new Uint8Array(cellCount);
  upliftEventType.fill(255);
  collisionEventType.fill(255);
  subductionEventType.fill(255);
  riftEventType.fill(255);
  shearEventType.fill(255);
  volcanismEventType.fill(255);
  fractureEventType.fill(255);

  const upliftEventIndex = new Int32Array(cellCount);
  const collisionEventIndex = new Int32Array(cellCount);
  const subductionEventIndex = new Int32Array(cellCount);
  const riftEventIndex = new Int32Array(cellCount);
  const shearEventIndex = new Int32Array(cellCount);
  const volcanismEventIndex = new Int32Array(cellCount);
  const fractureEventIndex = new Int32Array(cellCount);
  upliftEventIndex.fill(1 << 30);
  collisionEventIndex.fill(1 << 30);
  subductionEventIndex.fill(1 << 30);
  riftEventIndex.fill(1 << 30);
  shearEventIndex.fill(1 << 30);
  volcanismEventIndex.fill(1 << 30);
  fractureEventIndex.fill(1 << 30);

  const upliftPolarity = new Int8Array(cellCount);
  const riftOriginPlate = new Int16Array(cellCount);
  const volcanismOriginPlate = new Int16Array(cellCount);
  riftOriginPlate.fill(-1);
  volcanismOriginPlate.fill(-1);

  const visitMark = new Int32Array(cellCount);
  const distance = new Float32Array(cellCount);

  // Normalize edge lengths so authored radii remain approximately "in steps" while decay becomes continuous.
  const meanEdgeLen = computeMeanEdgeLen(params.mesh);

  type HeapEntry = { id: number; dist: number };

  const heapIds: number[] = [];
  const heapDists: number[] = [];

  const heapPush = (id: number, dist: number): void => {
    heapIds.push(id);
    heapDists.push(dist);
    let i = heapIds.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      const pd = heapDists[p] ?? 0;
      if (pd <= dist) break;
      heapIds[i] = heapIds[p]!;
      heapDists[i] = pd;
      heapIds[p] = id;
      heapDists[p] = dist;
      i = p;
    }
  };

  const heapPop = (): HeapEntry | null => {
    const n = heapIds.length;
    if (n <= 0) return null;
    const id = heapIds[0]!;
    const dist = heapDists[0]!;
    const lastId = heapIds.pop()!;
    const lastDist = heapDists.pop()!;
    if (n > 1) {
      heapIds[0] = lastId;
      heapDists[0] = lastDist;
      let i = 0;
      while (true) {
        const l = i * 2 + 1;
        const r = l + 1;
        if (l >= heapIds.length) break;
        let m = l;
        if (r < heapIds.length && (heapDists[r] ?? 0) < (heapDists[l] ?? 0)) m = r;
        const md = heapDists[m] ?? 0;
        if ((heapDists[i] ?? 0) <= md) break;
        const tmpId = heapIds[i]!;
        const tmpD = heapDists[i]!;
        heapIds[i] = heapIds[m]!;
        heapDists[i] = md;
        heapIds[m] = tmpId;
        heapDists[m] = tmpD;
        i = m;
      }
    }
    return { id, dist };
  };

  let visitToken = 1;

  const updateChannel = (params: {
    cellId: number;
    score: number;
    intensity: number;
    eventType: number;
    eventIndex: number;
    scores: Float32Array;
    values: Uint8Array;
    intensities: Uint8Array;
    eventTypes: Uint8Array;
    eventIndices: Int32Array;
    polarity?: Int8Array;
    originPlate?: Int16Array;
    polarityValue?: number;
    originPlateValue?: number;
  }) => {
    const { cellId } = params;
    const score = params.score;
    if (score <= 0) return;

    const currentScore = params.scores[cellId] ?? -1;
    const currentIntensity = params.intensities[cellId] ?? 0;
    const currentEventType = params.eventTypes[cellId] ?? 255;
    const currentEventIndex = params.eventIndices[cellId] ?? (1 << 30);

    const eventType = params.eventType | 0;
    const eventIndex = params.eventIndex | 0;
    const intensity = params.intensity | 0;

    const replace =
      score > currentScore ||
      (score === currentScore &&
        (intensity > currentIntensity ||
          (intensity === currentIntensity &&
            (eventType < currentEventType ||
              (eventType === currentEventType && eventIndex < currentEventIndex)))));

    if (!replace) return;

    params.scores[cellId] = score;
    params.values[cellId] = clampByte(score);
    params.intensities[cellId] = intensity;
    params.eventTypes[cellId] = eventType;
    params.eventIndices[cellId] = eventIndex;

    if (params.polarity && params.polarityValue != null) {
      params.polarity[cellId] = params.polarityValue | 0;
    }
    if (params.originPlate && params.originPlateValue != null) {
      params.originPlate[cellId] = params.originPlateValue | 0;
    }
  };

  const weight = Math.max(0, params.weight);
  const eraGain = Number.isFinite(params.eraGain) ? Math.max(0, params.eraGain) : 1;

  for (let e = 0; e < params.events.length; e++) {
    const event = params.events[e]!;
    const eventType = event.eventType | 0;
    const isConvergent =
      eventType === EVENT_TYPE.convergenceSubduction || eventType === EVENT_TYPE.convergenceCollision;

    const upliftGain = isConvergent ? eraGain : 1;
    const volcanismGain = eventType === EVENT_TYPE.convergenceSubduction ? eraGain : 1;

    const intensityUplift = clampByte((event.intensityUplift ?? 0) * weight * upliftGain);
    const intensityRift = clampByte((event.intensityRift ?? 0) * weight);
    const intensityShear = clampByte((event.intensityShear ?? 0) * weight);
    const intensityVolcanism = clampByte((event.intensityVolcanism ?? 0) * weight * volcanismGain);
    const intensityFracture = clampByte((event.intensityFracture ?? 0) * weight);

    const maxRadius = Math.max(
      intensityUplift > 0 ? R.uplift : 0,
      intensityRift > 0 ? R.rift : 0,
      intensityShear > 0 ? R.shear : 0,
      intensityVolcanism > 0 ? R.volcanism : 0,
      intensityFracture > 0 ? R.fracture : 0
    );
    if (maxRadius <= 0) continue;

    if (visitToken >= 2_000_000_000) {
      visitMark.fill(0);
      visitToken = 1;
    }
    const token = ++visitToken;

    const driftedSeeds = driftSeedCells(event.seedCells, event.driftU, event.driftV, params.driftSteps, params.mesh);

    heapIds.length = 0;
    heapDists.length = 0;

    for (let i = 0; i < driftedSeeds.length; i++) {
      const cellId = driftedSeeds[i] ?? -1;
      if (cellId < 0 || cellId >= cellCount) continue;
      if (visitMark[cellId] === token) continue;
      visitMark[cellId] = token;
      distance[cellId] = 0;
      heapPush(cellId, 0);
    }

    while (true) {
      const entry = heapPop();
      if (!entry) break;

      const cellId = entry.id | 0;
      const d = entry.dist;
      if (visitMark[cellId] !== token) continue;

      const best = visitMark[cellId] === token ? (distance[cellId] ?? Infinity) : Infinity;
      if (!(d <= best + 1e-6)) continue;
      if (d > maxRadius) continue;

      if (intensityUplift > 0 && d <= R.uplift) {
        const score = intensityUplift * Math.exp(-d * D.uplift);
        updateChannel({
          cellId,
          score,
          intensity: intensityUplift,
          eventType: event.eventType,
          eventIndex: e,
          scores: upliftScore,
          values: upliftPotential,
          intensities: upliftIntensity,
          eventTypes: upliftEventType,
          eventIndices: upliftEventIndex,
          polarity: upliftPolarity,
          polarityValue: event.polarity,
        });

        // Split convergent uplift into collision vs. subduction components. This is the
        // core "collision history" signal downstream mountain-kind logic needs.
        if (eventType === EVENT_TYPE.convergenceCollision) {
          updateChannel({
            cellId,
            score,
            intensity: intensityUplift,
            eventType: event.eventType,
            eventIndex: e,
            scores: collisionScore,
            values: collisionPotential,
            intensities: collisionIntensity,
            eventTypes: collisionEventType,
            eventIndices: collisionEventIndex,
          });
        } else if (eventType === EVENT_TYPE.convergenceSubduction) {
          updateChannel({
            cellId,
            score,
            intensity: intensityUplift,
            eventType: event.eventType,
            eventIndex: e,
            scores: subductionScore,
            values: subductionPotential,
            intensities: subductionIntensity,
            eventTypes: subductionEventType,
            eventIndices: subductionEventIndex,
          });
        }
      }

      if (intensityRift > 0 && d <= R.rift) {
        const score = intensityRift * Math.exp(-d * D.rift);
        updateChannel({
          cellId,
          score,
          intensity: intensityRift,
          eventType: event.eventType,
          eventIndex: e,
          scores: riftScore,
          values: riftPotential,
          intensities: riftIntensity,
          eventTypes: riftEventType,
          eventIndices: riftEventIndex,
          originPlate: riftOriginPlate,
          originPlateValue: event.originPlateId,
        });
      }

      if (intensityShear > 0 && d <= R.shear) {
        const score = intensityShear * Math.exp(-d * D.shear);
        updateChannel({
          cellId,
          score,
          intensity: intensityShear,
          eventType: event.eventType,
          eventIndex: e,
          scores: shearScore,
          values: shearStress,
          intensities: shearIntensity,
          eventTypes: shearEventType,
          eventIndices: shearEventIndex,
        });
      }

      if (intensityVolcanism > 0 && d <= R.volcanism) {
        const score = intensityVolcanism * Math.exp(-d * D.volcanism);
        updateChannel({
          cellId,
          score,
          intensity: intensityVolcanism,
          eventType: event.eventType,
          eventIndex: e,
          scores: volcanismScore,
          values: volcanism,
          intensities: volcanismIntensity,
          eventTypes: volcanismEventType,
          eventIndices: volcanismEventIndex,
          originPlate: volcanismOriginPlate,
          originPlateValue: event.originPlateId,
        });
      }

      if (intensityFracture > 0 && d <= R.fracture) {
        const score = intensityFracture * Math.exp(-d * D.fracture);
        updateChannel({
          cellId,
          score,
          intensity: intensityFracture,
          eventType: event.eventType,
          eventIndex: e,
          scores: fractureScore,
          values: fracture,
          intensities: fractureIntensity,
          eventTypes: fractureEventType,
          eventIndices: fractureEventIndex,
        });
      }

      if (d >= maxRadius) continue;
      const ax = params.mesh.siteX[cellId] ?? 0;
      const ay = params.mesh.siteY[cellId] ?? 0;
      const start = params.mesh.neighborsOffsets[cellId] | 0;
      const end = params.mesh.neighborsOffsets[cellId + 1] | 0;

      for (let cursor = start; cursor < end; cursor++) {
        const n = params.mesh.neighbors[cursor] | 0;
        if (n < 0 || n >= cellCount) continue;

        const bx = params.mesh.siteX[n] ?? 0;
        const by = params.mesh.siteY[n] ?? 0;
        const dx = wrapDeltaPeriodic(bx - ax, params.mesh.wrapWidth);
        const dy = by - ay;
        const edgeLen = Math.sqrt(dx * dx + dy * dy);
        if (!Number.isFinite(edgeLen) || edgeLen <= 1e-9) continue;

        const nd = d + edgeLen / meanEdgeLen;
        if (nd > maxRadius) continue;

        const prev = visitMark[n] === token ? (distance[n] ?? Infinity) : Infinity;
        if (nd + 1e-6 < prev) {
          visitMark[n] = token;
          distance[n] = nd;
          heapPush(n, nd);
        }
      }
    }
  }

  const boundaryType = new Uint8Array(cellCount);
  const boundaryPolarity = new Int8Array(cellCount);
  const boundaryIntensity = new Uint8Array(cellCount);
  const boundaryDriftU = new Int8Array(cellCount);
  const boundaryDriftV = new Int8Array(cellCount);
  for (let i = 0; i < cellCount; i++) {
    const uScore = upliftScore[i] ?? -1;
    const rScore = riftScore[i] ?? -1;
    const sScore = shearScore[i] ?? -1;

    const uVal = upliftPotential[i] ?? 0;
    const rVal = riftPotential[i] ?? 0;
    const sVal = shearStress[i] ?? 0;
    const vVal = volcanism[i] ?? 0;
    const fVal = fracture[i] ?? 0;

    const intensity = Math.max(uVal, rVal, sVal, vVal, fVal);
    boundaryIntensity[i] = intensity;

    if (uScore <= 0 && rScore <= 0 && sScore <= 0) {
      boundaryType[i] = BOUNDARY_TYPE.none;
      boundaryPolarity[i] = 0;
      continue;
    }

    let selected = "uplift" as "uplift" | "rift" | "shear";
    let bestScore = uScore;
    let bestVal = uVal;

    if (rScore > bestScore || (rScore === bestScore && rVal > bestVal)) {
      selected = "rift";
      bestScore = rScore;
      bestVal = rVal;
    }

    if (sScore > bestScore || (sScore === bestScore && sVal > bestVal)) {
      selected = "shear";
    }

    let eventIndex = -1;
    if (selected === "uplift") {
      boundaryType[i] = BOUNDARY_TYPE.convergent;
      boundaryPolarity[i] = upliftPolarity[i] ?? 0;
      eventIndex = upliftEventIndex[i] ?? -1;
    } else if (selected === "rift") {
      boundaryType[i] = BOUNDARY_TYPE.divergent;
      boundaryPolarity[i] = 0;
      eventIndex = riftEventIndex[i] ?? -1;
    } else {
      boundaryType[i] = BOUNDARY_TYPE.transform;
      boundaryPolarity[i] = 0;
      eventIndex = shearEventIndex[i] ?? -1;
    }

    if (eventIndex >= 0 && eventIndex < params.events.length) {
      const event = params.events[eventIndex]!;
      boundaryDriftU[i] = clampInt8(event.driftU ?? 0);
      boundaryDriftV[i] = clampInt8(event.driftV ?? 0);
    }
  }

  return {
    boundaryType,
    upliftPotential,
    collisionPotential,
    subductionPotential,
    riftPotential,
    shearStress,
    volcanism,
    fracture,
    boundaryPolarity,
    boundaryIntensity,
    boundaryDriftU,
    boundaryDriftV,
    riftOriginPlate,
    volcanismOriginPlate,
    volcanismEventType,
  } as const;
}
