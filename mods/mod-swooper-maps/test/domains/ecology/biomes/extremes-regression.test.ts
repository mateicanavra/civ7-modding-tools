import { describe, expect, it } from "bun:test";
import ecology from "@mapgen/domain/ecology/ops";
import { runAdmittedOperationForTest } from "@swooper/mapgen-core/testing";

describe("ecology defaults regression", () => {
  it("does not freeze all oceans by default", () => {
    const syntheticDimensions = { width: 2, height: 1 } as const;
    const { width, height } = syntheticDimensions;
    const result = runAdmittedOperationForTest(
      ecology.ops.classifyBiomes,
      {
        width,
        height,
        effectiveMoisture: new Float32Array([0, 0]),
        surfaceTemperatureC: new Float32Array([20, 0]),
        aridityIndex: new Float32Array([0, 0]),
        freezeIndex: new Float32Array([0, 0]),
        landMask: new Uint8Array([0, 0]),
        soilType: new Uint8Array([0, 0]),
        fertility: new Float32Array([0, 0]),
      },
      ecology.ops.classifyBiomes.defaultConfig
    );

    expect(result.surfaceTemperature[0]).toBeGreaterThan(result.surfaceTemperature[1]);
  });

  it("does not place marsh when all wetland confidences are zero", () => {
    const syntheticDimensions = { width: 1, height: 1 } as const;
    const { width, height } = syntheticDimensions;
    const result = runAdmittedOperationForTest(
      ecology.ops.planWetlands,
      {
        width,
        height,
        seed: 0,
        scoreMarsh01: new Float32Array([0]),
        scoreTundraBog01: new Float32Array([0]),
        scoreMangrove01: new Float32Array([0]),
        scoreOasis01: new Float32Array([0]),
        scoreWateringHole01: new Float32Array([0]),
        flatLandMask: new Uint8Array([1]),
        featureOccupancyMask: new Uint8Array([0]),
        reserved: new Uint8Array([0]),
      },
      ecology.ops.planWetlands.defaultConfig
    );

    expect(result.placements).toHaveLength(0);
  });

  it("treats effectiveMoisture in consistent units for vegetation weights", () => {
    const syntheticDimensions = { width: 1, height: 1 } as const;
    const { width, height } = syntheticDimensions;
    const substrate = runAdmittedOperationForTest(
      ecology.ops.computeVegetationSubstrate,
      {
        width,
        height,
        landMask: new Uint8Array([1]),
        effectiveMoisture: new Float32Array([120]),
        surfaceTemperature: new Float32Array([15]),
        aridityIndex: new Float32Array([0.2]),
        freezeIndex: new Float32Array([0.05]),
        vegetationDensity: new Float32Array([0.6]),
        fertility: new Float32Array([0]),
      },
      ecology.ops.computeVegetationSubstrate.defaultConfig
    );

    const result = runAdmittedOperationForTest(
      ecology.ops.scoreVegetationForest,
      {
        width,
        height,
        landMask: new Uint8Array([1]),
        ...substrate,
      },
      ecology.ops.scoreVegetationForest.defaultConfig
    );

    const score = result.score01[0];
    expect(typeof score).toBe("number");
    expect(Number.isFinite(score)).toBe(true);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThan(0.95);
  });
});
