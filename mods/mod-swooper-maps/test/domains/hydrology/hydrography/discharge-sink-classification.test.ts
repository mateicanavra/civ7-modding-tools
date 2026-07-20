import { describe, expect, it } from "bun:test";

import hydrologyOpsPublic from "@mapgen/domain/hydrology/ops";

const { accumulateDischarge } = hydrologyOpsPublic.ops;
describe("hydrology sink classification", () => {
  it("marks terminal land tiles as sinks", () => {
    const syntheticDimensions = { width: 4, height: 4 } as const;
    const { width, height } = syntheticDimensions;
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
        strategy: "default",
        config: {
          runoffScale: 1,
          infiltrationFraction: 0.15,
          humidityDampening: 0.25,
          minRunoff: 0,
        },
      }
    );

    expect(out.sinkMask[sinkIdx]).toBe(1);
    expect(out.sinkMask[upstreamIdx]).toBe(0);
  });

  it("keeps sink and outlet classes disjoint", () => {
    const syntheticDimensions = { width: 3, height: 3 } as const;
    const { width, height } = syntheticDimensions;
    const size = width * height;

    const landMask = new Uint8Array([1, 1, 1, 1, 1, 1, 1, 1, 0]);
    const flowDir = new Int32Array([1, 2, 5, 4, -1, 8, 7, 4, -1]);

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
        strategy: "default",
        config: {
          runoffScale: 1,
          infiltrationFraction: 0.15,
          humidityDampening: 0.25,
          minRunoff: 0,
        },
      }
    );

    for (let i = 0; i < size; i++) {
      expect((out.sinkMask[i] ?? 0) & (out.outletMask[i] ?? 0)).toBe(0);
    }
    expect(out.sinkMask[4]).toBe(1);
    expect(out.outletMask[5]).toBe(1);
  });
});
