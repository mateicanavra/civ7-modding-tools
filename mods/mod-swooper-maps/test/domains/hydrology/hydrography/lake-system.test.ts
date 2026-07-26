import { describe, expect, it } from "bun:test";
import hydrology from "@mapgen/domain/hydrology/router";

const { accumulateDischarge, planLakes } = hydrology.hydrography.ops;

function runLakeSystem(input: {
  width: number;
  height: number;
  landMask: Uint8Array;
  flowDir: Int32Array;
  rainfall: Uint8Array;
  maxUpstreamSteps: number;
  sinkDischargePercentileMin: number;
}) {
  const accumulated = accumulateDischarge.run(
    {
      width: input.width,
      height: input.height,
      landMask: input.landMask,
      flowDir: input.flowDir,
      rainfall: input.rainfall,
      humidity: new Uint8Array(input.width * input.height),
    },
    {
      strategy: "topological-runoff",
      config: {
        runoffScale: 1,
        infiltrationFraction: 0,
        humidityDampening: 0,
        minRunoff: 0,
      },
    }
  );
  const lakes = planLakes.run(
    {
      width: input.width,
      height: input.height,
      landMask: input.landMask,
      flowDir: input.flowDir,
      discharge: accumulated.discharge,
      sinkMask: accumulated.sinkMask,
    },
    {
      strategy: "sink-discharge-budget",
      config: {
        maxUpstreamSteps: input.maxUpstreamSteps,
        sinkDischargePercentileMin: input.sinkDischargePercentileMin,
        maxLakeLandFraction: 1,
      },
    }
  );
  return { accumulated, lakes };
}

describe("hydrology lake system", () => {
  it("keeps closed-basin drainage endorheic and grows lake intent upstream", () => {
    const syntheticDimensions = { width: 5, height: 1 } as const;
    const { width, height } = syntheticDimensions;
    const size = width * height;
    const sink = 4;
    const { accumulated, lakes } = runLakeSystem({
      width,
      height,
      landMask: new Uint8Array(size).fill(1),
      flowDir: new Int32Array([1, 2, 3, sink, -1]),
      rainfall: new Uint8Array(size).fill(10),
      maxUpstreamSteps: 2,
      sinkDischargePercentileMin: 0,
    });

    expect(accumulated.sinkMask[sink]).toBe(1);
    expect(accumulated.outletMask).toEqual(new Uint8Array(size));
    expect(accumulated.discharge[sink]).toBe(50);
    expect(lakes.sinkLakeCount).toBe(1);
    expect(Array.from(lakes.lakeMask)).toEqual([0, 0, 1, 1, 1]);
  });

  it("selects the stronger terminal basin before expanding its one-hop lake chain", () => {
    const syntheticDimensions = { width: 7, height: 1 } as const;
    const { width, height } = syntheticDimensions;
    const size = width * height;
    const { accumulated, lakes } = runLakeSystem({
      width,
      height,
      landMask: new Uint8Array(size).fill(1),
      flowDir: new Int32Array([1, 2, -1, 4, 5, -1, 5]),
      rainfall: new Uint8Array([10, 10, 10, 20, 20, 20, 20]),
      maxUpstreamSteps: 1,
      sinkDischargePercentileMin: 1,
    });

    expect(accumulated.sinkMask[2]).toBe(1);
    expect(accumulated.sinkMask[5]).toBe(1);
    expect(accumulated.discharge[5]).toBeGreaterThan(accumulated.discharge[2] ?? 0);
    expect(lakes.sinkLakeCount).toBe(1);
    expect(Array.from(lakes.lakeMask)).toEqual([0, 0, 0, 0, 1, 1, 1]);
  });
});
