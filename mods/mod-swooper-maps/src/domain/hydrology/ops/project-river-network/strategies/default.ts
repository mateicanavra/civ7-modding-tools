import { createStrategy } from "@swooper/mapgen-core/authoring";
import {
  RIVER_CLASS_MAJOR,
  RIVER_CLASS_MINOR,
  RIVER_CLASS_NONE,
} from "../../../model/policy/river-class.js";
import ProjectRiverNetworkContract from "../contract.js";
import { clamp01 } from "../rules/index.js";

function percentileThreshold(values: number[], p: number): number {
  if (values.length === 0) return Infinity;
  const pct = clamp01(p);
  const i = Math.floor((values.length - 1) * pct);
  return values[i] ?? Infinity;
}

function strongestUpstreamMinor(
  upstream: readonly number[],
  discharge: Float32Array,
  minorMask: Uint8Array
): number {
  let best = -1;
  let bestDischarge = -Infinity;
  for (const index of upstream) {
    if (minorMask[index] !== 1) continue;
    const value = discharge[index] ?? 0;
    if (value <= bestDischarge) continue;
    bestDischarge = value;
    best = index;
  }
  return best;
}

export const defaultStrategy = createStrategy(ProjectRiverNetworkContract, "default", {
  run: (input, config) => {
    const width = input.width;
    const height = input.height;
    const size = width * height;

    const riverClass = new Uint8Array(size);
    const minorMask = new Uint8Array(size);

    const landDischarge: number[] = [];
    for (let i = 0; i < size; i++) {
      if (input.landMask[i] !== 1) continue;
      const d = input.discharge[i] ?? 0;
      if (d > 0) landDischarge.push(d);
    }
    landDischarge.sort((a, b) => a - b);

    if (landDischarge.length === 0) {
      const minorThreshold = Math.max(0, config.minMinorDischarge);
      const majorThreshold = Math.max(minorThreshold, config.minMajorDischarge);
      return { riverClass, minorThreshold, majorThreshold } as const;
    }

    const rawMinor = percentileThreshold(landDischarge, config.minorPercentile);
    const rawMajor = percentileThreshold(landDischarge, config.majorPercentile);

    const minorThreshold = Math.max(0, config.minMinorDischarge, rawMinor);
    const majorThreshold = Math.max(minorThreshold, config.minMajorDischarge, rawMajor);

    const upstream: number[][] = Array.from({ length: size }, () => []);
    for (let i = 0; i < size; i++) {
      if (input.landMask[i] !== 1) continue;
      const receiver = input.flowDir[i] ?? -1;
      if (receiver >= 0 && receiver < size && input.landMask[receiver] === 1) {
        upstream[receiver]!.push(i);
      }
      const d = input.discharge[i] ?? 0;
      if (d <= 0) continue;
      if (d >= minorThreshold) {
        riverClass[i] = RIVER_CLASS_MINOR;
        minorMask[i] = 1;
      }
    }

    const majorEndpoints: number[] = [];
    for (let i = 0; i < size; i++) {
      if (minorMask[i] !== 1) continue;
      const d = input.discharge[i] ?? 0;
      if (d < majorThreshold) continue;
      const receiver = input.flowDir[i] ?? -1;
      if (receiver >= 0 && receiver < size && minorMask[receiver] === 1) continue;
      majorEndpoints.push(i);
    }
    majorEndpoints.sort((a, b) => (input.discharge[b] ?? 0) - (input.discharge[a] ?? 0));

    for (const endpoint of majorEndpoints) {
      let current = endpoint;
      const seen = new Set<number>();
      while (current >= 0 && current < size && minorMask[current] === 1 && !seen.has(current)) {
        seen.add(current);
        riverClass[current] = RIVER_CLASS_MAJOR;
        current = strongestUpstreamMinor(upstream[current]!, input.discharge, minorMask);
      }
    }

    for (let i = 0; i < size; i++) {
      if (riverClass[i] === 0) {
        riverClass[i] = RIVER_CLASS_NONE;
      }
    }

    return { riverClass, minorThreshold, majorThreshold } as const;
  },
});
