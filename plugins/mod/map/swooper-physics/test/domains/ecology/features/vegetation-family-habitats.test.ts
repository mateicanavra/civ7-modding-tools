import { describe, expect, it } from "bun:test";
import ecology from "../../../../src/domain/ecology/router.js";
import { normalizeOperationSelectionForTest } from "@swooper/mapgen-core/testing";
import { TEST_MAP_SIZE } from "../../../setup.js";

describe("ecology vegetation-family habitats", () => {
  it("does not double-penalize cold and dry habitats through shared biomass stress", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const landMask = new Uint8Array(size).fill(1);
    const fertility01 = new Float32Array(size).fill(0.6);
    const taigaEnergy01 = new Float32Array(size).fill(0.8);
    taigaEnergy01[0] = 0.28;
    const taigaColdStress01 = new Float32Array(size).fill(0.05);
    taigaColdStress01[0] = 0.65;
    const sagebrushWater01 = new Float32Array(size).fill(0.8);
    sagebrushWater01[0] = 0.2;
    const sagebrushWaterStress01 = new Float32Array(size).fill(0.05);
    sagebrushWaterStress01[0] = 0.75;

    const taiga = ecology.features.ops.scoreVegetationTaiga.run(
      {
        width,
        height,
        landMask,
        energy01: taigaEnergy01,
        water01: new Float32Array(size).fill(0.48),
        waterStress01: new Float32Array(size).fill(0.1),
        coldStress01: taigaColdStress01,
        biomass01: new Float32Array(size).fill(0.12),
        fertility01,
      },
      normalizeOperationSelectionForTest(
        ecology.features.ops.scoreVegetationTaiga,
        ecology.features.ops.scoreVegetationTaiga.defaultConfig
      )
    ).score01;

    const sagebrush = ecology.features.ops.scoreVegetationSagebrushSteppe.run(
      {
        width,
        height,
        landMask,
        energy01: new Float32Array(size).fill(0.55),
        water01: sagebrushWater01,
        waterStress01: sagebrushWaterStress01,
        coldStress01: new Float32Array(size),
        biomass01: new Float32Array(size).fill(0.12),
        fertility01,
      },
      normalizeOperationSelectionForTest(
        ecology.features.ops.scoreVegetationSagebrushSteppe,
        ecology.features.ops.scoreVegetationSagebrushSteppe.defaultConfig
      )
    ).score01;

    expect(taiga[0]).toBeGreaterThan(0.1);
    expect(taiga[1]).toBeLessThan(taiga[0]);
    expect(sagebrush[0]).toBeGreaterThan(0.05);
    expect(sagebrush[1]).toBe(0);
  });
});
