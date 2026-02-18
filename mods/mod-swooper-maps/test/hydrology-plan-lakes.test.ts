import { describe, expect, it } from "bun:test";

import { defaultStrategy as accumulateDischarge } from "../src/domain/hydrology/ops/accumulate-discharge/strategies/default.js";

describe("hydrology sink classification", () => {
  it("marks terminal land tiles as sinks", () => {
    const width = 4;
    const height = 4;
    const size = width * height;
    const sinkIdx = 6;
    const upstreamIdx = 5;

    const landMask = new Uint8Array(size).fill(1);
    const flowDir = new Int32Array(size).fill(sinkIdx);
    flowDir[sinkIdx] = -1;

    const out = accumulateDischarge.run(
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

    expect(out.sinkMask[sinkIdx]).toBe(1);
    expect(out.sinkMask[upstreamIdx]).toBe(0);
  });

  it("keeps sink and outlet classes disjoint", () => {
    const width = 3;
    const height = 3;
    const size = width * height;

    const landMask = new Uint8Array([1, 1, 1, 1, 1, 1, 1, 1, 0]);
    const flowDir = new Int32Array([
      1, 2, 5,
      4, -1, 8,
      7, 4, -1,
    ]);

    const out = accumulateDischarge.run(
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
      expect((out.sinkMask[i] ?? 0) & (out.outletMask[i] ?? 0)).toBe(0);
    }
    expect(out.sinkMask[4]).toBe(1);
    expect(out.outletMask[5]).toBe(1);
  });
});
