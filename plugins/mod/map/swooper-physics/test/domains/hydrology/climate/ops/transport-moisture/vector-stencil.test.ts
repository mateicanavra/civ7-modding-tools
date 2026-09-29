import { describe, expect, it } from "bun:test";
import { runAdmittedOperationForTest } from "@swooper/mapgen-core/testing";
import hydrologyDomain from "../../../../../../src/domain/hydrology/router.js";

const { transportMoisture } = hydrologyDomain.climate.ops;
type MoistureInput = Parameters<typeof transportMoisture.run>[0];

function inputFor(width: number, height: number) {
  const size = width * height;
  return {
    width,
    height,
    latitudeByRow: new Float32Array(height),
    landMask: new Uint8Array(size).fill(1),
    windU: new Int8Array(size),
    windV: new Int8Array(size),
    evaporation: Float32Array.from({ length: size }, (_, i) => 0.01 + 0.01 * ((i * 17) % 9)),
  } satisfies MoistureInput;
}

function run(
  input: MoistureInput,
  config: Partial<{ iterations: number; advection: number; retention: number }> = {}
) {
  return runAdmittedOperationForTest(transportMoisture, input, {
    strategy: "vector-advection",
    config: { iterations: 1, advection: 0.5, retention: 0.8, ...config },
  }).humidity;
}

const EVEN_OFFSETS = [[1, 0], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1]] as const;
const ODD_OFFSETS = [[1, 0], [1, 1], [0, 1], [-1, 0], [0, -1], [1, -1]] as const;
const RAY_BOUNDARIES = [
  [80, -1], [80, 0], [80, 1],
  [46, 79], [46, 80], [46, 81],
  [-46, 79], [-46, 80], [-46, 81],
  [-80, -1], [-80, 0], [-80, 1],
  [-46, -79], [-46, -80], [-46, -81],
  [46, -79], [46, -80], [46, -81],
] as const;

function expectedAdvection(input: MoistureInput, x: number, y: number): number {
  const center = y * input.width + x;
  const u = -input.windU[center]!;
  const v = -input.windV[center]!;
  if (u === 0 && v === 0) return input.evaporation[center]!;
  const angle = (Math.atan2(v, u) + 2 * Math.PI) % (2 * Math.PI);
  const sector = Math.min(5, Math.floor(angle / (Math.PI / 3)));
  const offset = angle - sector * Math.PI / 3;
  const a = Math.sin(Math.PI / 3 - offset);
  const b = Math.sin(offset);
  const weights = [a / (a + b), b / (a + b)];
  const offsets = y % 2 === 0 ? EVEN_OFFSETS : ODD_OFFSETS;
  let result = 0;
  for (let k = 0; k < 2; k++) {
    const [dx, dy] = offsets[(sector + k) % 6]!;
    const ny = y + dy;
    const nx = (x + dx + input.width) % input.width;
    const donor = ny < 0 || ny >= input.height ? center : ny * input.width + nx;
    result += input.evaporation[donor]! * weights[k]!;
  }
  return result;
}

function calmRecurrence(local: number, iterations: number, advection: number, retention: number) {
  let humidity = Math.fround(Math.max(0, Math.min(1, local)));
  for (let pass = 0; pass < iterations; pass++) {
    humidity = Math.fround(Math.max(0, Math.min(1, (local + humidity * advection) * retention)));
  }
  return humidity;
}

describe("moisture vector transport stencil", () => {
  it("matches an independent angular oracle on both parities, seams, edges and narrow grids", () => {
    for (const width of [1, 2, 7]) {
      for (const height of [1, 2, 6]) {
        for (let y = 0; y < height; y++) {
          for (const x of new Set([0, width - 1])) {
            for (const [upX, upY] of RAY_BOUNDARIES) {
              const input = inputFor(width, height);
              const center = y * width + x;
              input.windU[center] = -upX;
              input.windV[center] = -upY;
              const expected = Math.fround(
                (input.evaporation[center]! + expectedAdvection(input, x, y) * 0.5) * 0.8
              );
              expect(run(input)[center]).toBeCloseTo(expected, 7);
            }
          }
        }
      }
    }
  });

  it("does not move moisture across rows under exact zonal wind", () => {
    for (const u of [-127, -1, 1, 127]) {
      const input = inputFor(7, 6);
      input.evaporation.fill(0);
      input.evaporation[3 * 7 + 3] = 0.1;
      input.windU.fill(u);
      const humidity = run(input, { iterations: 8, retention: 0.5 });
      for (let y = 0; y < input.height; y++) {
        if (y === 3) continue;
        for (let x = 0; x < input.width; x++) expect(humidity[y * input.width + x]).toBe(0);
      }
      expect(humidity[3 * 7 + 2]! + humidity[3 * 7 + 4]!).toBeGreaterThan(0);
    }
  });

  it("preserves near-axis contributions on both sides without a secondary cutoff", () => {
    for (const y of [2, 3]) {
      for (const v of [-1, 1]) {
        const input = inputFor(7, 6);
        input.evaporation.fill(0);
        const center = y * input.width + 3;
        const offsets = y % 2 === 0 ? EVEN_OFFSETS : ODD_OFFSETS;
        const [dx, dy] = offsets[v < 0 ? 1 : 5]!;
        input.evaporation[(y + dy) * input.width + 3 + dx] = 0.25;
        input.windU[center] = -80;
        input.windV[center] = v;
        const weight = 2 / (80 * Math.sqrt(3) + 1);
        expect(run(input, { advection: 1, retention: 1 })[center]).toBeCloseTo(0.25 * weight, 7);
        expect(run(input, { advection: 1, retention: 1 })[center]).toBeGreaterThan(0);
      }
    }
  });

  it("keeps calm sources local while preserving repeated injection and ignoring latitude", () => {
    const input = inputFor(7, 6);
    input.evaporation.fill(0);
    const source = 2 * input.width + 3;
    input.evaporation[source] = 0.1;
    const reference = run(input, { iterations: 8 });
    expect(reference[source]).toBe(calmRecurrence(input.evaporation[source]!, 8, 0.5, 0.8));
    expect(reference[source]).toBeGreaterThan(input.evaporation[source]!);
    for (let i = 0; i < reference.length; i++) {
      if (i !== source) expect(reference[i]).toBe(0);
    }
    for (const latitude of [-90, -60, -45, -30, 0, 29, 30, 59, 60, 90]) {
      input.latitudeByRow.fill(latitude);
      expect(run(input, { iterations: 8 })).toEqual(reference);
    }
  });

  it("crosses the retained cutoff witness without a finite donor-weight jump", () => {
    const input = inputFor(7, 5);
    input.evaporation.fill(0.02);
    const center = 3;
    input.evaporation[center + 1] = 0.1;
    input.evaporation[center - 1] = 0.2;
    input.evaporation[input.width + center] = 0.4;
    input.windU[center] = -127;
    for (const v of [36, 37]) {
      input.windV[center] = v;
      const blockedWeight = 2 * v / (127 * Math.sqrt(3) + v);
      const local = input.evaporation[center]!;
      const donor = local * blockedWeight + input.evaporation[center + 1]! * (1 - blockedWeight);
      expect(run(input)[center]).toBeCloseTo(Math.fround((local + donor * 0.5) * 0.8), 7);
    }
  });

  it("retains a missing Y-edge share at self instead of falling back to a zonal donor", () => {
    for (const y of [0, 3]) {
      const input = inputFor(5, 4);
      input.evaporation.fill(0);
      const center = y * input.width + 2;
      input.evaporation[center] = 0.05;
      input.evaporation[center + 1] = 0.25;
      input.evaporation[center - 1] = 0.4;
      input.windU[center] = -47;
      input.windV[center] = y === 0 ? 80 : -80;
      const expected = (input.evaporation[center]! + expectedAdvection(input, 2, y) * 0.5) * 0.8;
      const result = run(input)[center]!;
      expect(result).toBeCloseTo(expected, 7);
      expect(result).toBeLessThan(0.061);
      input.latitudeByRow.fill(45);
      expect(run(input)[center]).toBe(result);
    }
  });

  it("distinguishes east/west donors across the X seam over two source-injecting passes", () => {
    for (const y of [2, 3]) {
      const input = inputFor(5, 6);
      input.evaporation.fill(0);
      const center = y * input.width;
      input.evaporation[center] = 0.01;
      input.evaporation[center + 1] = 0.05;
      input.evaporation[center + 4] = 0.15;
      for (const [u, donor] of [[-80, center + 1], [80, center + 4]]) {
        input.windU[center] = u!;
        const donorFirst = calmRecurrence(input.evaporation[donor!]!, 1, 0.5, 0.8);
        const expected = Math.fround((input.evaporation[center]! + donorFirst * 0.5) * 0.8);
        expect(run(input, { iterations: 2 })[center]).toBe(expected);
      }
    }
  });

  it("crosses land and water alike and depends on direction rather than wind magnitude", () => {
    const input = inputFor(7, 6);
    input.windU.fill(3);
    input.windV.fill(-2);
    const weak = run(input, { iterations: 6 });
    input.windU.fill(120);
    input.windV.fill(-80);
    for (let i = 0; i < input.landMask.length; i++) input.landMask[i] = i % 2;
    const strong = run(input, { iterations: 6 });
    for (let i = 0; i < strong.length; i++) expect(strong[i]).toBeCloseTo(weak[i]!, 7);
    input.landMask.fill(0);
    expect(run(input, { iterations: 6 })).toEqual(strong);
    input.landMask.fill(1);
    expect(run(input, { iterations: 6 })).toEqual(strong);
  });

  it("preserves initialization, zero controls, per-pass saturation and the constant-field recurrence", () => {
    const input = inputFor(7, 6);
    for (let i = 0; i < input.windU.length; i++) {
      input.windU[i] = (i * 53) % 255 - 127;
      input.windV[i] = (i * 71) % 255 - 127;
    }
    input.evaporation[0] = -0.5;
    input.evaporation[1] = 1.5;
    expect(run(input, { iterations: 0 })).toEqual(
      Float32Array.from(input.evaporation, (value) => Math.max(0, Math.min(1, value)))
    );
    expect(run(input, { iterations: 3, retention: 0 })).toEqual(new Float32Array(input.evaporation.length));
    const noAdvection = run(input, { iterations: 3, advection: 0 });
    for (let i = 0; i < noAdvection.length; i++) {
      expect(noAdvection[i]).toBe(Math.fround(Math.max(0, Math.min(1, input.evaporation[i]! * 0.8))));
    }
    for (const local of [0, 0.025, 0.75]) {
      input.evaporation.fill(local);
      const actualLocal = input.evaporation[0]!;
      const humidity = run(input, { iterations: 12 });
      const expected = calmRecurrence(actualLocal, 12, 0.5, 0.8);
      for (const value of humidity) {
        expect(value).toBe(expected);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      }
      expect(run(input, { iterations: 12 })).toEqual(humidity);
    }
  });

  it("keeps the separate cardinal strategy's calm latitude bands and bounded sampling unchanged", () => {
    const input = inputFor(5, 3);
    input.evaporation.fill(0);
    const center = 7;
    input.evaporation[center + 1] = 0.25;
    input.evaporation[center - 1] = 0.5;
    const cardinal = () => runAdmittedOperationForTest(transportMoisture, input, {
      strategy: "cardinal",
      config: { iterations: 1, advection: 1, retention: 1 },
    }).humidity;
    for (const [latitude, expected] of [[0, 0.25], [29, 0.25], [30, 0.5], [59, 0.5], [60, 0.25]]) {
      input.latitudeByRow.fill(latitude!);
      expect(cardinal()[center]).toBe(expected!);
    }
    input.evaporation[0] = 0.125;
    input.windU[0] = 80;
    expect(cardinal()[0]).toBe(0.25);
    input.windU[0] = 0;
    input.windV[0] = 80;
    expect(cardinal()[0]).toBe(0.25);
  });

  it("rejects the removed vector cutoff rather than silently accepting a dead control", () => {
    const selection = {
      strategy: "vector-advection" as const,
      config: { iterations: 1, advection: 0.5, retention: 0.8, secondaryWeightMin: 0.2 },
    };
    expect(() => runAdmittedOperationForTest(transportMoisture, inputFor(2, 2), selection)).toThrow();
  });
});
