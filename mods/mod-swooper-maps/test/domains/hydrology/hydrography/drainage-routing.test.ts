import { describe, expect, it } from "bun:test";
import hydrologyOpsPublic from "@mapgen/domain/hydrology/ops";

const { computeDrainageRouting } = hydrologyOpsPublic.ops;
const TERMINAL_OCEAN = 1;
const TERMINAL_CLOSED_BASIN = 2;

function runDrainageRouting(
  input: Parameters<typeof computeDrainageRouting.run>[0],
  config: (typeof computeDrainageRouting.defaultConfig)["config"]
) {
  return computeDrainageRouting.run(input, { strategy: "default", config });
}

describe("hydrology/compute-drainage-routing", () => {
  it("routes a raw pit through its spill path to ocean without making it a terminal river sink", () => {
    const syntheticDimensions = { width: 5, height: 3 } as const;
    const { width, height } = syntheticDimensions;
    const elevation = new Int16Array([9, 9, 9, 9, 9, 6, 1, 5, 4, -10, 9, 9, 9, 9, 9]);
    const landMask = new Uint8Array(elevation.length).fill(1);
    landMask[9] = 0;

    const result = runDrainageRouting(
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
    expect(result.terminalType[outlet]).toBe(TERMINAL_OCEAN);
    expect(result.depressionDepth[pit]).toBeGreaterThan(0);
    expect(result.flowAccum[outlet]).toBeGreaterThanOrEqual(3);
  });

  it("keeps a no-outlet basin closed instead of inventing a projection connector", () => {
    const syntheticDimensions = { width: 3, height: 1 } as const;
    const { width, height } = syntheticDimensions;
    const elevation = new Int16Array([5, 1, 5]);
    const landMask = new Uint8Array([1, 1, 1]);

    const result = runDrainageRouting(
      { width, height, elevation, landMask },
      { allowExternalEdgeOutlets: false }
    );

    expect(Array.from(result.flowDir)).toEqual([1, -1, 1]);
    expect(result.sinkMask[1]).toBe(1);
    expect(result.outletMask[1]).toBe(0);
    expect(result.terminalType[1]).toBe(TERMINAL_CLOSED_BASIN);
    expect(result.flowAccum[1]).toBe(3);
  });
});
