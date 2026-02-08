import { createStrategy } from "@swooper/mapgen-core/authoring";
import { forEachHexNeighborOddQ } from "@swooper/mapgen-core/lib/grid";
import { clamp01 } from "@swooper/mapgen-core/lib/math";

import ComputeLandmaskContract from "../contract.js";
import { validateLandmaskInputs } from "../rules/index.js";

function buildCoarseAverage(width: number, height: number, values: Float32Array, grain: number): Float32Array {
  const size = Math.max(0, (width | 0) * (height | 0));
  const g = Math.max(1, Math.round(grain)) | 0;
  const gx = Math.max(1, Math.ceil(width / g)) | 0;
  const gy = Math.max(1, Math.ceil(height / g)) | 0;
  const sums = new Float32Array(gx * gy);
  const counts = new Int32Array(gx * gy);

  for (let y = 0; y < height; y++) {
    const gyIdx = ((y / g) | 0) * gx;
    for (let x = 0; x < width; x++) {
      const cell = gyIdx + ((x / g) | 0);
      const i = y * width + x;
      sums[cell] += values[i] ?? 0;
      counts[cell] += 1;
    }
  }

  const out = new Float32Array(size);
  for (let y = 0; y < height; y++) {
    const gyIdx = ((y / g) | 0) * gx;
    for (let x = 0; x < width; x++) {
      const cell = gyIdx + ((x / g) | 0);
      const denom = counts[cell] || 1;
      out[y * width + x] = sums[cell] / denom;
    }
  }

  return out;
}

function blurHex(width: number, height: number, values: Float32Array, steps: number): Float32Array {
  const size = Math.max(0, (width | 0) * (height | 0));
  const n = Math.max(0, Math.round(steps)) | 0;
  if (n <= 0) return values;

  let current: Float32Array = values;
  let next: Float32Array = new Float32Array(size);
  for (let pass = 0; pass < n; pass++) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = y * width + x;
        let sum = current[i] ?? 0;
        let count = 1;
        forEachHexNeighborOddQ(x, y, width, height, (nx, ny) => {
          const ni = ny * width + nx;
          sum += current[ni] ?? 0;
          count++;
        });
        next[i] = sum / count;
      }
    }
    const tmp: Float32Array = current;
    current = next;
    next = tmp;
  }

  return current;
}

function chooseThresholdForLandCount(potential: Float32Array, landCount: number): number {
  const size = potential.length;
  const desired = Math.max(0, Math.min(size, landCount | 0)) | 0;
  if (desired <= 0) return Infinity;
  if (desired >= size) return -Infinity;
  const values = Array.from(potential);
  values.sort((a, b) => a - b);
  const idx = Math.max(0, Math.min(values.length - 1, values.length - desired));
  return values[idx] ?? 0;
}

function countLand(landMask: Uint8Array): number {
  let n = 0;
  for (let i = 0; i < landMask.length; i++) n += landMask[i] === 1 ? 1 : 0;
  return n;
}

function computeComponents(width: number, height: number, landMask: Uint8Array): { id: Int32Array; sizes: number[] } {
  const size = Math.max(0, (width | 0) * (height | 0));
  const id = new Int32Array(size);
  id.fill(-1);

  const sizes: number[] = [];
  const queue = new Int32Array(size);

  let nextId = 0;
  for (let start = 0; start < size; start++) {
    if (landMask[start] !== 1) continue;
    if (id[start] !== -1) continue;

    let head = 0;
    let tail = 0;
    queue[tail++] = start;
    id[start] = nextId;
    let componentSize = 0;

    while (head < tail) {
      const idx = queue[head++]!;
      componentSize++;
      const y = (idx / width) | 0;
      const x = idx - y * width;
      forEachHexNeighborOddQ(x, y, width, height, (nx, ny) => {
        const ni = ny * width + nx;
        if (landMask[ni] !== 1) return;
        if (id[ni] !== -1) return;
        id[ni] = nextId;
        queue[tail++] = ni;
      });
    }

    sizes.push(componentSize);
    nextId++;
  }

  return { id, sizes };
}

function pruneSpeckle(params: {
  width: number;
  height: number;
  landMask: Uint8Array;
  keepFraction: number;
}): void {
  const { width, height, landMask } = params;
  const keepFraction = clamp01(params.keepFraction);
  const totalLand = countLand(landMask);
  if (totalLand <= 0) return;

  const { id, sizes } = computeComponents(width, height, landMask);
  const order = sizes
    .map((size, idx) => ({ size, idx }))
    .sort((a, b) => b.size - a.size)
    .map((entry) => entry.idx);

  const keepUntil = Math.max(1, Math.ceil(totalLand * keepFraction));
  const keep = new Uint8Array(sizes.length);
  let kept = 0;
  for (const compId of order) {
    keep[compId] = 1;
    kept += sizes[compId] ?? 0;
    if (kept >= keepUntil) break;
  }

  for (let i = 0; i < landMask.length; i++) {
    if (landMask[i] !== 1) continue;
    const comp = id[i] ?? -1;
    if (comp < 0 || keep[comp] !== 1) landMask[i] = 0;
  }
}

function fillToTarget(params: {
  width: number;
  height: number;
  landMask: Uint8Array;
  potential: Float32Array;
  desiredLandCount: number;
}): void {
  const { width, height, landMask, potential } = params;
  const desired = Math.max(0, Math.min(landMask.length, params.desiredLandCount | 0)) | 0;
  let current = countLand(landMask);
  if (current >= desired) return;

  // Grow continents by annexing high-potential water adjacent to existing land.
  // Recompute frontier in rounds to allow growth to continue outward.
  for (let round = 0; round < 8 && current < desired; round++) {
    const candidates: { idx: number; score: number }[] = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = y * width + x;
        if (landMask[i] === 1) continue;
        let adjacentLand = 0;
        forEachHexNeighborOddQ(x, y, width, height, (nx, ny) => {
          if (adjacentLand) return;
          const ni = ny * width + nx;
          if (landMask[ni] === 1) adjacentLand = 1;
        });
        if (!adjacentLand) continue;
        const base = potential[i] ?? 0;
        candidates.push({ idx: i, score: base });
      }
    }
    if (candidates.length === 0) break;
    candidates.sort((a, b) => b.score - a.score);

    for (const c of candidates) {
      if (current >= desired) break;
      if (landMask[c.idx] === 1) continue;
      // Still must be adjacent to land at time-of-flip.
      const y = (c.idx / width) | 0;
      const x = c.idx - y * width;
      let adjacentLand = 0;
      forEachHexNeighborOddQ(x, y, width, height, (nx, ny) => {
        if (adjacentLand) return;
        const ni = ny * width + nx;
        if (landMask[ni] === 1) adjacentLand = 1;
      });
      if (!adjacentLand) continue;
      landMask[c.idx] = 1;
      current++;
    }
  }
}

function computeDistanceToCoast(width: number, height: number, landMask: Uint8Array): Uint16Array {
  const size = Math.max(0, (width | 0) * (height | 0));
  const distanceToCoast = new Uint16Array(size);
  distanceToCoast.fill(65535);
  const queue = new Int32Array(size);
  let head = 0;
  let tail = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const isLand = landMask[i] === 1;
      let isCoastal = false;
      forEachHexNeighborOddQ(x, y, width, height, (nx, ny) => {
        if (isCoastal) return;
        const ni = ny * width + nx;
        if ((landMask[ni] === 1) !== isLand) isCoastal = true;
      });
      if (isCoastal) {
        distanceToCoast[i] = 0;
        queue[tail++] = i;
      }
    }
  }

  while (head < tail) {
    const idx = queue[head++]!;
    const y = (idx / width) | 0;
    const x = idx - y * width;
    const dist = distanceToCoast[idx] ?? 0;
    forEachHexNeighborOddQ(x, y, width, height, (nx, ny) => {
      const ni = ny * width + nx;
      const next = (dist + 1) as number;
      if ((distanceToCoast[ni] ?? 65535) <= next) return;
      distanceToCoast[ni] = next;
      queue[tail++] = ni;
    });
  }

  return distanceToCoast;
}

export const defaultStrategy = createStrategy(ComputeLandmaskContract, "default", {
  run: (input, config) => {
    const { width, height } = input;
    const {
      size,
      elevation,
      crustType,
      crustBaseElevation,
      crustAge,
      provenanceOriginEra,
      provenanceDriftDistance,
    } = validateLandmaskInputs(input);

    // Preserve hypsometry intent by targeting the land fraction implied by (elevation > seaLevel),
    // but derive the actual landmask from a low-frequency continent potential grounded in Foundation truth.
    const seaLevel = input.seaLevel;
    let desiredLandCount = 0;
    for (let i = 0; i < size; i++) {
      desiredLandCount += (elevation[i] ?? 0) > seaLevel ? 1 : 0;
    }
    desiredLandCount = Math.max(1, Math.min(size - 1, desiredLandCount));

    const potentialRaw = new Float32Array(size);
    for (let i = 0; i < size; i++) {
      const type01 = (crustType[i] ?? 0) === 1 ? 1 : 0;
      const baseElev01 = clamp01(crustBaseElevation[i] ?? 0);
      const drift01 = clamp01((provenanceDriftDistance[i] ?? 0) / 255);
      const originEra01 = clamp01(1 - (provenanceOriginEra[i] ?? 0) / 7);
      const stability01 = clamp01(0.6 * (1 - drift01) + 0.4 * originEra01);
      const age01 = clamp01((crustAge[i] ?? 0) / 255);

      // Continent potential: crust truth primary; provenance stability secondary.
      const p = 0.48 * type01 + 0.28 * baseElev01 + 0.14 * stability01 + 0.1 * age01;
      potentialRaw[i] = clamp01(p);
    }

    const coarse = buildCoarseAverage(width, height, potentialRaw, config.continentPotentialGrain);
    const potential = blurHex(width, height, coarse, config.continentPotentialBlurSteps);

    const threshold = chooseThresholdForLandCount(potential, desiredLandCount);
    const landMask = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
      landMask[i] = (potential[i] ?? 0) >= threshold ? 1 : 0;
    }

    pruneSpeckle({
      width,
      height,
      landMask,
      keepFraction: config.keepLandComponentFraction,
    });
    fillToTarget({ width, height, landMask, potential, desiredLandCount });

    const distanceToCoast = computeDistanceToCoast(width, height, landMask);
    return { landMask, distanceToCoast };
  },
});
