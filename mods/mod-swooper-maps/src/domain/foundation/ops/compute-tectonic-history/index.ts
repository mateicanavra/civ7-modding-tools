import { createOp } from "@swooper/mapgen-core/authoring";
import { wrapDeltaPeriodic } from "@swooper/mapgen-core/lib/math";

import { BOUNDARY_TYPE } from "../../constants.js";
import { requireCrust, requireMantleForcing, requireMesh, requirePlateGraph } from "../../lib/require.js";
import type { FoundationTectonicSegments } from "../compute-tectonic-segments/contract.js";
import ComputeTectonicHistoryContract from "./contract.js";

const EVENT_TYPE = {
  convergenceSubduction: 1,
  convergenceCollision: 2,
  divergenceRift: 3,
  transformShear: 4,
  intraplateHotspot: 5,
} as const;

// Belt-field influence is a runtime contract ("authored values must be honored"),
// but we preserve the old channel shape by scaling around the previous defaults.
const EMISSION_RADIUS_MUL = {
  uplift: 1.5,
  rift: 1.25,
  shear: 1.0,
  volcanism: 0.875,
  fracture: 1.25,
} as const;

const EMISSION_DECAY_MUL = {
  uplift: 0.45 / 0.55,
  rift: 1.0,
  shear: 0.7 / 0.55,
  volcanism: 0.85 / 0.55,
  fracture: 0.65 / 0.55,
} as const;

// Reset thresholds must be calibrated to the actually-emitted driver magnitudes.
// If these are too high relative to emitted fields, provenance never resets and the
// downstream crust truth degenerates (uniformly ancient, uniformly "continental").
// Note: these minimums must remain low. Emitted potentials are often in the ~0-30 range
// after per-era weighting + diffusion, so high floors can fully disable resets.
const RIFT_RESET_THRESHOLD_MIN = 1;
const ARC_RESET_THRESHOLD_MIN = 1;
const HOTSPOT_RESET_THRESHOLD_MIN = 1;

const RIFT_RESET_THRESHOLD_FRAC_OF_MAX = 0.6;
const ARC_RESET_THRESHOLD_FRAC_OF_MAX = 0.75;
const HOTSPOT_RESET_THRESHOLD_FRAC_OF_MAX = 0.8;
const ERA_COUNT_MIN = 5;
const ERA_COUNT_MAX = 8;
const ADVECTION_STEPS_PER_ERA = 6;

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

function clampByte(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value))) | 0;
}

function addClampedByte(a: number, b: number): number {
  return Math.max(0, Math.min(255, (a | 0) + (b | 0))) | 0;
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
}

function clampInt8(value: number): number {
  return Math.max(-127, Math.min(127, Math.round(value))) | 0;
}

function normalizeToInt8(x: number, y: number): { u: number; v: number } {
  const len = Math.sqrt(x * x + y * y);
  if (!Number.isFinite(len) || len <= 1e-9) return { u: 0, v: 0 };
  return { u: clampInt8((x / len) * 127), v: clampInt8((y / len) * 127) };
}

function chooseDriftNeighbor(params: {
  cellId: number;
  driftU: number;
  driftV: number;
  mesh: {
    wrapWidth: number;
    siteX: Float32Array;
    siteY: Float32Array;
    neighborsOffsets: Int32Array;
    neighbors: Int32Array;
  };
}): number {
  const { mesh } = params;
  const cellId = params.cellId | 0;
  const start = mesh.neighborsOffsets[cellId] | 0;
  const end = mesh.neighborsOffsets[cellId + 1] | 0;
  if (end <= start) return cellId;

  const ux = (params.driftU | 0) / 127;
  const uy = (params.driftV | 0) / 127;
  if (!ux && !uy) return cellId;

  const ax = mesh.siteX[cellId] ?? 0;
  const ay = mesh.siteY[cellId] ?? 0;

  let best = cellId;
  let bestDot = -Infinity;
  for (let cursor = start; cursor < end; cursor++) {
    const n = mesh.neighbors[cursor] | 0;
    const bx = mesh.siteX[n] ?? 0;
    const by = mesh.siteY[n] ?? 0;
    const dx = wrapDeltaPeriodic(bx - ax, mesh.wrapWidth);
    const dy = by - ay;
    const dot = dx * ux + dy * uy;
    if (dot > bestDot) {
      bestDot = dot;
      best = n;
    }
  }
  return best;
}

function deriveResetThreshold(maxValue: number, fracOfMax: number, minThreshold: number): number {
  const maxByte = Math.max(0, Math.min(255, maxValue | 0)) | 0;
  const frac = Number.isFinite(fracOfMax) ? Math.max(0, Math.min(1, fracOfMax)) : 0;
  const derived = Math.round(maxByte * frac) | 0;
  return Math.max(minThreshold | 0, Math.min(255, derived)) | 0;
}

function deriveEmissionParams(config: { beltInfluenceDistance: number; beltDecay: number }): EmissionParams {
  const baseRadius = Math.max(1, Math.min(64, Math.round(config.beltInfluenceDistance ?? 0))) | 0;
  const baseDecay = Math.max(0.01, Number.isFinite(config.beltDecay) ? config.beltDecay : 0) as number;

  const radius = {
    uplift: Math.max(1, Math.round(baseRadius * EMISSION_RADIUS_MUL.uplift)) | 0,
    rift: Math.max(1, Math.round(baseRadius * EMISSION_RADIUS_MUL.rift)) | 0,
    shear: Math.max(1, Math.round(baseRadius * EMISSION_RADIUS_MUL.shear)) | 0,
    volcanism: Math.max(1, Math.round(baseRadius * EMISSION_RADIUS_MUL.volcanism)) | 0,
    fracture: Math.max(1, Math.round(baseRadius * EMISSION_RADIUS_MUL.fracture)) | 0,
  };

  const decay = {
    uplift: Math.max(0.01, baseDecay * EMISSION_DECAY_MUL.uplift),
    rift: Math.max(0.01, baseDecay * EMISSION_DECAY_MUL.rift),
    shear: Math.max(0.01, baseDecay * EMISSION_DECAY_MUL.shear),
    volcanism: Math.max(0.01, baseDecay * EMISSION_DECAY_MUL.volcanism),
    fracture: Math.max(0.01, baseDecay * EMISSION_DECAY_MUL.fracture),
  };

  return { radius, decay };
}

type TectonicEvent = Readonly<{
  eventType: number;
  plateA: number;
  plateB: number;
  polarity: number;
  intensityUplift: number;
  intensityRift: number;
  intensityShear: number;
  intensityVolcanism: number;
  intensityFracture: number;
  driftU: number;
  driftV: number;
  seedCells: Int32Array;
  originPlateId: number;
}>;

type EraFields = Readonly<{
  boundaryType: Uint8Array;
  upliftPotential: Uint8Array;
  riftPotential: Uint8Array;
  shearStress: Uint8Array;
  volcanism: Uint8Array;
  fracture: Uint8Array;
  boundaryPolarity: Int8Array;
  boundaryIntensity: Uint8Array;
  boundaryDriftU: Int8Array;
  boundaryDriftV: Int8Array;
  riftOriginPlate: Int16Array;
  volcanismOriginPlate: Int16Array;
  volcanismEventType: Uint8Array;
}>;

function driftSeedCells(
  seeds: Int32Array,
  driftU: number,
  driftV: number,
  steps: number,
  mesh: {
    wrapWidth: number;
    siteX: Float32Array;
    siteY: Float32Array;
    neighborsOffsets: Int32Array;
    neighbors: Int32Array;
  }
): Int32Array {
  if (steps <= 0 || (!driftU && !driftV)) return seeds;
  const out = new Int32Array(seeds.length);
  for (let i = 0; i < seeds.length; i++) {
    let cell = seeds[i] ?? 0;
    for (let step = 0; step < steps; step++) {
      cell = chooseDriftNeighbor({ cellId: cell, driftU, driftV, mesh });
    }
    out[i] = cell;
  }
  return out;
}

function buildEraFields(params: {
  mesh: {
    cellCount: number;
    wrapWidth: number;
    siteX: Float32Array;
    siteY: Float32Array;
    neighborsOffsets: Int32Array;
    neighbors: Int32Array;
  };
  events: ReadonlyArray<TectonicEvent>;
  weight: number;
  driftSteps: number;
  emission: EmissionParams;
}): EraFields {
  const cellCount = params.mesh.cellCount | 0;
  const R = params.emission.radius;
  const D = params.emission.decay;

  const upliftPotential = new Uint8Array(cellCount);
  const riftPotential = new Uint8Array(cellCount);
  const shearStress = new Uint8Array(cellCount);
  const volcanism = new Uint8Array(cellCount);
  const fracture = new Uint8Array(cellCount);

  const upliftScore = new Float32Array(cellCount);
  const riftScore = new Float32Array(cellCount);
  const shearScore = new Float32Array(cellCount);
  const volcanismScore = new Float32Array(cellCount);
  const fractureScore = new Float32Array(cellCount);
  upliftScore.fill(-1);
  riftScore.fill(-1);
  shearScore.fill(-1);
  volcanismScore.fill(-1);
  fractureScore.fill(-1);

  const upliftIntensity = new Uint8Array(cellCount);
  const riftIntensity = new Uint8Array(cellCount);
  const shearIntensity = new Uint8Array(cellCount);
  const volcanismIntensity = new Uint8Array(cellCount);
  const fractureIntensity = new Uint8Array(cellCount);

  const upliftEventType = new Uint8Array(cellCount);
  const riftEventType = new Uint8Array(cellCount);
  const shearEventType = new Uint8Array(cellCount);
  const volcanismEventType = new Uint8Array(cellCount);
  const fractureEventType = new Uint8Array(cellCount);
  upliftEventType.fill(255);
  riftEventType.fill(255);
  shearEventType.fill(255);
  volcanismEventType.fill(255);
  fractureEventType.fill(255);

  const upliftEventIndex = new Int32Array(cellCount);
  const riftEventIndex = new Int32Array(cellCount);
  const shearEventIndex = new Int32Array(cellCount);
  const volcanismEventIndex = new Int32Array(cellCount);
  const fractureEventIndex = new Int32Array(cellCount);
  upliftEventIndex.fill(1 << 30);
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
  const meanEdgeLen = (() => {
    let sum = 0;
    let count = 0;
    const maxEdges = 100_000;
    for (let cellId = 0; cellId < cellCount && count < maxEdges; cellId++) {
      const ax = params.mesh.siteX[cellId] ?? 0;
      const ay = params.mesh.siteY[cellId] ?? 0;
      const start = params.mesh.neighborsOffsets[cellId] | 0;
      const end = params.mesh.neighborsOffsets[cellId + 1] | 0;
      for (let cursor = start; cursor < end && count < maxEdges; cursor++) {
        const n = params.mesh.neighbors[cursor] | 0;
        if (n <= cellId || n < 0 || n >= cellCount) continue;
        const bx = params.mesh.siteX[n] ?? 0;
        const by = params.mesh.siteY[n] ?? 0;
        const dx = wrapDeltaPeriodic(bx - ax, params.mesh.wrapWidth);
        const dy = by - ay;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (!Number.isFinite(len) || len <= 1e-9) continue;
        sum += len;
        count++;
      }
    }
    return count > 0 ? sum / count : 1;
  })();
  const queue = new Int32Array(cellCount);
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

  for (let e = 0; e < params.events.length; e++) {
    const event = params.events[e]!;
    const intensityUplift = clampByte((event.intensityUplift ?? 0) * weight);
    const intensityRift = clampByte((event.intensityRift ?? 0) * weight);
    const intensityShear = clampByte((event.intensityShear ?? 0) * weight);
    const intensityVolcanism = clampByte((event.intensityVolcanism ?? 0) * weight);
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

    const driftedSeeds = driftSeedCells(
      event.seedCells,
      event.driftU,
      event.driftV,
      params.driftSteps,
      params.mesh
    );
    let head = 0;
    let tail = 0;
    for (let i = 0; i < driftedSeeds.length; i++) {
      const cellId = driftedSeeds[i] ?? -1;
      if (cellId < 0 || cellId >= cellCount) continue;
      if (visitMark[cellId] === token) continue;
      visitMark[cellId] = token;
      distance[cellId] = 0;
      queue[tail++] = cellId;
    }

    while (head < tail) {
      const cellId = queue[head++]!;
      const d = distance[cellId] ?? 0;
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
        if (visitMark[n] === token) continue;
        visitMark[n] = token;
        const bx = params.mesh.siteX[n] ?? 0;
        const by = params.mesh.siteY[n] ?? 0;
        const dx = wrapDeltaPeriodic(bx - ax, params.mesh.wrapWidth);
        const dy = by - ay;
        const edgeLen = Math.sqrt(dx * dx + dy * dy);
        distance[n] = d + edgeLen / meanEdgeLen;
        queue[tail++] = n;
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
      bestScore = sScore;
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

function advectTracerIndex(params: {
  mesh: {
    cellCount: number;
    wrapWidth: number;
    siteX: Float32Array;
    siteY: Float32Array;
    neighborsOffsets: Int32Array;
    neighbors: Int32Array;
  };
  boundaryDriftU: Int8Array;
  boundaryDriftV: Int8Array;
  mantleDriftU: Int8Array;
  mantleDriftV: Int8Array;
  steps: number;
}): Uint32Array {
  const cellCount = params.mesh.cellCount | 0;
  const steps = Math.max(0, params.steps | 0);
  const out = new Uint32Array(cellCount);
  if (steps <= 0) {
    for (let i = 0; i < cellCount; i++) out[i] = i;
    return out;
  }

  for (let i = 0; i < cellCount; i++) {
    let driftU = params.boundaryDriftU[i] ?? 0;
    let driftV = params.boundaryDriftV[i] ?? 0;
    if (!driftU && !driftV) {
      driftU = params.mantleDriftU[i] ?? 0;
      driftV = params.mantleDriftV[i] ?? 0;
    }
    if (!driftU && !driftV) {
      out[i] = i;
      continue;
    }

    let cell = i;
    for (let step = 0; step < steps; step++) {
      cell = chooseDriftNeighbor({
        cellId: cell,
        driftU: -(driftU | 0),
        driftV: -(driftV | 0),
        mesh: params.mesh,
      });
    }
    out[i] = cell;
  }

  return out;
}

const computeTectonicHistory = createOp(ComputeTectonicHistoryContract, {
  strategies: {
    default: {
      run: (input, config) => {
        const mesh = requireMesh(input.mesh, "foundation/compute-tectonic-history");
        const crust = requireCrust(input.crust, mesh.cellCount | 0, "foundation/compute-tectonic-history");
        const mantleForcing = requireMantleForcing(
          input.mantleForcing,
          mesh.cellCount | 0,
          "foundation/compute-tectonic-history"
        );
        const plateGraph = requirePlateGraph(
          input.plateGraph,
          mesh.cellCount | 0,
          "foundation/compute-tectonic-history"
        );
        const segments = input.segments as FoundationTectonicSegments;

        const events: TectonicEvent[] = [];
        const segmentCount = segments.segmentCount | 0;
        for (let s = 0; s < segmentCount; s++) {
          const regime = segments.regime[s] ?? BOUNDARY_TYPE.none;
          if (regime === BOUNDARY_TYPE.none) continue;

          const plateA = segments.plateA[s] ?? -1;
          const plateB = segments.plateB[s] ?? -1;
          const polarity = regime === BOUNDARY_TYPE.convergent ? (segments.polarity[s] ?? 0) : 0;

          let eventType = 0;
          let intensityUplift = 0;
          let intensityRift = 0;
          let intensityShear = 0;
          let intensityVolcanism = 0;
          let intensityFracture = 0;

          if (regime === BOUNDARY_TYPE.convergent) {
            eventType = polarity !== 0 ? EVENT_TYPE.convergenceSubduction : EVENT_TYPE.convergenceCollision;
            intensityUplift = segments.compression[s] ?? 0;
            intensityVolcanism = segments.volcanism[s] ?? 0;
            intensityFracture = segments.fracture[s] ?? 0;
          } else if (regime === BOUNDARY_TYPE.divergent) {
            eventType = EVENT_TYPE.divergenceRift;
            intensityRift = segments.extension[s] ?? 0;
            intensityVolcanism = segments.volcanism[s] ?? 0;
            intensityFracture = segments.fracture[s] ?? 0;
          } else if (regime === BOUNDARY_TYPE.transform) {
            eventType = EVENT_TYPE.transformShear;
            intensityShear = segments.shear[s] ?? 0;
            intensityFracture = segments.fracture[s] ?? 0;
          }

          if (!eventType) continue;

          const aCell = segments.aCell[s] ?? -1;
          const bCell = segments.bCell[s] ?? -1;
          const seeds = aCell === bCell ? [aCell] : [aCell, bCell];

          let originPlateId = -1;
          if (eventType === EVENT_TYPE.convergenceSubduction) {
            originPlateId = polarity < 0 ? plateB : polarity > 0 ? plateA : -1;
          } else if (eventType === EVENT_TYPE.divergenceRift || eventType === EVENT_TYPE.convergenceCollision) {
            originPlateId = Math.min(plateA, plateB);
          }

          events.push({
            eventType,
            plateA,
            plateB,
            polarity,
            intensityUplift,
            intensityRift,
            intensityShear,
            intensityVolcanism,
            intensityFracture,
            driftU: segments.driftU[s] ?? 0,
            driftV: segments.driftV[s] ?? 0,
            seedCells: Int32Array.from(seeds.filter((cell) => cell >= 0)),
            originPlateId,
          });
        }

        for (let i = 0; i < mesh.cellCount; i++) {
          if ((mantleForcing.upwellingClass[i] ?? 0) <= 0) continue;
          const forcingMag = clamp01(mantleForcing.forcingMag[i] ?? 0);
          const stress = clamp01(mantleForcing.stress[i] ?? 0);
          if (forcingMag <= 0) continue;
          const intensity = clampByte(forcingMag * (0.6 + 0.4 * stress) * 255);
          if (intensity <= 0) continue;

          const drift = normalizeToInt8(mantleForcing.forcingU[i] ?? 0, mantleForcing.forcingV[i] ?? 0);

          events.push({
            eventType: EVENT_TYPE.intraplateHotspot,
            plateA: -1,
            plateB: -1,
            polarity: 0,
            intensityUplift: clampByte(intensity * 0.45),
            intensityRift: 0,
            intensityShear: 0,
            intensityVolcanism: intensity,
            intensityFracture: clampByte(intensity * 0.35),
            driftU: drift.u,
            driftV: drift.v,
            seedCells: Int32Array.from([i]),
            originPlateId: plateGraph.cellToPlate[i] ?? -1,
          });
        }

        const weights = config.eraWeights;
        const driftSteps = config.driftStepsByEra;
        if (weights.length !== driftSteps.length) {
          throw new Error("[Foundation] compute-tectonic-history expects eraWeights/driftStepsByEra to match length.");
        }
        const eraCount = Math.min(weights.length, driftSteps.length);
        if (eraCount < ERA_COUNT_MIN || eraCount > ERA_COUNT_MAX) {
          throw new Error(
            `[Foundation] compute-tectonic-history expects eraCount within ${ERA_COUNT_MIN}..${ERA_COUNT_MAX}.`
          );
        }

        // Honor authored belt influence parameters; these control the belt-field diffusion footprint.
        const emission = deriveEmissionParams({
          beltInfluenceDistance: config.beltInfluenceDistance,
          beltDecay: config.beltDecay,
        });

        const eras: EraFields[] = [];
        for (let era = 0; era < eraCount; era++) {
          eras.push(
            buildEraFields({
              mesh,
              events,
              weight: weights[era] ?? 0,
              driftSteps: driftSteps[era] ?? 0,
              emission,
            })
          );
        }

        const cellCount = mesh.cellCount | 0;
        const upliftTotal = new Uint8Array(cellCount);
        const fractureTotal = new Uint8Array(cellCount);
        const volcanismTotal = new Uint8Array(cellCount);
        const upliftRecentFraction = new Uint8Array(cellCount);

        for (let i = 0; i < cellCount; i++) {
          let upliftSum = 0;
          let fracSum = 0;
          let volcSum = 0;
          for (let era = 0; era < eraCount; era++) {
            const e = eras[era]!;
            upliftSum = addClampedByte(upliftSum, e.upliftPotential[i] ?? 0);
            fracSum = addClampedByte(fracSum, e.fracture[i] ?? 0);
            volcSum = addClampedByte(volcSum, e.volcanism[i] ?? 0);
          }
          upliftTotal[i] = upliftSum;
          fractureTotal[i] = fracSum;
          volcanismTotal[i] = volcSum;

          const recent = eras[eraCount - 1]!.upliftPotential[i] ?? 0;
          upliftRecentFraction[i] = upliftSum > 0 ? clampByte((recent / upliftSum) * 255) : 0;
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
              if (max > (config.activityThreshold | 0)) {
                lastEra = e;
                break;
              }
            }
            last[i] = lastEra;
          }
          return last;
        })();

        const newest = eras[eraCount - 1]!;
        const tectonics = {
          boundaryType: newest.boundaryType,
          upliftPotential: newest.upliftPotential,
          riftPotential: newest.riftPotential,
          shearStress: newest.shearStress,
          volcanism: newest.volcanism,
          fracture: newest.fracture,
          cumulativeUplift: upliftTotal,
        } as const;

        const mantleDriftU = new Int8Array(cellCount);
        const mantleDriftV = new Int8Array(cellCount);
        for (let i = 0; i < cellCount; i++) {
          const drift = normalizeToInt8(mantleForcing.forcingU[i] ?? 0, mantleForcing.forcingV[i] ?? 0);
          mantleDriftU[i] = drift.u;
          mantleDriftV[i] = drift.v;
        }

        const tracerIndex: Uint32Array[] = [];
        const tracerIdentity = new Uint32Array(cellCount);
        for (let i = 0; i < cellCount; i++) tracerIdentity[i] = i;
        tracerIndex.push(tracerIdentity);
        for (let era = 1; era < eraCount; era++) {
          const prevEra = eras[era - 1]!;
          tracerIndex.push(
            advectTracerIndex({
              mesh,
              boundaryDriftU: prevEra.boundaryDriftU,
              boundaryDriftV: prevEra.boundaryDriftV,
              mantleDriftU,
              mantleDriftV,
              steps: ADVECTION_STEPS_PER_ERA,
            })
          );
        }

        // Calibrate provenance reset thresholds per-era to the magnitudes that actually occur in that era.
        // If thresholds are set against a global max, later eras can fail to reset even when they contain
        // the era-relative "strongest" rift/subduction/hotspot signals.
        const riftResetThresholdByEra = new Uint8Array(eraCount);
        const arcResetThresholdByEra = new Uint8Array(eraCount);
        const hotspotResetThresholdByEra = new Uint8Array(eraCount);
        for (let era = 0; era < eraCount; era++) {
          const fields = eras[era]!;
          let maxRiftPotential = 0;
          let maxArcVolcanism = 0;
          let maxHotspotVolcanism = 0;
          for (let i = 0; i < cellCount; i++) {
            const boundary = fields.boundaryType[i] ?? BOUNDARY_TYPE.none;
            if (boundary === BOUNDARY_TYPE.divergent) {
              maxRiftPotential = Math.max(maxRiftPotential, fields.riftPotential[i] ?? 0);
            }
            const volc = fields.volcanism[i] ?? 0;
            const volcType = fields.volcanismEventType[i] ?? 0;
            if (boundary === BOUNDARY_TYPE.convergent && volcType === EVENT_TYPE.convergenceSubduction) {
              maxArcVolcanism = Math.max(maxArcVolcanism, volc);
            }
            if (boundary === BOUNDARY_TYPE.none && volcType === EVENT_TYPE.intraplateHotspot) {
              maxHotspotVolcanism = Math.max(maxHotspotVolcanism, volc);
            }
          }
          riftResetThresholdByEra[era] = deriveResetThreshold(
            maxRiftPotential,
            RIFT_RESET_THRESHOLD_FRAC_OF_MAX,
            RIFT_RESET_THRESHOLD_MIN
          );
          arcResetThresholdByEra[era] = deriveResetThreshold(
            maxArcVolcanism,
            ARC_RESET_THRESHOLD_FRAC_OF_MAX,
            ARC_RESET_THRESHOLD_MIN
          );
          hotspotResetThresholdByEra[era] = deriveResetThreshold(
            maxHotspotVolcanism,
            HOTSPOT_RESET_THRESHOLD_FRAC_OF_MAX,
            HOTSPOT_RESET_THRESHOLD_MIN
          );
        }

        let originEra = new Uint8Array(cellCount);
        let originPlateId = new Int16Array(cellCount);
        let lastBoundaryEra = new Uint8Array(cellCount);
        let lastBoundaryType = new Uint8Array(cellCount);
        let lastBoundaryPolarity = new Int8Array(cellCount);
        let lastBoundaryIntensity = new Uint8Array(cellCount);
        const crustAge = new Uint8Array(cellCount);

        lastBoundaryEra.fill(255);
        lastBoundaryType.fill(255);
        for (let i = 0; i < cellCount; i++) {
          originEra[i] = 0;
          originPlateId[i] = plateGraph.cellToPlate[i] ?? -1;
        }

        for (let era = 0; era < eraCount; era++) {
          if (era > 0) {
            const trace = tracerIndex[era]!;
            const nextOriginEra = new Uint8Array(cellCount);
            const nextOriginPlateId = new Int16Array(cellCount);
            const nextLastBoundaryEra = new Uint8Array(cellCount);
            const nextLastBoundaryType = new Uint8Array(cellCount);
            const nextLastBoundaryPolarity = new Int8Array(cellCount);
            const nextLastBoundaryIntensity = new Uint8Array(cellCount);

            for (let i = 0; i < cellCount; i++) {
              const src = trace[i] ?? i;
              if (src < 0 || src >= cellCount) {
                nextOriginEra[i] = originEra[i] ?? 0;
                nextOriginPlateId[i] = originPlateId[i] ?? -1;
                nextLastBoundaryEra[i] = lastBoundaryEra[i] ?? 255;
                nextLastBoundaryType[i] = lastBoundaryType[i] ?? 255;
                nextLastBoundaryPolarity[i] = lastBoundaryPolarity[i] ?? 0;
                nextLastBoundaryIntensity[i] = lastBoundaryIntensity[i] ?? 0;
                continue;
              }
              nextOriginEra[i] = originEra[src] ?? 0;
              nextOriginPlateId[i] = originPlateId[src] ?? -1;
              nextLastBoundaryEra[i] = lastBoundaryEra[src] ?? 255;
              nextLastBoundaryType[i] = lastBoundaryType[src] ?? 255;
              nextLastBoundaryPolarity[i] = lastBoundaryPolarity[src] ?? 0;
              nextLastBoundaryIntensity[i] = lastBoundaryIntensity[src] ?? 0;
            }

            originEra = nextOriginEra;
            originPlateId = nextOriginPlateId;
            lastBoundaryEra = nextLastBoundaryEra;
            lastBoundaryType = nextLastBoundaryType;
            lastBoundaryPolarity = nextLastBoundaryPolarity;
            lastBoundaryIntensity = nextLastBoundaryIntensity;
          }

          const fields = eras[era]!;
          const riftResetThreshold = riftResetThresholdByEra[era] ?? RIFT_RESET_THRESHOLD_MIN;
          const arcResetThreshold = arcResetThresholdByEra[era] ?? ARC_RESET_THRESHOLD_MIN;
          const hotspotResetThreshold = hotspotResetThresholdByEra[era] ?? HOTSPOT_RESET_THRESHOLD_MIN;

          for (let i = 0; i < cellCount; i++) {
            const boundary = fields.boundaryType[i] ?? BOUNDARY_TYPE.none;
            const intensity = fields.boundaryIntensity[i] ?? 0;
            if (boundary !== BOUNDARY_TYPE.none && intensity > 0) {
              lastBoundaryEra[i] = era;
              lastBoundaryType[i] = boundary;
              lastBoundaryPolarity[i] = boundary === BOUNDARY_TYPE.convergent ? fields.boundaryPolarity[i] ?? 0 : 0;
              lastBoundaryIntensity[i] = intensity;
            }

            if (boundary === BOUNDARY_TYPE.divergent && (fields.riftPotential[i] ?? 0) >= riftResetThreshold) {
              originEra[i] = era;
              originPlateId[i] = fields.riftOriginPlate[i] ?? plateGraph.cellToPlate[i] ?? -1;
            }

            if (
              boundary === BOUNDARY_TYPE.none &&
              (fields.volcanism[i] ?? 0) >= hotspotResetThreshold &&
              (fields.volcanismEventType[i] ?? 0) === EVENT_TYPE.intraplateHotspot
            ) {
              originEra[i] = era;
              originPlateId[i] = fields.volcanismOriginPlate[i] ?? plateGraph.cellToPlate[i] ?? -1;
            }

            if (
              boundary === BOUNDARY_TYPE.convergent &&
              (fields.volcanism[i] ?? 0) >= arcResetThreshold &&
              (fields.volcanismEventType[i] ?? 0) === EVENT_TYPE.convergenceSubduction
            ) {
              originEra[i] = era;
              originPlateId[i] = fields.volcanismOriginPlate[i] ?? plateGraph.cellToPlate[i] ?? -1;
            }
          }
        }

        const newestEraIndex = Math.max(0, eraCount - 1);
        const ageDenom = Math.max(1, eraCount - 1);
        for (let i = 0; i < cellCount; i++) {
          const age = newestEraIndex - (originEra[i] ?? 0);
          crustAge[i] = clampByte((age / ageDenom) * 255);
        }

        const tectonicProvenance = {
          version: 1,
          eraCount,
          cellCount,
          tracerIndex,
          provenance: {
            originEra,
            originPlateId,
            lastBoundaryEra,
            lastBoundaryType,
            lastBoundaryPolarity,
            lastBoundaryIntensity,
            crustAge,
          },
        } as const;

        return {
          tectonicHistory: {
            eraCount,
            eras: eras.map((era) => ({
              boundaryType: era.boundaryType,
              upliftPotential: era.upliftPotential,
              riftPotential: era.riftPotential,
              shearStress: era.shearStress,
              volcanism: era.volcanism,
              fracture: era.fracture,
            })),
            upliftTotal,
            fractureTotal,
            volcanismTotal,
            upliftRecentFraction,
            lastActiveEra,
          },
          tectonics,
          tectonicProvenance,
        } as const;
      },
    },
  },
});

export default computeTectonicHistory;
