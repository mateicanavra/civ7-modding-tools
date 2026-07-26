import { describe, expect, it } from "bun:test";

import morphology from "@mapgen/domain/morphology/router";
import { deriveStepSeed } from "@swooper/mapgen-core";
import { TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../../../setup.js";

const { computeBaseTopography } = morphology.terrain.ops;

function median(values: readonly number[]): number {
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.floor(sorted.length / 2)] ?? 0;
}

describe("compute-base-topography crust baseline", () => {
  it("separates continental and oceanic relief without tectonic uplift or rifting", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const continentalMask = new Uint8Array(size);
    const crustBaseElevation = new Float32Array(size);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x;
        const continental =
          y > height * 0.2 && y < height * 0.8 && x > width * 0.2 && x < width * 0.8;
        continentalMask[index] = continental ? 1 : 0;
        crustBaseElevation[index] = continental ? 0.8 : 0.2;
      }
    }

    const { elevation } = computeBaseTopography.run(
      {
        width,
        height,
        crustBaseElevation,
        boundaryCloseness: new Uint8Array(size),
        upliftPotential: new Uint8Array(size),
        riftPotential: new Uint8Array(size),
        rngSeed: deriveStepSeed(TEST_MAP_SEED, "test:morphology:base-topography"),
      },
      {
        ...computeBaseTopography.defaultConfig,
        config: {
          ...computeBaseTopography.defaultConfig.config,
          crustNoiseAmplitude: 0,
        },
      }
    );

    const continentalElevation: number[] = [];
    const oceanicElevation: number[] = [];
    for (let index = 0; index < size; index++) {
      const target = continentalMask[index] === 1 ? continentalElevation : oceanicElevation;
      target.push(elevation[index] ?? 0);
    }

    expect(continentalElevation.length).toBeGreaterThan(0);
    expect(oceanicElevation.length).toBeGreaterThan(0);
    expect(median(continentalElevation)).toBeGreaterThan(median(oceanicElevation));
  });
});
