import { describe, expect, it } from "bun:test";

import hydrologyOpsPublic from "../../../../../../src/domain/hydrology/router.js";

const { projectRiverNetwork } = hydrologyOpsPublic.hydrography.ops;
describe("hydrology/project-river-network (principal adjacent channels)", () => {
  it("keeps incoming principal channels but excludes off-map ports from samples and native classes", () => {
    const input = {
      width: 4,
      height: 1,
      landMask: new Uint8Array(4).fill(1),
      discharge: [10, 20, 1000, 0],
      flowDir: Int32Array.of(1, 2, -1, -2),
    };
    const config = {
      strategy: "discharge-percentiles" as const,
      config: {
        minorPercentile: 0,
        majorPercentile: 1,
        minMinorDischarge: 0,
        minMajorDischarge: 0,
      },
    };
    const output = projectRiverNetwork.run(input, config);
    expect(output.minorThreshold).toBe(10);
    expect(output.majorThreshold).toBe(20);
    expect(Array.from(output.riverClass)).toEqual([2, 2, 0, 0]);
    for (const retired of ["legacy-routed", "principal-adjacent"]) {
      const retiredInput = { ...input, channelSemantics: retired };
      expect(() => projectRiverNetwork.run(retiredInput, config)).toThrow();
    }
    expect(() =>
      projectRiverNetwork.run({ ...input, flowDir: Int32Array.of(2, 2, -1, -2) }, config)
    ).toThrow("adjacent");
    expect(() =>
      projectRiverNetwork.run({ ...input, discharge: [10, NaN, 1000, 0] }, config)
    ).toThrow();
  });
  it("produces no rivers when all land discharge is zero", () => {
    const syntheticDimensions = { width: 4, height: 3 } as const;
    const { width, height } = syntheticDimensions;
    const size = width * height;

    const out = projectRiverNetwork.run(
      {
        width,
        height,
        landMask: new Uint8Array(size).fill(1),
        discharge: new Array<number>(size).fill(0),
        flowDir: new Int32Array(size).fill(-1),
      },
      {
        strategy: "discharge-percentiles",
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
    const syntheticDimensions = { width: 4, height: 3 } as const;
    const { width, height } = syntheticDimensions;
    const size = width * height;

    const discharge = new Float32Array(size).fill(0);
    discharge[0] = 10;

    const out = projectRiverNetwork.run(
      {
        width,
        height,
        landMask: new Uint8Array(size).fill(1),
        discharge: Array.from(discharge),
        flowDir: Int32Array.from({ length: size }, (_, cell) => cell === 0 ? 1 : -1),
      },
      {
        strategy: "discharge-percentiles",
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

  it("extends major-river classification upstream along the strongest routed minor trunk", () => {
    const syntheticDimensions = { width: 3, height: 3 } as const;
    const { width, height } = syntheticDimensions;
    const size = width * height;
    const landMask = new Uint8Array(size).fill(1);
    landMask[8] = 0;
    const discharge = [30, 70, 40, 50, 120, 0, 0, 150, 0];
    const flowDir = Int32Array.of(1, 4, 1, 4, 7, -1, -1, 8, -1);

    const out = projectRiverNetwork.run(
      {
        width,
        height,
        landMask,
        discharge,
        flowDir,
      },
      {
        strategy: "discharge-percentiles",
        config: {
          minorPercentile: 0,
          majorPercentile: 1,
          minMinorDischarge: 30,
          minMajorDischarge: 150,
        },
      }
    );

    expect(out.minorThreshold).toBe(30);
    expect(out.majorThreshold).toBe(150);
    expect(Array.from(out.riverClass)).toEqual([1, 2, 2, 1, 2, 0, 0, 2, 0]);
  });
});
