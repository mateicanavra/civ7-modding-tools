import { describe, expect, it } from "bun:test";

import { defaultStrategy as computeDrainageRouting } from "../../src/domain/hydrology/ops/compute-drainage-routing/strategies/default.js";
import {
  HYDROLOGY_TERMINAL_CLOSED_BASIN,
  HYDROLOGY_TERMINAL_OCEAN,
  computeDrainageAccumulation,
} from "../../src/domain/hydrology/ops/compute-drainage-routing/rules/index.js";

describe("hydrology/compute-drainage-routing", () => {
  it("routes a raw pit through its spill path to ocean without making it a terminal river sink", () => {
    const width = 5;
    const height = 3;
    const elevation = new Int16Array([
      9, 9, 9, 9, 9,
      6, 1, 5, 4, -10,
      9, 9, 9, 9, 9,
    ]);
    const landMask = new Uint8Array(elevation.length).fill(1);
    landMask[9] = 0;

    const result = computeDrainageRouting.run(
      { width, height, elevation, landMask },
      { allowExternalEdgeOutlets: false }
    );

    const pit = 6;
    const spill = 7;
    const outlet = 8;
    expect(result.flowDir[pit]).toBe(spill);
    expect(result.sinkMask[pit]).toBe(1);
    expect(result.terminalType[pit]).toBe(0);
    expect(result.outletMask[outlet]).toBe(1);
    expect(result.terminalType[outlet]).toBe(HYDROLOGY_TERMINAL_OCEAN);
    expect(result.depressionDepth[pit]).toBeGreaterThan(0);
    expect(result.flowAccum[outlet]).toBeGreaterThanOrEqual(3);
  });

  it("keeps a no-outlet basin closed instead of inventing a projection connector", () => {
    const width = 3;
    const height = 1;
    const elevation = new Int16Array([5, 1, 5]);
    const landMask = new Uint8Array([1, 1, 1]);

    const result = computeDrainageRouting.run(
      { width, height, elevation, landMask },
      { allowExternalEdgeOutlets: false }
    );

    expect(Array.from(result.flowDir)).toEqual([1, -1, 1]);
    expect(result.sinkMask[1]).toBe(1);
    expect(result.outletMask[1]).toBe(0);
    expect(result.terminalType[1]).toBe(HYDROLOGY_TERMINAL_CLOSED_BASIN);
    expect(result.flowAccum[1]).toBe(3);
  });

  it("fails fast when a supplied route graph contains a cycle", () => {
    const landMask = new Uint8Array([1, 1, 1]);
    const flowDir = new Int32Array([1, 0, -1]);

    expect(() => computeDrainageAccumulation(landMask, flowDir)).toThrow(
      "[Hydrology] Drainage routing produced a cycle."
    );
  });
});
