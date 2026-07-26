import { describe, expect, it } from "bun:test";
import ecology from "@mapgen/domain/ecology/router";
import { normalizeOperationSelectionForTest } from "@swooper/mapgen-core/testing";
import { TEST_MAP_SIZE } from "../../../setup.js";

describe("ecology vegetation moisture flow", () => {
  it("carries Hydrology-scale effective moisture into a viable unsaturated forest score", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const effectiveMoisture = 120;
    const substrate = ecology.features.ops.computeVegetationSubstrate.run(
      {
        width,
        height,
        landMask: new Uint8Array(size).fill(1),
        effectiveMoisture: new Float32Array(size).fill(effectiveMoisture),
        surfaceTemperature: new Float32Array(size).fill(20),
        aridityIndex: new Float32Array(size).fill(0.2),
        freezeIndex: new Float32Array(size).fill(0.05),
        vegetationDensity: new Float32Array(size).fill(0.6),
        fertility: new Float32Array(size).fill(0.5),
      },
      normalizeOperationSelectionForTest(
        ecology.features.ops.computeVegetationSubstrate,
        ecology.features.ops.computeVegetationSubstrate.defaultConfig
      )
    );

    const forest = ecology.features.ops.scoreVegetationForest.run(
      {
        width,
        height,
        landMask: new Uint8Array(size).fill(1),
        ...substrate,
      },
      normalizeOperationSelectionForTest(
        ecology.features.ops.scoreVegetationForest,
        ecology.features.ops.scoreVegetationForest.defaultConfig
      )
    );

    expect(substrate.water01[0]).toBeCloseTo(effectiveMoisture / 230, 6);
    expect(forest.score01[0]).toBeGreaterThan(0);
    expect(forest.score01[0]).toBeLessThan(1);
  });
});
