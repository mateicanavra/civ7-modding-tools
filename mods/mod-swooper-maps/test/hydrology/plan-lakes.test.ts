import { describe, expect, it } from "bun:test";

import hydrologyOpsPublic from "@mapgen/domain/hydrology/ops";

const { planLakes } = hydrologyOpsPublic.ops;
function runPlanLakes(
  input: Parameters<typeof planLakes.run>[0],
  config: (typeof planLakes.defaultConfig)["config"]
) {
  return planLakes.run(input, { strategy: "default", config });
}

/**
 * Plan-lakes strategy tests.
 *
 * These cover the category-level contract for Hydrology lake truth: terminal
 * basins need meaningful drainage and an explicit lake budget, while optional
 * density expansion follows receivers instead of engine lake-generation
 * frequency.
 */
describe("hydrology/plan-lakes", () => {
  it("plans land sinks as lake intent and ignores water sinks", () => {
    const width = 4;
    const height = 3;
    const size = width * height;
    const landMask = new Uint8Array(size).fill(1);
    const discharge = new Float32Array(size);
    const sinkMask = new Uint8Array(size);
    sinkMask[5] = 1;
    sinkMask[6] = 1;
    landMask[6] = 0;
    discharge[5] = 100;
    discharge[6] = 100;

    const result = runPlanLakes(
      {
        width,
        height,
        landMask,
        flowDir: new Int32Array(size).fill(-1),
        discharge,
        sinkMask,
      },
      { maxUpstreamSteps: 0, sinkDischargePercentileMin: 0, maxLakeLandFraction: 1 }
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
    const discharge = new Float32Array(size);
    discharge[4] = 100;

    const result = runPlanLakes(
      {
        width,
        height,
        landMask: new Uint8Array(size).fill(1),
        flowDir,
        discharge,
        sinkMask,
      },
      { maxUpstreamSteps: 2, sinkDischargePercentileMin: 0, maxLakeLandFraction: 1 }
    );

    expect(Array.from(result.lakeMask)).toEqual([0, 0, 1, 1, 1]);
    expect(result.sinkLakeCount).toBe(1);
    expect(result.plannedLakeTileCount).toBe(3);
  });

  it("does not let one upstream expansion step cascade through an entire basin", () => {
    const width = 5;
    const height = 1;
    const size = width * height;
    const sinkMask = new Uint8Array(size);
    sinkMask[4] = 1;
    const discharge = new Float32Array(size);
    discharge[4] = 100;

    const result = runPlanLakes(
      {
        width,
        height,
        landMask: new Uint8Array(size).fill(1),
        flowDir: new Int32Array([1, 2, 3, 4, -1]),
        discharge,
        sinkMask,
      },
      { maxUpstreamSteps: 1, sinkDischargePercentileMin: 0, maxLakeLandFraction: 1 }
    );

    expect(Array.from(result.lakeMask)).toEqual([0, 0, 0, 1, 1]);
    expect(result.sinkLakeCount).toBe(1);
    expect(result.plannedLakeTileCount).toBe(2);
  });

  it("admits terminal basins by discharge percentile and lake budget", () => {
    const width = 6;
    const height = 1;
    const size = width * height;
    const sinkMask = new Uint8Array(size);
    sinkMask[1] = 1;
    sinkMask[3] = 1;
    sinkMask[5] = 1;
    const discharge = new Float32Array(size);
    discharge[1] = 1;
    discharge[3] = 10;
    discharge[5] = 100;

    const result = runPlanLakes(
      {
        width,
        height,
        landMask: new Uint8Array(size).fill(1),
        flowDir: new Int32Array(size).fill(-1),
        discharge,
        sinkMask,
      },
      { maxUpstreamSteps: 0, sinkDischargePercentileMin: 0.5, maxLakeLandFraction: 0.5 }
    );

    expect(result.sinkLakeCount).toBe(2);
    expect(Array.from(result.lakeMask)).toEqual([0, 0, 0, 1, 0, 1]);
  });
});
