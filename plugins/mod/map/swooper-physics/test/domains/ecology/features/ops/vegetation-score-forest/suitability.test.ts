import { describe, expect, it } from "bun:test";
import { normalizeOperationSelectionForTest } from "@swooper/mapgen-core/testing";
import ecology from "../../../../../../src/domain/ecology/router.js";
import { TEST_MAP_SIZE } from "../../../../../setup.js";

function temperateHabitatFields() {
  const { width, height } = TEST_MAP_SIZE.dimensions;
  const size = width * height;
  return {
    width,
    height,
    landMask: new Uint8Array(size).fill(1),
    energy01: new Float32Array(size).fill(0.6),
    water01: new Float32Array(size).fill(1),
    waterStress01: new Float32Array(size).fill(0.1),
    coldStress01: new Float32Array(size).fill(0.05),
    biomass01: new Float32Array(size).fill(0.8),
    fertility01: new Float32Array(size).fill(0.5),
  };
}

function score(input: ReturnType<typeof temperateHabitatFields>): Float32Array {
  return ecology.features.ops.scoreVegetationForest.run(
    input,
    normalizeOperationSelectionForTest(
      ecology.features.ops.scoreVegetationForest,
      ecology.features.ops.scoreVegetationForest.defaultConfig
    )
  ).score01;
}

// Freeze the previous response below its wet-side shoulder, including its floating-point edges.
function legacyBandpass(x: number, lo: number, hi: number, shoulder: number): number {
  function smoothstep(edge0: number, edge1: number): number {
    const t = Math.max(0, Math.min(1, (x - edge0) / Math.max(1e-6, edge1 - edge0)));
    return t * t * (3 - 2 * t);
  }
  return Math.max(
    0,
    Math.min(1, smoothstep(lo - shoulder, lo + shoulder) * (1 - smoothstep(hi - shoulder, hi + shoulder)))
  );
}

describe("forest suitability", () => {
  it("never loses suitability as water supply increases and stays saturated through water01=1", () => {
    const input = temperateHabitatFields();
    const water = [0, 0.24, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1];
    input.water01.set(water);

    const scores = score(input);
    const fullyWetScore = 0.8 * 0.9 * 0.95 * 0.8;

    expect(scores[0]).toBe(0);
    expect(scores[1]).toBe(0);
    expect(scores[2]).toBeCloseTo(0, 6);
    expect(scores[4]).toBeCloseTo(fullyWetScore * 0.5, 6);
    for (let i = 1; i < water.length; i++) {
      expect(scores[i], `water01=${water[i]}`).toBeGreaterThanOrEqual(scores[i - 1]!);
    }
    for (let i = 7; i < water.length; i++) {
      expect(scores[i], `water01=${water[i]}`).toBe(scores[7]!);
    }
    expect(scores[7]).toBeCloseTo(fullyWetScore, 6);
  });

  it("exactly preserves existing outputs at and below the former wet-side shoulder", () => {
    const input = temperateHabitatFields();
    const water = [0, 0.1, 0.24, 0.25, 0.2501, 0.3, 0.35, 0.4, 0.45, 0.5, 0.69, 0.7];
    const energy = [0.1, 0.25, 0.35, 0.6, 0.8, 0.9, 1];
    const expected = new Float32Array(input.landMask.length);
    for (let i = 0; i < expected.length; i++) {
      input.landMask[i] = i % 13 === 0 ? 0 : 1;
      input.water01[i] = water[i % water.length]!;
      input.energy01[i] = energy[Math.floor(i / water.length) % energy.length]!;
      input.waterStress01[i] = (i % 5) / 4;
      input.coldStress01[i] = i % 2 === 0 ? 0.05 : 0.75;
      input.biomass01[i] = (i % 7) / 6;
      input.fertility01[i] = (i % 11) / 10;
      if (input.landMask[i] === 0) continue;
      expected[i] =
        input.biomass01[i]! *
        legacyBandpass(input.energy01[i]!, 0.35, 0.8, 0.1) *
        legacyBandpass(input.water01[i]!, 0.35, 0.8, 0.1) *
        (1 - input.waterStress01[i]!) *
        (1 - input.coldStress01[i]!) *
        (0.6 + 0.4 * input.fertility01[i]!);
    }

    expect(score(input)).toEqual(expected);
  });

  it("retains heat and cold limits, stress attenuation, biomass, fertility, and land masks on wet land", () => {
    const input = temperateHabitatFields();
    input.energy01[1] = 0;
    input.energy01[2] = 1;
    input.energy01[3] = 0.35;
    input.energy01[4] = 0.8;
    input.waterStress01[5] = 1;
    input.coldStress01[6] = 1;
    input.waterStress01[7] = 0.55;
    input.coldStress01[8] = 0.525;
    input.biomass01[9] = 0;
    input.biomass01[10] = 0.4;
    input.fertility01[11] = 0;
    input.fertility01[12] = 1;
    input.landMask[13] = 0;

    const scores = score(input);

    expect(scores[0]).toBeCloseTo(0.8 * 0.9 * 0.95 * 0.8, 6);
    for (const tile of [1, 2, 5, 6, 9, 13]) expect(scores[tile]).toBe(0);
    for (const tile of [3, 4, 7, 8, 10]) {
      expect(scores[tile]).toBeCloseTo(scores[0]! * 0.5, 6);
    }
    expect(scores[11]).toBeCloseTo(scores[0]! * (0.6 / 0.8), 6);
    expect(scores[12]).toBeCloseTo(scores[0]! / 0.8, 6);
  });

  it("is deterministic, bounded, and leaves every admitted input field unchanged", () => {
    const input = temperateHabitatFields();
    const fields = [
      input.landMask,
      input.energy01,
      input.water01,
      input.waterStress01,
      input.coldStress01,
      input.biomass01,
      input.fertility01,
    ];
    for (let i = 0; i < input.landMask.length; i++) {
      input.landMask[i] = i % 9 === 0 ? 0 : 1;
      input.energy01[i] = (i % 101) / 100;
      input.water01[i] = (i % 97) / 96;
      input.waterStress01[i] = (i % 89) / 88;
      input.coldStress01[i] = (i % 83) / 82;
      input.biomass01[i] = (i % 79) / 78;
      input.fertility01[i] = (i % 73) / 72;
    }
    const snapshots = fields.map((field) => field.slice());

    const first = score(input);
    const second = score(input);

    expect(second).toEqual(first);
    expect(second).not.toBe(first);
    expect(first).toBeInstanceOf(Float32Array);
    expect(first).toHaveLength(input.width * input.height);
    for (const value of first) {
      expect(Number.isFinite(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    }
    for (let i = 0; i < fields.length; i++) expect(fields[i]).toEqual(snapshots[i]);
  });
});
