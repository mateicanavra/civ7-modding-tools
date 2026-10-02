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
    expect(Array.from(output.riverClass)).toEqual([1, 2, 0, 0]);
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
        flowDir: Int32Array.from({ length: size }, (_, cell) => (cell === 0 ? 1 : -1)),
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

  it("keeps weaker upstream channels minor instead of extending navigable heads to them", () => {
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
    expect(Array.from(out.riverClass)).toEqual([1, 1, 1, 1, 1, 0, 0, 2, 0]);
  });

  it("retains every supported tributary and a dry outlet beyond a wet body", () => {
    const input = {
      width: 3,
      height: 3,
      landMask: Uint8Array.of(1, 1, 1, 1, 1, 0, 0, 1, 0),
      discharge: [10, 80, 60, 40, 120, 200, 0, 160, 0],
      flowDir: Int32Array.of(1, 4, 1, 4, 5, -2, -1, 8, -1),
    };
    const before = structuredClone(input);
    const output = projectRiverNetwork.run(input, {
      strategy: "discharge-percentiles",
      config: {
        minorPercentile: 0,
        majorPercentile: 0,
        minMinorDischarge: 10,
        minMajorDischarge: 60,
      },
    });
    expect(output.minorThreshold).toBe(10);
    expect(output.majorThreshold).toBe(60);
    expect(Array.from(output.riverClass)).toEqual([1, 2, 2, 1, 2, 0, 0, 2, 0]);
    expect(input).toEqual(before);
    for (let cell = 0; cell < input.discharge.length; cell++) {
      if (output.riverClass[cell]! >= 2)
        expect(input.discharge[cell]).toBeGreaterThanOrEqual(output.majorThreshold);
    }
  });

  it("does not require an endpoint walker when supplied adjacent sources form a cycle", () => {
    const output = projectRiverNetwork.run(
      {
        width: 2,
        height: 1,
        landMask: Uint8Array.of(1, 1),
        discharge: [60, 80],
        flowDir: Int32Array.of(1, 0),
      },
      {
        strategy: "discharge-percentiles",
        config: {
          minorPercentile: 0,
          majorPercentile: 0,
          minMinorDischarge: 10,
          minMajorDischarge: 60,
        },
      }
    );
    // Whole-network acyclicity belongs to the drainage owner, not class selection.
    expect(Array.from(output.riverClass)).toEqual([2, 2]);
  });

  it("preserves Number-precision thresholds and classifies every tied supported source", () => {
    const output = projectRiverNetwork.run(
      {
        width: 5,
        height: 1,
        landMask: Uint8Array.of(1, 1, 1, 1, 0),
        discharge: [100000000, 100000001, 100000001, 100000002, 0],
        flowDir: Int32Array.of(1, 2, 3, 4, -1),
      },
      {
        strategy: "discharge-percentiles",
        config: {
          minorPercentile: 0,
          majorPercentile: 0.5,
          minMinorDischarge: 0,
          minMajorDischarge: 0,
        },
      }
    );
    expect(output.minorThreshold).toBe(100000000);
    expect(output.majorThreshold).toBe(100000001);
    expect(Array.from(output.riverClass)).toEqual([1, 2, 2, 2, 0]);
  });

  it("keeps major support nested when authored percentile and floor controls cross", () => {
    const output = projectRiverNetwork.run(
      {
        width: 4,
        height: 1,
        landMask: Uint8Array.of(1, 1, 1, 0),
        discharge: [10, 10, 20, 1000],
        flowDir: Int32Array.of(1, 2, 3, -2),
      },
      {
        strategy: "discharge-percentiles",
        config: {
          minorPercentile: 1,
          majorPercentile: 0,
          minMinorDischarge: 15,
          minMajorDischarge: 1,
        },
      }
    );
    expect(output.minorThreshold).toBe(20);
    expect(output.majorThreshold).toBe(20);
    expect(Array.from(output.riverClass)).toEqual([0, 0, 2, 0]);
  });

  it("excludes wet sources even when they carry high positive discharge", () => {
    const output = projectRiverNetwork.run(
      {
        width: 2,
        height: 1,
        landMask: new Uint8Array(2),
        discharge: [60, 80],
        flowDir: Int32Array.of(1, 0),
      },
      {
        strategy: "discharge-percentiles",
        config: {
          minorPercentile: 0,
          majorPercentile: 0,
          minMinorDischarge: 10,
          minMajorDischarge: 60,
        },
      }
    );
    expect(output.minorThreshold).toBe(10);
    expect(output.majorThreshold).toBe(60);
    expect(Array.from(output.riverClass)).toEqual([0, 0]);
  });
});
