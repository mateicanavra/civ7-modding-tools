import { describe, expect, it } from "bun:test";

import morphology from "@mapgen/domain/morphology/router";
import { deriveStepSeed } from "@swooper/mapgen-core";
import { TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../../../setup.js";

const { computeSeaLevel } = morphology.terrain.ops;

describe("compute-sea-level hypsometry", () => {
  it("moves off the initial water target when its continental-land share is too low", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const elevation = new Int16Array(size);
    const crustType = new Uint8Array(size);
    const continentalTarget = 0.65;

    for (let index = 0; index < size; index++) {
      const rank = size <= 1 ? 0 : index / (size - 1);
      elevation[index] = index;
      crustType[index] = rank >= 0.8 ? 1 : 0;
    }

    const run = (continentalFraction: number) =>
      computeSeaLevel.run(
        {
          width,
          height,
          elevation,
          crustType,
          boundaryCloseness: new Uint8Array(size),
          upliftPotential: new Uint8Array(size),
          rngSeed: deriveStepSeed(TEST_MAP_SEED, "test:morphology:sea-level"),
        },
        {
          ...computeSeaLevel.defaultConfig,
          config: {
            ...computeSeaLevel.defaultConfig.config,
            targetWaterPercent: 50,
            targetScalar: 1,
            variance: 0,
            boundaryShareTarget: 0,
            continentalFraction,
          },
        }
      ).seaLevel;

    const measure = (seaLevel: number) => {
      let landCount = 0;
      let waterCount = 0;
      let continentalLandCount = 0;
      for (let index = 0; index < size; index++) {
        if ((elevation[index] ?? 0) <= seaLevel) {
          waterCount++;
          continue;
        }
        landCount++;
        if (crustType[index] === 1) continentalLandCount++;
      }
      return {
        continentalLandShare: continentalLandCount / landCount,
        waterShare: waterCount / size,
      };
    };

    const unconstrainedSeaLevel = run(0);
    const constrainedSeaLevel = run(continentalTarget);
    const unconstrained = measure(unconstrainedSeaLevel);
    const constrained = measure(constrainedSeaLevel);

    expect(unconstrained.continentalLandShare).toBeLessThan(continentalTarget);
    expect(constrainedSeaLevel).toBeGreaterThan(unconstrainedSeaLevel);
    expect(constrained.continentalLandShare).toBeGreaterThanOrEqual(continentalTarget);
    expect(constrained.waterShare).toBeGreaterThan(unconstrained.waterShare);
  });
});
