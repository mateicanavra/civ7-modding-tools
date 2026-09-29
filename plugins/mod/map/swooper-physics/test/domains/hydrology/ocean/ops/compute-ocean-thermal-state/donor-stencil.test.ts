import { describe, expect, it } from "bun:test";

import { runAdmittedOperationForTest } from "@swooper/mapgen-core/testing";
import hydrologyDomain from "../../../../../../src/domain/hydrology/router.js";

const { computeOceanThermalState } = hydrologyDomain.ocean.ops;
type OceanInput = Parameters<typeof computeOceanThermalState.run>[0];

function inputFor(width: number, latitudes: readonly number[]) {
  const height = latitudes.length;
  const size = width * height;
  return {
    width,
    height,
    latitudeByRow: Float32Array.from(latitudes),
    isWaterMask: new Uint8Array(size).fill(1),
    shelfMask: new Uint8Array(size),
    currentU: new Int8Array(size),
    currentV: new Int8Array(size),
  } satisfies OceanInput;
}

function run(
  input: OceanInput,
  overrides: Partial<typeof computeOceanThermalState.defaultConfig.config> = {}
) {
  return runAdmittedOperationForTest(computeOceanThermalState, input, {
    strategy: "latitude-current-advection",
    config: {
      ...computeOceanThermalState.defaultConfig.config,
      equatorTempC: 30,
      poleTempC: -6,
      advectIters: 1,
      diffusion: 0,
      ...overrides,
    },
  });
}

// Independent angular oracle: east, southeast, southwest, west, northwest, northeast.
// These offset rows describe actual odd-R neighbors, not the production helper's slot order.
const EVEN_OFFSETS = [[1, 0], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1]] as const;
const ODD_OFFSETS = [[1, 0], [1, 1], [0, 1], [-1, 0], [0, -1], [1, -1]] as const;

function expectedDonors(input: OceanInput, x: number, y: number, upX: number, upY: number) {
  const angle = (Math.atan2(upY, upX) + 2 * Math.PI) % (2 * Math.PI);
  const sector = Math.min(5, Math.floor(angle / (Math.PI / 3)));
  const offset = angle - sector * (Math.PI / 3);
  const a = Math.sin(Math.PI / 3 - offset);
  const b = Math.sin(offset);
  const weights = [a / (a + b), b / (a + b)];
  const offsets = y % 2 === 0 ? EVEN_OFFSETS : ODD_OFFSETS;
  return [sector, (sector + 1) % 6].map((ray, slot) => {
    const [dx, dy] = offsets[ray]!;
    const ny = y + dy;
    const nx = (x + dx + input.width) % input.width;
    const neighbor = ny * input.width + nx;
    const index =
      ny < 0 || ny >= input.height || input.isWaterMask[neighbor] !== 1
        ? y * input.width + x
        : neighbor;
    return { index, weight: weights[slot]! };
  });
}

function initialSst(input: OceanInput, index: number): number {
  const y = Math.floor(index / input.width);
  return Math.fround(30 - 36 * Math.abs(input.latitudeByRow[y]!) / 90);
}

const BOUNDARY_VECTORS = [
  [80, -1], [80, 0], [80, 1],
  [46, 79], [46, 80], [46, 81],
  [-46, 79], [-46, 80], [-46, 81],
  [-80, -1], [-80, 0], [-80, 1],
  [-46, -79], [-46, -80], [-46, -81],
  [46, -79], [46, -80], [46, -81],
] as const;

describe("ocean thermal adjacent-ray transport", () => {
  it("matches angular interpolation around every ray with actual i8 vectors on both row parities", () => {
    // 46 * sqrt(3) lies between 79 and 80: these integer vectors straddle diagonal rays.
    for (const y of [2, 3]) {
      for (const [upX, upY] of BOUNDARY_VECTORS) {
        for (const blockedRay of [-1, 0, 1, 2, 3, 4, 5]) {
          const input = inputFor(7, [80, 12, 60, 32, 85, 24]);
          const x = 3;
          const center = y * input.width + x;
          if (blockedRay >= 0) {
            const [dx, dy] = (y % 2 === 0 ? EVEN_OFFSETS : ODD_OFFSETS)[blockedRay]!;
            input.isWaterMask[(y + dy) * input.width + x + dx] = 0;
          }
          input.currentU[center] = -upX;
          input.currentV[center] = -upY;
          const expected = expectedDonors(input, x, y, upX, upY).reduce(
            (sum, donor) => sum + initialSst(input, donor.index) * donor.weight,
            0
          );
          expect(run(input).sstC[center]).toBeCloseTo(Math.fround(expected), 5);
        }
      }
    }
  });

  it("preserves a nonlinear latitude field under exact zonal flow rather than importing a diagonal", () => {
    for (const u of [-127, -1, 0, 1, 127]) {
      const input = inputFor(7, [90, 70, 25, 0, 45, 85]);
      input.currentU.fill(u);
      const baseline = run(input, { advectIters: 0 });
      expect(run(input, { advectIters: 30 }).sstC).toEqual(baseline.sstC);
    }
  });

  it("gives the aquaplanet witness near-axis diagonals vanishing rather than one-third weight", () => {
    for (const y of [2, 3]) {
      for (const [u, v] of [[-80, -1], [-82, 1], [80, -1], [82, 1]]) {
        const latitudes = [45, 45, 45, 45, 45, 45];
        latitudes[y - 1] = 90;
        latitudes[y + 1] = 0;
        const input = inputFor(7, latitudes);
        const center = y * input.width + 3;
        input.currentU[center] = u!;
        input.currentV[center] = v!;
        const diagonalWeight = 2 / (Math.sqrt(3) * Math.abs(u!) + 1);
        const expected = 12 + (v! < 0 ? 18 : -18) * diagonalWeight;
        expect(run(input).sstC[center]).toBeCloseTo(expected, 5);
        expect(Math.abs(run(input).sstC[center]! - 12)).toBeLessThan(0.26);
      }
    }
  });

  it("keeps both coastal witness directions at self when their enclosing rays are land", () => {
    for (const y of [2, 3]) {
      const input = inputFor(7, [90, 75, 60, 30, 15, 0]);
      const x = 3;
      const center = y * input.width + x;
      for (const ray of [0, 1]) {
        const [dx, dy] = (y % 2 === 0 ? EVEN_OFFSETS : ODD_OFFSETS)[ray]!;
        input.isWaterMask[(y + dy) * input.width + x + dx] = 0;
      }
      input.currentU[center] = -82;
      input.currentV[center] = -47;
      const first = run(input, { advectIters: 30, diffusion: 0.18 });
      input.currentU[center] = -81;
      const second = run(input, { advectIters: 30, diffusion: 0.18 });
      expect(second).toEqual(first);
      expect(run(input).sstC[center]).toBe(initialSst(input, center));
    }
  });

  it("distinguishes east from west across the periodic seam after donors acquire different temperatures", () => {
    for (const y of [2, 3]) {
      const latitudes = [45, 45, 45, 45, 45, 45];
      latitudes[y - 1] = 90;
      latitudes[y + 1] = 0;
      const input = inputFor(5, latitudes);
      const center = y * input.width;
      input.currentV[center + 1] = -80;
      input.currentV[center + 4] = 80;
      input.currentU[center] = -80;
      const first = run(input);
      expect(first.sstC[center]).toBe(12);
      expect(first.sstC[center + 1]).toBe(30);
      expect(first.sstC[center + 4]).toBe(-6);
      expect(run(input, { advectIters: 2 }).sstC[center]).toBe(30);
      input.currentU[center] = 80;
      expect(run(input, { advectIters: 2 }).sstC[center]).toBe(-6);
    }
  });

  it("retains only the off-map share at each bounded Y edge", () => {
    for (const y of [0, 3]) {
      const input = inputFor(5, [90, 0, 0, 90]);
      const center = y * input.width + 2;
      const inward = y === 0 ? 1 : -1;
      input.currentV[center + 1] = -80 * inward;
      input.currentU[center] = -80;
      input.currentV[center] = 47 * inward;
      const donors = expectedDonors(input, 2, y, 80, -47 * inward);
      const first = run(input).sstC;
      const expected = donors.reduce(
        (sum, donor) => sum + first[donor.index]! * donor.weight,
        0
      );
      expect(expected).toBeGreaterThan(-6);
      expect(expected).toBeLessThan(30);
      expect(run(input, { advectIters: 2 }).sstC[center]).toBeCloseTo(expected, 5);
    }
  });

  it("retains direction weights when narrow periodic grids alias donors or self", () => {
    for (const width of [1, 2]) {
      for (const latitudes of [[45], [90, 0], [90, 30, 60, 0]]) {
        for (let y = 0; y < latitudes.length; y++) {
          for (const [upX, upY] of BOUNDARY_VECTORS) {
            const input = inputFor(width, latitudes);
            const center = y * width;
            input.currentU[center] = -upX;
            input.currentV[center] = -upY;
            const expected = expectedDonors(input, 0, y, upX, upY).reduce(
              (sum, donor) => sum + initialSst(input, donor.index) * donor.weight,
              0
            );
            expect(run(input).sstC[center]).toBeCloseTo(Math.fround(expected), 5);
          }
        }
      }
    }
  });

  it("keeps the direction-only magnitude convention and the exact-zero advection identity", () => {
    const input = inputFor(7, [90, 70, 25, 0, 45, 85]);
    const baseline = run(input, { advectIters: 0 });
    expect(run(input, { advectIters: 30 }).sstC).toEqual(baseline.sstC);
    input.currentU.fill(3);
    input.currentV.fill(-2);
    const weak = run(input, { advectIters: 30 });
    input.currentU.fill(120);
    input.currentV.fill(-80);
    const strong = run(input, { advectIters: 30 });
    for (let i = 0; i < input.width * input.height; i++) {
      expect(strong.sstC[i]).toBeCloseTo(weak.sstC[i]!, 5);
    }
  });

  it("preserves constant water fields, bounded temperatures, land zeros and SST-derived ice", () => {
    for (const width of [1, 2, 7]) {
      const input = inputFor(width, [90, 70, 25, 0, 45, 85]);
      for (let i = 0; i < input.width * input.height; i++) {
        input.currentU[i] = (i * 53) % 255 - 127;
        input.currentV[i] = (i * 71) % 255 - 127;
        input.isWaterMask[i] = i % 5 === 0 ? 0 : 1;
        input.shelfMask[i] = i % 2;
      }
      for (const diffusion of [0, 0.18, 1]) {
        for (const constant of [-1, 20]) {
          const out = run(input, {
            advectIters: 30,
            diffusion,
            equatorTempC: constant,
            poleTempC: constant,
          });
          for (let i = 0; i < input.width * input.height; i++) {
            expect(out.sstC[i]).toBe(input.isWaterMask[i] === 1 ? constant : 0);
            expect(out.seaIceMask[i]).toBe(
              input.isWaterMask[i] === 1 && constant <= -1 ? 1 : 0
            );
          }
        }
        const out = run(input, { advectIters: 30, diffusion });
        expect(run(input, { advectIters: 30, diffusion })).toEqual(out);
        for (let i = 0; i < input.width * input.height; i++) {
          expect(Number.isFinite(out.sstC[i])).toBe(true);
          expect(out.sstC[i]).toBeGreaterThanOrEqual(-6);
          expect(out.sstC[i]).toBeLessThanOrEqual(30);
          expect(out.seaIceMask[i]).toBe(
            input.isWaterMask[i] === 1 && out.sstC[i]! <= -1 ? 1 : 0
          );
          if (input.isWaterMask[i] === 0) expect(out.sstC[i]).toBe(0);
        }
      }
    }
  });

  it("rejects the removed ocean donor cutoff instead of silently ignoring it", () => {
    const selection = {
      ...computeOceanThermalState.defaultConfig,
      config: { ...computeOceanThermalState.defaultConfig.config, secondaryWeightMin: 0.25 },
    };
    expect(() =>
      runAdmittedOperationForTest(computeOceanThermalState, inputFor(2, [90, 0]), selection)
    ).toThrow();
  });
});
