import { describe, expect, it } from "bun:test";
import hydrology from "@mapgen/domain/hydrology/router";

const { accumulateDischarge } = hydrology.hydrography.ops;
const SIMPLE_DISCHARGE_CONFIG = {
  runoffScale: 1,
  infiltrationFraction: 0,
  humidityDampening: 0,
  minRunoff: 0,
};

function runAccumulateDischarge(
  input: Parameters<typeof accumulateDischarge.run>[0],
  config: (typeof accumulateDischarge.defaultConfig)["config"] = SIMPLE_DISCHARGE_CONFIG
) {
  return accumulateDischarge.run(input, { strategy: "topological-runoff", config });
}

function dischargeFor(input: {
  width: number;
  height: number;
  landMask?: Uint8Array;
  flowDir: Int32Array;
  rainfall?: Uint8Array;
}) {
  const size = input.width * input.height;
  return runAccumulateDischarge({
    width: input.width,
    height: input.height,
    landMask: input.landMask ?? new Uint8Array(size).fill(1),
    flowDir: input.flowDir,
    rainfall: input.rainfall ?? new Uint8Array(size).fill(10),
    humidity: new Uint8Array(size),
  });
}

function count(mask: Uint8Array, value = 1): number {
  let total = 0;
  for (const entry of mask) if (entry === value) total += 1;
  return total;
}

describe("hydrology discharge accumulation networks", () => {
  it("routes a tilted island plane to coastal outlets without inventing interior sinks", () => {
    const syntheticDimensions = { width: 4, height: 3 } as const;
    const { width, height } = syntheticDimensions;
    const size = width * height;
    const landMask = new Uint8Array(size).fill(1);
    for (const ocean of [3, 7, 11]) landMask[ocean] = 0;

    const flowDir = new Int32Array(size).fill(-1);
    for (const row of [0, 4, 8]) {
      flowDir[row] = row + 1;
      flowDir[row + 1] = row + 2;
      flowDir[row + 2] = row + 3;
    }

    const result = dischargeFor({ width, height, landMask, flowDir });

    expect(count(result.sinkMask)).toBe(0);
    expect(Array.from(result.outletMask)).toEqual([0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0]);
    expect([result.discharge[2], result.discharge[6], result.discharge[10]]).toEqual([30, 30, 30]);
  });

  it("keeps a central ridge as a basin divide with separate left and right outlets", () => {
    const syntheticDimensions = { width: 5, height: 3 } as const;
    const { width, height } = syntheticDimensions;
    const size = width * height;
    const landMask = new Uint8Array(size).fill(1);
    for (const ocean of [0, 4, 5, 9, 10, 14]) landMask[ocean] = 0;

    const flowDir = new Int32Array(size).fill(-1);
    flowDir.set([-1, 0, 1, 4, -1, -1, 5, 8, 9, -1, -1, 10, 11, 14, -1]);

    const result = dischargeFor({ width, height, landMask, flowDir });

    expect(count(result.sinkMask)).toBe(0);
    expect(Array.from(result.outletMask)).toEqual([0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0]);
  });

  it("changes water supply without moving drainage topology", () => {
    const syntheticDimensions = { width: 5, height: 1 } as const;
    const { width, height } = syntheticDimensions;
    const size = width * height;
    const input = {
      width,
      height,
      landMask: new Uint8Array(size).fill(1),
      flowDir: new Int32Array([1, 2, 3, 4, -1]),
      rainfall: new Uint8Array(size).fill(20),
      humidity: new Uint8Array(size),
    };

    const wet = runAccumulateDischarge(input);
    const dry = runAccumulateDischarge(input, {
      ...SIMPLE_DISCHARGE_CONFIG,
      runoffScale: 0.5,
    });

    expect(dry.sinkMask).toEqual(wet.sinkMask);
    expect(dry.outletMask).toEqual(wet.outletMask);
    expect(dry.discharge[4]).toBeCloseTo((wet.discharge[4] ?? 0) * 0.5, 6);
  });
});
