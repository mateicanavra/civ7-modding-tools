import { describe, expect, it } from "bun:test";

import hydrologyOpsPublic from "@mapgen/domain/hydrology/ops";

const { projectRiverNetwork } = hydrologyOpsPublic.ops;
describe("hydrology/project-river-network (default strategy)", () => {
  it("produces no rivers when all land discharge is zero", () => {
    const width = 4;
    const height = 3;
    const size = width * height;

    const out = projectRiverNetwork.run(
      {
        width,
        height,
        landMask: new Uint8Array(size).fill(1),
        discharge: new Float32Array(size).fill(0),
        flowDir: new Int32Array(size).fill(-1),
      },
      {
        strategy: "default",
        config: {
        minorPercentile: 0.85,
        majorPercentile: 0.95,
        minMinorDischarge: 0,
        minMajorDischarge: 0,
        },
      }
    );

    expect(Array.from(out.riverClass)).toEqual(new Array(size).fill(0));
    expect(out.minorThreshold).toBe(0);
    expect(out.majorThreshold).toBe(0);
  });

  it("does not classify zero-discharge land as rivers when thresholds are derived from positives", () => {
    const width = 4;
    const height = 3;
    const size = width * height;

    const discharge = new Float32Array(size).fill(0);
    discharge[0] = 10;

    const out = projectRiverNetwork.run(
      {
        width,
        height,
        landMask: new Uint8Array(size).fill(1),
        discharge,
        flowDir: new Int32Array(size).fill(-1),
      },
      {
        strategy: "default",
        config: {
        minorPercentile: 0.85,
        majorPercentile: 0.95,
        minMinorDischarge: 0,
        minMajorDischarge: 0,
        },
      }
    );

    expect(out.minorThreshold).toBe(10);
    expect(out.majorThreshold).toBe(10);
    expect(out.riverClass[0]).toBe(2);
    expect(Array.from(out.riverClass.slice(1))).toEqual(new Array(size - 1).fill(0));
  });

  it("extends major-river truth upstream along the strongest routed minor trunk", () => {
    const width = 6;
    const height = 1;
    const size = width * height;
    const landMask = new Uint8Array(size).fill(1);
    const discharge = new Float32Array([30, 40, 70, 50, 90, 120]);
    const flowDir = new Int32Array([2, 2, 4, 4, 5, -1]);

    const out = projectRiverNetwork.run(
      {
        width,
        height,
        landMask,
        discharge,
        flowDir,
      },
      {
        strategy: "default",
        config: {
        minorPercentile: 0,
        majorPercentile: 1,
        minMinorDischarge: 30,
        minMajorDischarge: 120,
        },
      }
    );

    expect(out.minorThreshold).toBe(30);
    expect(out.majorThreshold).toBe(120);
    expect(Array.from(out.riverClass)).toEqual([1, 2, 2, 1, 2, 2]);
  });
});
