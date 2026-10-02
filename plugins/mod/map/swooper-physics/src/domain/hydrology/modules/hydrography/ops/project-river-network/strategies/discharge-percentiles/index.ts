import { createStrategy } from "@swooper/mapgen-core/authoring";
import { clamp01 } from "@swooper/mapgen-core/lib/math";
import { getHexNeighborIndicesOddQ } from "@swooper/mapgen-core/lib/grid";
import { RIVER_CLASS_MAJOR, RIVER_CLASS_MINOR } from "../../../../model/policy/river-class.js";
import ProjectRiverNetworkContract from "../../contract.js";
import DischargePercentilesDefinition from "./config.js";

function percentileThreshold(values: number[], p: number): number {
  if (values.length === 0) return Infinity;
  const pct = clamp01(p);
  const i = Math.floor((values.length - 1) * pct);
  return values[i] ?? Infinity;
}

/**
 * Classifies each admitted principal source by its own discharge. Nested thresholds preserve
 * minor tributaries without extending navigable heads into weaker channels or omitting a strong
 * tributary merely because another branch carries more flow.
 */
const dischargePercentilesStrategy = createStrategy(
  ProjectRiverNetworkContract,
  DischargePercentilesDefinition,
  {
    run: (input, config) => {
      const width = input.width;
      const height = input.height;
      const size = width * height;
      if (
        input.discharge.length !== size ||
        input.flowDir.length !== size ||
        input.landMask.length !== size
      ) {
        throw new RangeError("River classification requires map-grid Number discharge.");
      }
      if (input.discharge.some((value) => !Number.isFinite(value) || value < 0))
        throw new RangeError("River classification requires finite nonnegative discharge.");
      const eligible = new Uint8Array(size);
      for (let i = 0; i < size; i++) {
        if (input.landMask[i] !== 1) continue;
        if (input.flowDir[i]! >= 0) {
          if (
            !getHexNeighborIndicesOddQ(i % width, Math.floor(i / width), width, height).includes(
              input.flowDir[i]!
            )
          )
            throw new RangeError("Principal river classification requires actual adjacent edges.");
          eligible[i] = 1;
        }
      }

      const riverClass = new Uint8Array(size);

      const landDischarge: number[] = [];
      for (let i = 0; i < size; i++) {
        if (!eligible[i]) continue;
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

      for (let i = 0; i < size; i++) {
        if (!eligible[i]) continue;
        const d = input.discharge[i] ?? 0;
        if (d <= 0 || d < minorThreshold) continue;
        riverClass[i] = d >= majorThreshold ? RIVER_CLASS_MAJOR : RIVER_CLASS_MINOR;
      }

      return { riverClass, minorThreshold, majorThreshold } as const;
    },
  }
);

export default dischargePercentilesStrategy;
