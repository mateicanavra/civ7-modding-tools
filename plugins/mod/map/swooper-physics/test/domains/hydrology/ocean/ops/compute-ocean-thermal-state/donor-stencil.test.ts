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

function strengthBlend(self: number, donor: number, u: number, v: number): number {
  const alpha = Math.min(1, Math.hypot(u, v) / 127);
  return alpha === 0 ? self : alpha === 1 ? donor : self + alpha * (donor - self);
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
          expect(run(input).sstC[center]).toBeCloseTo(
            Math.fround(strengthBlend(initialSst(input, center), expected, upX, upY)),
            5
          );
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
        const expected = strengthBlend(12, 12 + (v! < 0 ? 18 : -18) * diagonalWeight, u!, v!);
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
      input.currentV[center + 1] = -127;
      input.currentV[center + 4] = 127;
      input.currentU[center] = -127;
      const first = run(input);
      expect(first.sstC[center]).toBe(12);
      expect(first.sstC[center + 1]).toBe(30);
      expect(first.sstC[center + 4]).toBe(-6);
      expect(run(input, { advectIters: 2 }).sstC[center]).toBe(30);
      input.currentU[center] = -128;
      expect(run(input, { advectIters: 2 }).sstC[center]).toBe(30);
      input.currentU[center] = 127;
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
      const donorTemperature = donors.reduce(
        (sum, donor) => sum + first[donor.index]! * donor.weight,
        0
      );
      const expected = strengthBlend(first[center]!, donorTemperature, -80, 47 * inward);
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
            expect(run(input).sstC[center]).toBeCloseTo(
              Math.fround(strengthBlend(initialSst(input, center), expected, upX, upY)),
              5
            );
          }
        }
      }
    }
  });

  it("keeps the exact-zero advection identity over repeated passes", () => {
    const input = inputFor(7, [90, 70, 25, 0, 45, 85]);
    const baseline = run(input, { advectIters: 0 });
    expect(run(input, { advectIters: 30 }).sstC).toEqual(baseline.sstC);
  });

  it("scales one-pass meridional response by relative strength with exact zero and full endpoints", () => {
    for (const y of [2, 3]) {
      const latitudes = [45, 45, 45, 45, 45, 45];
      latitudes[y - 1] = 90;
      latitudes[y + 1] = 0;
      const input = inputFor(7, latitudes);
      const center = y * input.width + 3;
      for (const v of [-128, -127, -126, -64, -2, -1, 0, 1, 2, 64, 126, 127]) {
        input.currentV[center] = v;
        const alpha = Math.min(1, Math.abs(v) / 127);
        const expected = Math.fround(12 + (v < 0 ? 18 : -18) * alpha);
        expect(run(input).sstC[center]).toBe(expected);
      }
    }
  });

  it("uses radial rather than componentwise strength and saturates admitted -128 diagonals", () => {
    for (const y of [2, 3]) {
      const input = inputFor(7, [80, 12, 60, 32, 85, 24]);
      const center = y * input.width + 3;
      const self = initialSst(input, center);
      for (const signX of [-1, 1]) {
        for (const signY of [-1, 1]) {
          const donors = expectedDonors(input, 3, y, signX, signY);
          const geometric = donors.reduce((sum, donor) => sum + initialSst(input, donor.index) * donor.weight, 0);
          const outputs: number[] = [];
          for (const component of [1, 30, 60, 89, 90, 127, 128]) {
            // Positive 128 is not admitted by i8; the -128 endpoint is tested in its own quadrant.
            if (component === 128 && (signX < 0 || signY < 0)) continue;
            input.currentU[center] = -signX * component;
            input.currentV[center] = -signY * component;
            const expected = strengthBlend(self, geometric, component, component);
            const actual = run(input).sstC[center]!;
            expect(actual).toBeCloseTo(Math.fround(expected), 5);
            if (component >= 90) outputs.push(actual);
          }
          expect(new Set(outputs).size).toBe(1);
        }
      }
      for (const [u, v] of [[-128, 127], [127, -128], [-128, 1], [1, -128]]) {
        input.currentU[center] = u!;
        input.currentV[center] = v!;
        const geometric = expectedDonors(input, 3, y, -u!, -v!).reduce(
          (sum, donor) => sum + initialSst(input, donor.index) * donor.weight,
          0
        );
        expect(run(input).sstC[center]).toBeCloseTo(Math.fround(geometric), 5);
      }
    }
  });

  it("reapplies the weak blend to the previous pass rather than the initial temperature", () => {
    const input = inputFor(5, [90, 45, 0]);
    const center = input.width + 2;
    input.currentV[center] = -63;
    const first = Math.fround(12 + (30 - 12) * 63 / 127);
    const second = Math.fround(first + (30 - first) * 63 / 127);
    expect(run(input).sstC[center]).toBe(first);
    expect(run(input, { advectIters: 2 }).sstC[center]).toBe(second);
  });

  it("bounds the response to weak currents rotating around zero by their small donor fraction", () => {
    for (const y of [2, 3]) {
      const input = inputFor(7, [90, 90, 45, 45, 0, 0]);
      const center = y * input.width + 3;
      const self = initialSst(input, center);
      for (const [u, v] of [[0, -1], [-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1]]) {
        input.currentU[center] = u!;
        input.currentV[center] = v!;
        const geometric = expectedDonors(input, 3, y, -u!, -v!).reduce(
          (sum, donor) => sum + initialSst(input, donor.index) * donor.weight,
          0
        );
        const actual = run(input).sstC[center]!;
        expect(actual).toBeCloseTo(Math.fround(strengthBlend(self, geometric, u!, v!)), 5);
        expect(Math.abs(actual - self)).toBeLessThan(0.21);
      }
    }
  });

  it("applies diffusion after the strength blend, including calm and shelf controls", () => {
    for (const y of [2, 3]) {
      const latitudes = [45, 45, 45, 45, 45, 45];
      latitudes[y - 1] = 90;
      latitudes[y + 1] = 15;
      const input = inputFor(7, latitudes);
      const center = y * input.width + 3;
      // Two cold, two same-row and two warm neighbors; the old-time average is 10 C.
      const neighborAverage = (-6 * 2 + 12 * 2 + 24 * 2) / 6;
      for (const v of [0, -1, -64, -127, -128]) {
        input.currentV[center] = v;
        for (const shelf of [0, 1]) {
          input.shelfMask[center] = shelf;
          for (const diffusion of [0, 0.2, 1]) {
            const advected = strengthBlend(12, 24, 0, v);
            const mixing = shelf ? Math.min(1, diffusion * 1.35) : diffusion;
            const expected = Math.fround(advected + (neighborAverage - advected) * mixing);
            expect(run(input, { diffusion }).sstC[center]).toBe(expected);
          }
        }
      }
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
        const before = structuredClone(input);
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
        expect(input).toEqual(before);
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
