import { describe, expect, it } from "bun:test";

import { defaultStrategy as planLakes } from "../../src/domain/hydrology/ops/plan-lakes/strategies/default.js";

/**
 * Plan-lakes strategy tests.
 *
 * These cover the category-level contract for Hydrology lake truth: sinks
 * create deterministic lake intent, and optional density expansion follows
 * drainage receivers instead of engine lake-generation frequency.
 */
describe("hydrology/plan-lakes", () => {
  it("plans land sinks as lake intent and ignores water sinks", () => {
    const width = 4;
    const height = 3;
    const size = width * height;
    const landMask = new Uint8Array(size).fill(1);
    const sinkMask = new Uint8Array(size);
    sinkMask[5] = 1;
    sinkMask[6] = 1;
    landMask[6] = 0;

    const result = planLakes.run(
      {
        width,
        height,
        landMask,
        flowDir: new Int32Array(size).fill(-1),
        sinkMask,
      },
      { maxUpstreamSteps: 0 }
    );

    expect(result.sinkLakeCount).toBe(1);
    expect(result.plannedLakeTileCount).toBe(1);
    expect(result.lakeMask[5]).toBe(1);
    expect(result.lakeMask[6]).toBe(0);
  });

  it("expands lake intent upstream through flow receivers when configured", () => {
    const width = 5;
    const height = 1;
    const size = width * height;
    const sinkMask = new Uint8Array(size);
    sinkMask[4] = 1;
    const flowDir = new Int32Array([-1, 2, 3, 4, -1]);

    const result = planLakes.run(
      {
        width,
        height,
        landMask: new Uint8Array(size).fill(1),
        flowDir,
        sinkMask,
      },
      { maxUpstreamSteps: 2 }
    );

    expect(Array.from(result.lakeMask)).toEqual([0, 0, 1, 1, 1]);
    expect(result.sinkLakeCount).toBe(1);
    expect(result.plannedLakeTileCount).toBe(3);
  });
});
