import { describe, expect, it } from "bun:test";
import { normalizeOperationSelectionForTest } from "@swooper/mapgen-core/testing";
import ecology from "../../../../../../src/domain/ecology/router.js";
import { TEST_MAP_SIZE } from "../../../../../setup.js";

function warmHabitatFields() {
  const { width, height } = TEST_MAP_SIZE.dimensions;
  const size = width * height;
  return {
    width,
    height,
    landMask: new Uint8Array(size).fill(1),
    energy01: new Float32Array(size).fill(0.8),
    water01: new Float32Array(size).fill(1),
    waterStress01: new Float32Array(size).fill(0.55),
    coldStress01: new Float32Array(size).fill(0),
    biomass01: new Float32Array(size).fill(0.8),
    fertility01: new Float32Array(size).fill(0.5),
  };
}

function score(input: ReturnType<typeof warmHabitatFields>): Float32Array {
  return ecology.features.ops.scoreVegetationSavannaWoodland.run(
    input,
    normalizeOperationSelectionForTest(
      ecology.features.ops.scoreVegetationSavannaWoodland,
      ecology.features.ops.scoreVegetationSavannaWoodland.defaultConfig
    )
  ).score01;
}

// Freeze the former scorer only where removing its wet-side shoulder must be identical.
function priorBandpass(x: number, lo: number, hi: number, shoulder: number): number {
  function smoothstep(edge0: number, edge1: number): number {
    const t = Math.max(0, Math.min(1, (x - edge0) / Math.max(1e-6, edge1 - edge0)));
    return t * t * (3 - 2 * t);
  }
  return Math.max(
    0,
    Math.min(1, smoothstep(lo - shoulder, lo + shoulder) * (1 - smoothstep(hi - shoulder, hi + shoulder)))
  );
}

describe("savanna woodland suitability", () => {
  it("retains the dry-side response and saturates rather than rejecting abundant supply", () => {
    const input = warmHabitatFields();
    const water = [0, 0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
    input.water01.set(water);

    const scores = score(input);

    expect(scores[0]).toBe(0);
    expect(scores[1]).toBeCloseTo(0, 6);
    expect(scores[3]).toBeCloseTo(0.4, 6);
    for (let i = 1; i < water.length; i++) {
      expect(scores[i], `water01=${water[i]}`).toBeGreaterThanOrEqual(scores[i - 1]!);
    }
    for (let i = 5; i < water.length; i++) expect(scores[i]).toBe(scores[5]!);
    expect(scores[12]).toBeCloseTo(0.8, 6);
  });

  it("exactly preserves prior scores through water01=0.5 across the other gates", () => {
    const input = warmHabitatFields();
    const water = [0, 0.099999, 0.1, 0.100001, 0.15, 0.2, 0.25, 0.299999, 0.3, 0.300001, 0.49, 0.5];
    const energy = [0, 0.57, 0.65, 0.73, 0.8, 0.87, 0.95, 1];
    const expected = new Float32Array(input.landMask.length);
    for (let i = 0; i < expected.length; i++) {
      input.landMask[i] = i % 13 === 0 ? 0 : 1;
      input.water01[i] = water[i % water.length]!;
      input.energy01[i] = energy[Math.floor(i / water.length) % energy.length]!;
      input.waterStress01[i] = (i % 17) / 16;
      input.biomass01[i] = (i % 7) / 6;
      if (input.landMask[i] === 0) continue;
      expected[i] = input.biomass01[i]!
        * priorBandpass(input.energy01[i]!, 0.65, 0.95, 0.08)
        * priorBandpass(input.water01[i]!, 0.2, 0.6, 0.1)
        * priorBandpass(input.waterStress01[i]!, 0.35, 0.75, 0.1);
    }

    expect(score(input)).toEqual(expected);
  });

  it("preserves energy, stress, biomass and land exclusions on well-supplied habitat", () => {
    const input = warmHabitatFields();
    input.energy01[1] = 0;
    input.waterStress01[2] = 0;
    input.waterStress01[3] = 1;
    input.biomass01[4] = 0;
    input.landMask[5] = 0;
    input.biomass01[6] = 0.4;
    input.energy01[7] = 0.65;
    input.waterStress01[8] = 0.35;
    input.waterStress01[9] = 0.75;

    const scores = score(input);

    for (const tile of [1, 2, 3, 4, 5]) expect(scores[tile]).toBe(0);
    for (const tile of [6, 7, 8, 9]) expect(scores[tile]).toBeCloseTo(scores[0]! * 0.5, 6);
  });

  it("is deterministic, bounded, fresh and leaves every admitted field unchanged", () => {
    const input = warmHabitatFields();
    const fields = [input.landMask, input.energy01, input.water01, input.waterStress01,
      input.coldStress01, input.biomass01, input.fertility01];
    for (let i = 0; i < input.landMask.length; i++) {
      input.landMask[i] = i % 9 === 0 ? 0 : 1;
      input.energy01[i] = (i % 101) / 100;
      input.water01[i] = (i % 97) / 96;
      input.waterStress01[i] = (i % 89) / 88;
      input.biomass01[i] = (i % 79) / 78;
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
