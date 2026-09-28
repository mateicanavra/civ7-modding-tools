import { describe, expect, it } from "bun:test";
import { deriveStepSeed } from "@swooper/mapgen-core";
import {
  forEachHexNeighborOddQ,
  HEX_WIDTH,
  projectOddqToHexSpace,
} from "@swooper/mapgen-core/lib/grid";
import { PerlinNoise } from "@swooper/mapgen-core/lib/noise";

import { DEFAULT_ELEVATION_SCALE } from "../../../../../../src/domain/morphology/model/policy/elevation-scale.js";
import morphology from "../../../../../../src/domain/morphology/router.js";

const { computeBaseTopography } = morphology.terrain.ops;
const defaultConfig = computeBaseTopography.defaultConfig.config;
const WIDTH = 64;
const HEIGHT = 32;

function neighborDifferenceEnergy(values: ArrayLike<number>, width: number): number {
  let energy = 0;
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < width; x++) {
      const value = values[y * width + x];
      forEachHexNeighborOddQ(x, y, width, HEIGHT, (nx, ny) => {
        energy += (value - values[ny * width + nx]) ** 2;
      });
    }
  }
  return energy;
}

function flatInput(seed: number, closeness = 255, width = WIDTH, height = HEIGHT) {
  return {
    width,
    height,
    crustBaseElevation: new Float32Array(width * height).fill(0.5),
    boundaryCloseness: new Uint8Array(width * height).fill(closeness),
    upliftPotential: new Uint8Array(width * height),
    riftPotential: new Uint8Array(width * height),
    rngSeed: seed,
  };
}

function noiseOnlyConfig(
  crustAmplitude: number,
  arcAmplitude: number,
  grain = defaultConfig.tectonics.fractalGrain
) {
  return {
    ...computeBaseTopography.defaultConfig,
    config: {
      ...defaultConfig,
      continentalHeight: 0.5,
      oceanicHeight: -0.5,
      crustEdgeBlend: 0,
      crustNoiseAmplitude: crustAmplitude,
      tectonics: {
        ...defaultConfig.tectonics,
        boundaryArcNoiseWeight: arcAmplitude,
        fractalGrain: grain,
      },
    },
  };
}

function runCrustNoise(seed: number, width = WIDTH, grain = 4) {
  return computeBaseTopography.run(flatInput(seed, 0, width), noiseOnlyConfig(1, 0, grain))
    .elevation;
}

describe("compute-base-topography coherent relief", () => {
  it("is deterministic across repeated runs, retains variation within a grain, and is independent of map height", () => {
    const values = runCrustNoise(42);
    runCrustNoise(1018);
    expect(runCrustNoise(42)).toEqual(values);
    expect(new Set(values.slice(6 * WIDTH, 6 * WIDTH + 4)).size).toBeGreaterThan(1);

    const taller = computeBaseTopography.run(
      flatInput(42, 0, WIDTH, HEIGHT * 2),
      noiseOnlyConfig(1, 0)
    ).elevation;
    expect(Array.from(taller.slice(0, values.length))).toEqual(Array.from(values));
  });

  it("changes quantized samples when any of the 32 seed bits changes", () => {
    const seed = 0x12345678;
    const baseline = runCrustNoise(seed);

    for (let bit = 0; bit < 32; bit++) {
      const changed = runCrustNoise(seed ^ (1 << bit));
      const changedCount = changed.filter((value, index) => value !== baseline[index]).length;
      expect(changedCount).toBeGreaterThan(baseline.length / 2);
    }

    expect(runCrustNoise(-1)).toEqual(runCrustNoise(0xffffffff));
  });

  it("bounds horizontal neighbor differences, including the seam, by the coherent-field slope", () => {
    const grain = 64;
    // Perlin gradients have components <= 1 and corner values <= 2; max fade' is 15/8.
    // The cylinder tangent has L1 norm <= sqrt(2)/grain. Add one unit for rounding both ends.
    const maxJump = (DEFAULT_ELEVATION_SCALE * 0.5 * (1 + 4 * (15 / 8)) * Math.SQRT2) / grain + 1;
    for (const seed of [1, 42, 1018]) {
      for (const width of [17, 64, 128]) {
        const values = runCrustNoise(seed, width, grain);
        let largestJump = 0;
        for (let y = 0; y < HEIGHT; y++) {
          for (let x = 0; x < width; x++) {
            largestJump = Math.max(
              largestJump,
              Math.abs(values[y * width + x] - values[y * width + ((x + 1) % width)])
            );
          }
        }
        expect(largestJump).toBeLessThanOrEqual(maxJump);
      }
    }
  });

  it("rounds grain to whole tiles and makes larger grain coarser", () => {
    expect(runCrustNoise(42, WIDTH, 4.4)).toEqual(runCrustNoise(42, WIDTH, 4));
    expect(runCrustNoise(42, WIDTH, 4.5)).toEqual(runCrustNoise(42, WIDTH, 5));
    expect(neighborDifferenceEnergy(runCrustNoise(42, WIDTH, 64), WIDTH)).toBeLessThan(
      neighborDifferenceEnergy(runCrustNoise(42, WIDTH, 4), WIDTH)
    );
  });

  for (const seed of [1, 42, 1018]) {
    it(`retains bounded variation with lower hex-neighbor differences than shuffled noise, seed ${seed}`, () => {
      for (const width of [64, 128]) {
        for (const grain of [3, 4, 64]) {
          const values = Array.from(runCrustNoise(seed, width, grain));
          // An odd multiplier permutes these power-of-two grids without changing their distribution.
          const shuffled = values.map((_, index) => values[(index * 997) % values.length]);
          expect(Math.min(...values)).toBeGreaterThanOrEqual(-0.5 * DEFAULT_ELEVATION_SCALE);
          expect(Math.max(...values)).toBeLessThanOrEqual(0.5 * DEFAULT_ELEVATION_SCALE);
          expect(Math.max(...values)).toBeGreaterThan(Math.min(...values));
          expect(neighborDifferenceEnergy(values, width)).toBeLessThan(
            neighborDifferenceEnergy(shuffled, width)
          );
        }
      }
    });
  }
});

describe("compute-base-topography coherent noise integration", () => {
  it("uses independently seeded Perlin fields at tile-scaled cylinder and hex-row coordinates", () => {
    const seed = 0x12345678;
    for (const width of [64, 128]) {
      for (const grain of [4, 64]) {
        const input = flatInput(seed, 255, width);
        const crust = computeBaseTopography.run(input, noiseOnlyConfig(1, 0, grain)).elevation;
        const arc = computeBaseTopography.run(input, noiseOnlyConfig(0, 1, grain)).elevation;
        expect(crust).not.toEqual(arc);

        for (const [label, actual] of [
          ["base-topography", crust],
          ["boundary-arc", arc],
        ] as const) {
          const noise = PerlinNoise.fromFullSeed(deriveStepSeed(seed, label));
          const radius = width / (2 * Math.PI * grain);
          const z = projectOddqToHexSpace(0, 2).y / (HEX_WIDTH * grain);
          // Cardinal positions have known cylinder coordinates without reproducing the sampler.
          const referencePoints = [
            [0, 2, radius, 0, z],
            [width / 4, 2, 0, radius, z],
            [width / 2, 2, -radius, 0, z],
            [(width * 3) / 4, 2, 0, -radius, z],
          ];
          const oddRow = projectOddqToHexSpace(0, 3);
          const oddAngle = (oddRow.x / (HEX_WIDTH * width)) * 2 * Math.PI;
          referencePoints.push([
            0,
            3,
            radius * Math.cos(oddAngle),
            radius * Math.sin(oddAngle),
            oddRow.y / (HEX_WIDTH * grain),
          ]);

          for (const [x, y, nx, ny, nz] of referencePoints) {
            const value = Math.max(-1, Math.min(1, noise.noise3D(nx, ny, nz))) * 0.5;
            expect(actual[y * width + x]).toBe(
              Int16Array.of(Math.round(Math.fround(value) * DEFAULT_ELEVATION_SCALE))[0]
            );
          }
        }
      }
    }
  });

  it("scales both fields by their amplitudes and attenuates only arc noise by proximity", () => {
    const seed = 42;
    const crustAmplitude = 0.36;
    const arcAmplitude = 0.26;
    const input = flatInput(seed);
    const crust = computeBaseTopography.run(input, noiseOnlyConfig(1, 0)).elevation;
    const arc = computeBaseTopography.run(input, noiseOnlyConfig(0, 1)).elevation;

    for (const closeness of [0, 127, 255]) {
      const actual = computeBaseTopography.run(
        flatInput(seed, closeness),
        noiseOnlyConfig(crustAmplitude, arcAmplitude)
      ).elevation;
      let largestError = 0;
      for (let i = 0; i < actual.length; i++) {
        const expected = crust[i] * crustAmplitude + arc[i] * arcAmplitude * (closeness / 255);
        largestError = Math.max(largestError, Math.abs(actual[i] - expected));
      }
      // Rounding each source and the final weighted sum contributes less than one elevation unit.
      expect(largestError).toBeLessThanOrEqual(1);
      expect(actual).toEqual(
        computeBaseTopography.run(
          input,
          noiseOnlyConfig(crustAmplitude, arcAmplitude * (closeness / 255))
        ).elevation
      );
    }

    expect(computeBaseTopography.run(flatInput(seed, 0), noiseOnlyConfig(0, 1)).elevation).toEqual(
      new Int16Array(WIDTH * HEIGHT)
    );
  });

  it("keeps physical relief and seed independence when both noise amplitudes are zero", () => {
    const input = {
      ...flatInput(42, 64),
      crustBaseElevation: new Float32Array(WIDTH * HEIGHT).fill(0.75),
      upliftPotential: new Uint8Array(WIDTH * HEIGHT).fill(128),
      riftPotential: new Uint8Array(WIDTH * HEIGHT).fill(64),
    };
    const config = noiseOnlyConfig(0, 0);
    config.config.boundaryBias = 0.1;
    config.config.clusteringBias = 0.4;
    const closeness = 64 / 255;
    const uplift = 128 / 255;
    const upliftBlend = Math.min(
      1,
      uplift *
        (defaultConfig.tectonics.interiorNoiseWeight +
          closeness * defaultConfig.tectonics.boundaryArcWeight) +
        0.4 * uplift * (1 - closeness) * 0.2
    );
    const physicalElevation =
      -0.5 + 0.75 + upliftBlend * 0.45 + 0.1 * closeness - (64 / 255) * 0.15;
    const expected = new Int16Array(WIDTH * HEIGHT).fill(
      Math.round(Math.fround(physicalElevation) * DEFAULT_ELEVATION_SCALE)
    );

    expect(computeBaseTopography.run(input, config).elevation).toEqual(expected);
    expect(computeBaseTopography.run({ ...input, rngSeed: 1018 }, config).elevation).toEqual(
      expected
    );
  });
});
