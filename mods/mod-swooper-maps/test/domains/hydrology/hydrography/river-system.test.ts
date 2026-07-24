import { describe, expect, it } from "bun:test";
import hydrology from "@mapgen/domain/hydrology/router";

const { accumulateDischarge, projectRiverNetwork } = hydrology.hydrography.ops;
const SIMPLE_DISCHARGE_CONFIG = {
  runoffScale: 1,
  infiltrationFraction: 0,
  humidityDampening: 0,
  minRunoff: 0,
};

function runRiverSystem(input: {
  width: number;
  height: number;
  landMask: Uint8Array;
  flowDir: Int32Array;
  rainfall: Uint8Array;
  minorDischarge: number;
  majorDischarge: number;
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
    { strategy: "topological-runoff", config: SIMPLE_DISCHARGE_CONFIG }
  );
  const projected = projectRiverNetwork.run(
    {
      width: input.width,
      height: input.height,
      landMask: input.landMask,
      discharge: accumulated.discharge,
      flowDir: input.flowDir,
    },
    {
      strategy: "discharge-percentiles",
      config: {
        minorPercentile: 0,
        majorPercentile: 0,
        minMinorDischarge: input.minorDischarge,
        minMajorDischarge: input.majorDischarge,
      },
    }
  );
  return { accumulated, projected };
}

function count(mask: Uint8Array, value = 1): number {
  let total = 0;
  for (const entry of mask) if (entry === value) total += 1;
  return total;
}

describe("hydrology river system", () => {
  it("accumulates tributaries into a major confluence before the ocean outlet", () => {
    const syntheticDimensions = { width: 5, height: 3 } as const;
    const { width, height } = syntheticDimensions;
    const size = width * height;
    const oceanOutlet = 9;
    const confluence = 7;
    const outletLand = 8;
    const landMask = new Uint8Array(size).fill(1);
    landMask[oceanOutlet] = 0;
    const flowDir = new Int32Array(size).fill(-1);
    flowDir.set([1, 2, 7, 8, -1, 6, 7, 8, 9, -1, 11, 12, 7, 8, -1]);

    const { accumulated, projected } = runRiverSystem({
      width,
      height,
      landMask,
      flowDir,
      rainfall: new Uint8Array(size).fill(10),
      minorDischarge: 60,
      majorDischarge: 110,
    });

    expect(accumulated.discharge[confluence]).toBe(90);
    expect(accumulated.discharge[outletLand]).toBe(120);
    expect(accumulated.outletMask[outletLand]).toBe(1);
    expect(projected.riverClass[confluence]).toBe(2);
    expect(projected.riverClass[outletLand]).toBe(2);
    expect(projected.riverClass[oceanOutlet]).toBe(0);
  });

  it("expresses coastal plains as broad minor channels feeding a major trunk", () => {
    const syntheticDimensions = { width: 6, height: 3 } as const;
    const { width, height } = syntheticDimensions;
    const size = width * height;
    const landMask = new Uint8Array(size).fill(1);
    landMask[17] = 0;
    const flowDir = new Int32Array(size).fill(-1);
    flowDir.set([1, 2, 8, -1, -1, -1, 7, 8, 9, 15, -1, -1, 13, 14, 15, 16, 17, -1]);

    const { accumulated, projected } = runRiverSystem({
      width,
      height,
      landMask,
      flowDir,
      rainfall: new Uint8Array(size).fill(10),
      minorDischarge: 30,
      majorDischarge: 90,
    });

    expect([projected.riverClass[8], projected.riverClass[15], projected.riverClass[16]]).toEqual([
      2, 2, 2,
    ]);
    expect(projected.riverClass[7]).toBe(0);
    expect(projected.riverClass[14]).toBe(1);
    expect(accumulated.outletMask[16]).toBe(1);
    expect(accumulated.discharge[16]).toBe(120);
  });

  it("turns matched wetter and drier catchments into different river classes", () => {
    const syntheticDimensions = { width: 3, height: 2 } as const;
    const { width, height } = syntheticDimensions;
    const size = width * height;
    const { accumulated, projected } = runRiverSystem({
      width,
      height,
      landMask: new Uint8Array(size).fill(1),
      flowDir: new Int32Array([1, 2, -1, 4, 5, -1]),
      rainfall: new Uint8Array([40, 40, 40, 8, 8, 8]),
      minorDischarge: 40,
      majorDischarge: 100,
    });

    expect(accumulated.runoff[0]).toBeGreaterThan(accumulated.runoff[3] ?? 0);
    expect(accumulated.discharge[2]).toBe(120);
    expect(accumulated.discharge[5]).toBe(24);
    expect(projected.riverClass[2]).toBe(2);
    expect(projected.riverClass[5]).toBe(0);
  });

  it("keeps arid interior plateaus below river thresholds even when routing is valid", () => {
    const syntheticDimensions = { width: 5, height: 1 } as const;
    const { width, height } = syntheticDimensions;
    const size = width * height;
    const { accumulated, projected } = runRiverSystem({
      width,
      height,
      landMask: new Uint8Array(size).fill(1),
      flowDir: new Int32Array([1, 2, 3, 4, -1]),
      rainfall: new Uint8Array(size).fill(2),
      minorDischarge: 20,
      majorDischarge: 60,
    });

    expect(count(accumulated.sinkMask)).toBe(1);
    expect(accumulated.discharge[4]).toBe(10);
    expect(count(projected.riverClass)).toBe(0);
  });
});
