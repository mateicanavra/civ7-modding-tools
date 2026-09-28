import { describe, expect, it } from "bun:test";
import { normalizeOperationSelectionForTest } from "@swooper/mapgen-core/testing";
import ecology from "../../../../../../src/domain/ecology/router.js";
import { TEST_MAP_SIZE } from "../../../../../setup.js";

function warmHabitatFields() {
  const { width, height } = TEST_MAP_SIZE.dimensions;
  const size = width * height;
  return {
    width,
    height,
    landMask: new Uint8Array(size).fill(1),
    energy01: new Float32Array(size).fill(0.8),
    water01: new Float32Array(size).fill(0.9),
    waterStress01: new Float32Array(size).fill(0.1),
    coldStress01: new Float32Array(size).fill(0.05),
    biomass01: new Float32Array(size).fill(0.8),
    fertility01: new Float32Array(size).fill(0.5),
  };
}

function score(input: ReturnType<typeof warmHabitatFields>): Float32Array {
  return ecology.features.ops.scoreVegetationRainforest.run(
    input,
    normalizeOperationSelectionForTest(
      ecology.features.ops.scoreVegetationRainforest,
      ecology.features.ops.scoreVegetationRainforest.defaultConfig
    )
  ).score01;
}

describe("rainforest suitability", () => {
  it("increases with water availability and stays saturated through water01=1", () => {
    const input = warmHabitatFields();
    input.water01.set([0.62, 0.7, 0.8, 0.9, 1]);

    const scores = score(input);
    const fullyWetScore = 0.8 * 0.9 * 0.95;

    expect(scores[0]).toBeCloseTo(0, 6);
    expect(scores[1]).toBeCloseTo(fullyWetScore * 0.5, 6);
    expect(scores[2]).toBeCloseTo(fullyWetScore, 6);
    for (let i = 1; i < 5; i++) {
      expect(scores[i]).toBeGreaterThanOrEqual(scores[i - 1]!);
    }
    expect(scores[3]).toBe(scores[2]);
    expect(scores[4]).toBe(scores[2]);
  });

  it("preserves thermal suitability, stress attenuation, biomass, and the land mask", () => {
    const input = warmHabitatFields();
    input.energy01[1] = 0.5;
    input.energy01[2] = 1;
    input.waterStress01[3] = 1;
    input.coldStress01[4] = 1;
    input.biomass01[5] = 0;
    input.biomass01[6] = 0.4;
    input.landMask[7] = 0;

    const scores = score(input);

    expect(scores[0]).toBeCloseTo(0.8 * 0.9 * 0.95, 6);
    expect(scores[1]).toBe(0);
    expect(scores[2]).toBeGreaterThan(0);
    expect(scores[2]).toBeLessThan(scores[0]!);
    expect(scores[3]).toBe(0);
    expect(scores[4]).toBe(0);
    expect(scores[5]).toBe(0);
    expect(scores[6]).toBeCloseTo(scores[0]! * 0.5, 6);
    expect(scores[7]).toBe(0);
  });
});
