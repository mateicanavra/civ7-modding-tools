import { describe, expect, it } from "bun:test";
import {
  forEachHexNeighborOddQWithDirection,
  getHexNeighborDirectionVectorsOddQ,
  I8_VECTOR_MAX_ABS,
} from "@swooper/mapgen-core/lib/grid";

import hydrologyOpsPublic from "../../../../../../src/domain/hydrology/router.js";
import { deriveTestOperationSeed } from "../../../../../setup.js";

const { computePrecipitation } = hydrologyOpsPublic.climate.ops;
const WIDTH = 7;
const HEIGHT = 5;
const CENTER_X = 3;
const CENTER_Y = 2;
const CENTER = CENTER_Y * WIDTH + CENTER_X;
// Hex neighbors are sqrt(3) apart; four diagonal directions also carry meridional inflow.
const HORIZONTAL_INFLOW_CONVERGENCE = 2 / (3 * Math.sqrt(3));
const CONFIG = {
  rainfallScale: 0,
  humidityExponent: 1,
  noiseAmplitude: 0,
  noiseScale: 0.12,
  waterGradient: { radius: 5, perRingBonus: 0, lowlandBonus: 0, lowlandElevationMax: 150 },
  upliftStrength: 0,
  convergenceStrength: 19,
};

function input(humidity = 1) {
  const size = WIDTH * HEIGHT;
  return {
    width: WIDTH,
    height: HEIGHT,
    perlinSeed: deriveTestOperationSeed("test:hydrology:precipitation-convergence"),
    latitudeByRow: new Float32Array(HEIGHT),
    elevation: new Int16Array(size),
    landMask: new Uint8Array(size).fill(1),
    windU: new Int8Array(size),
    windV: new Int8Array(size),
    humidityF32: new Float32Array(size).fill(humidity),
  };
}

function radialWind(options: {
  humidity?: number;
  magnitude?: number;
  outward?: boolean;
  horizontalOnly?: boolean;
  calmCenter?: boolean;
} = {}) {
  const field = input(options.humidity);
  const sign = options.outward ? 1 : -1;
  const magnitude = options.magnitude ?? I8_VECTOR_MAX_ABS;
  const directions = getHexNeighborDirectionVectorsOddQ((CENTER_Y & 1) === 1);
  field.windU[CENTER] = options.calmCenter ? 0 : 1;
  forEachHexNeighborOddQWithDirection(CENTER_X, CENTER_Y, WIDTH, HEIGHT, (x, y, direction) => {
    const vector = directions[direction]!;
    field.windU[y * WIDTH + x] = sign * Math.sign(vector.x) * magnitude;
    field.windV[y * WIDTH + x] = options.horizontalOnly
      ? 0
      : sign * Math.sign(vector.y) * magnitude;
  });
  return field;
}

function run(field: ReturnType<typeof input>, config: Partial<typeof CONFIG> = {}) {
  return computePrecipitation.run(field, {
    strategy: "vector",
    config: { ...CONFIG, ...config },
  });
}

describe("hydrology/compute-precipitation (bounded vector convergence)", () => {
  it("adds no convergence rain for a constant wind field, including map edges", () => {
    const field = input(0.5);
    field.windU.fill(70);
    field.windV.fill(-35);
    const withoutConvergence = run(field, { rainfallScale: 80, convergenceStrength: 0 });

    expect(run(field, { rainfallScale: 80 })).toEqual(withoutConvergence);
    expect(new Set(withoutConvergence.rainfall)).toEqual(new Set([40]));
  });

  it("normalizes signed-byte winds before measuring convergent and divergent flow", () => {
    const converging = radialWind({ magnitude: 8, horizontalOnly: true });
    const diverging = radialWind({ magnitude: 8, horizontalOnly: true, outward: true });

    const expected = Math.floor(96 * 16 * HORIZONTAL_INFLOW_CONVERGENCE * (8 / I8_VECTOR_MAX_ABS));
    expect(run(converging, { convergenceStrength: 96 }).rainfall[CENTER]).toBe(expected);
    expect(run(diverging, { convergenceStrength: 96 }).rainfall[CENTER]).toBe(0);
  });

  it("recognizes neighboring inflow when the center itself is calm", () => {
    const field = radialWind({ calmCenter: true });

    expect(field.windU[CENTER]).toBe(0);
    expect(field.windV[CENTER]).toBe(0);
    expect(run(field).rainfall[CENTER]).toBe(
      CONFIG.convergenceStrength
    );
  });

  it("does not manufacture convergence rainfall without transported humidity", () => {
    const field = radialWind({ humidity: 0 });
    const out = run(field, { convergenceStrength: 200 });

    expect(new Set(out.rainfall)).toEqual(new Set([0]));
    expect(new Set(out.humidity)).toEqual(new Set([0]));
  });

  it("caps the additive rainfall response by authored strength and available humidity", () => {
    for (const humidity of [0.25, 0.5, 1]) {
      const field = radialWind({ humidity });
      for (const strength of [0, 19, 40]) {
        const out = run(field, { rainfallScale: 80, convergenceStrength: strength });
        const baseline = run(field, { rainfallScale: 80, convergenceStrength: 0 });

        expect(out.rainfall[CENTER]).toBe(
          Math.floor((80 + strength) * humidity)
        );
        for (let i = 0; i < out.rainfall.length; i++) {
          const delta = out.rainfall[i]! - baseline.rainfall[i]!;
          expect(delta).toBeGreaterThanOrEqual(0);
          expect(delta).toBeLessThanOrEqual(Math.ceil(strength * humidity));
        }
      }
    }
  });

  it("retains the total 200-unit rainfall cap after bounded convergence", () => {
    const field = radialWind();
    const out = run(field, { rainfallScale: 190, convergenceStrength: 40 });

    expect(out.rainfall[CENTER]).toBe(200);
    expect(out.humidity[CENTER]).toBe(255);
    expect(Math.max(...out.rainfall)).toBeLessThanOrEqual(200);
  });

  it("keeps water rainfall and projected humidity at zero under convergent winds", () => {
    const field = radialWind();
    field.landMask.fill(0);
    const out = run(field, { rainfallScale: 180, convergenceStrength: 200, noiseAmplitude: 14 });

    expect(new Set(out.rainfall)).toEqual(new Set([0]));
    expect(new Set(out.humidity)).toEqual(new Set([0]));
  });

  it("is deterministic without mutating inputs when seeded texture is enabled", () => {
    const field = radialWind({ humidity: 0.5 });
    const before = structuredClone(field);
    const config = { rainfallScale: 80, convergenceStrength: 40, noiseAmplitude: 14 } as const;
    const first = run(field, config);

    expect(run(field, config)).toEqual(first);
    expect(field).toEqual(before);
  });
});
