import { describe, expect, it } from "bun:test";

import { defaultStrategy as accumulateDischarge } from "../src/domain/hydrology/ops/accumulate-discharge/strategies/default.js";
import { defaultStrategy as planLakes } from "../src/domain/hydrology/ops/plan-lakes/strategies/default.js";

describe("hydrology/plan-lakes (default strategy)", () => {
  it("marks every sink tile as a planned lake tile deterministically", () => {
    const width = 4;
    const height = 3;
    const size = width * height;

    const sinkMask = new Uint8Array(size);
    sinkMask[1] = 1;
    sinkMask[10] = 1;
    const flowDir = new Int32Array(size).fill(-1);

    const out = planLakes.run(
      {
        width,
        height,
        landMask: new Uint8Array(size).fill(1),
        flowDir,
        sinkMask,
      },
      { maxUpstreamSteps: 1 }
    );

    expect(out.sinkLakeCount).toBe(2);
    expect(out.plannedLakeTileCount).toBeGreaterThanOrEqual(2);
    expect(out.lakeMask[1]).toBe(1);
    expect(out.lakeMask[10]).toBe(1);
  });

  it("keeps sink/outlet classes disjoint and only plans lakes from sink-derived truth", () => {
    const width = 3;
    const height = 3;
    const size = width * height;

    const landMask = new Uint8Array([1, 1, 1, 1, 1, 1, 1, 1, 0]);
    const flowDir = new Int32Array([
      1, 2, 5, // row 0
      4, -1, 8, // row 1 (tile 4 sink, tile 5 drains to water tile 8)
      7, 4, -1, // row 2
    ]);

    const discharge = accumulateDischarge.run(
      {
        width,
        height,
        landMask,
        flowDir,
        rainfall: new Uint8Array(size).fill(100),
        humidity: new Uint8Array(size).fill(100),
      },
      {
        runoffScale: 1,
        infiltrationFraction: 0.15,
        humidityDampening: 0.25,
        minRunoff: 0,
      }
    );

    for (let i = 0; i < size; i++) {
      expect((discharge.sinkMask[i] ?? 0) & (discharge.outletMask[i] ?? 0)).toBe(0);
    }

    const lakePlan = planLakes.run(
      {
        width,
        height,
        landMask,
        flowDir,
        sinkMask: discharge.sinkMask,
      },
      { maxUpstreamSteps: 1 }
    );

    expect(lakePlan.lakeMask[4]).toBe(1);
    expect(lakePlan.lakeMask[5]).toBe(0);
  });
});
