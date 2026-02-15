import { describe, expect, it } from "bun:test";

import ecology from "@mapgen/domain/ecology/ops";
import { runOpValidated } from "../support/compiler-helpers.js";

describe("ecology defaults regression", () => {
  it("does not freeze all oceans by default", () => {
    const result = runOpValidated(
      ecology.ops.classifyBiomes,
      {
        width: 2,
        height: 1,
        rainfall: new Uint8Array([0, 0]),
        humidity: new Uint8Array([0, 0]),
        surfaceTemperatureC: new Float32Array([20, 0]),
        aridityIndex: new Float32Array([0, 0]),
        freezeIndex: new Float32Array([0, 0]),
        landMask: new Uint8Array([0, 0]),
        riverClass: new Uint8Array([0, 0]),
      },
      { strategy: "default", config: { riparian: {} } }
    );

    expect(result.surfaceTemperature[0]).toBeGreaterThan(result.surfaceTemperature[1]);
  });

  it("does not place marsh everywhere at typical moisture", () => {
    const result = runOpValidated(
      ecology.ops.planWetlands,
      {
        width: 1,
        height: 1,
        seed: 0,
        scoreMarsh01: new Float32Array([0.2]),
        scoreTundraBog01: new Float32Array([0]),
        scoreMangrove01: new Float32Array([0]),
        scoreOasis01: new Float32Array([0]),
        scoreWateringHole01: new Float32Array([0]),
        featureIndex: new Uint16Array([0]),
        reserved: new Uint8Array([0]),
      },
      { strategy: "default", config: { minScore01: 0.55 } }
    );

    expect(result.placements).toHaveLength(0);
  });

  it("treats effectiveMoisture in consistent units for vegetation weights", () => {
    const substrate = runOpValidated(
      ecology.ops.computeVegetationSubstrate,
      {
        width: 1,
        height: 1,
        landMask: new Uint8Array([1]),
        effectiveMoisture: new Float32Array([120]),
        surfaceTemperature: new Float32Array([15]),
        aridityIndex: new Float32Array([0.2]),
        freezeIndex: new Float32Array([0.05]),
        vegetationDensity: new Float32Array([0.6]),
        fertility: new Float32Array([0]),
      },
      { strategy: "default", config: {} }
    );

    const result = runOpValidated(
      ecology.ops.scoreVegetationForest,
      {
        width: 1,
        height: 1,
        landMask: new Uint8Array([1]),
        ...substrate,
      },
      { strategy: "default", config: {} }
    );

    const score = result.score01[0];
    expect(typeof score).toBe("number");
    expect(Number.isFinite(score)).toBe(true);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThan(0.95);
  });
});
