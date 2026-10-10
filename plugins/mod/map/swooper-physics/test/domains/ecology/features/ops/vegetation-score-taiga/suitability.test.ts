import { describe, expect, it } from "bun:test";
import { normalizeOperationSelectionForTest } from "@swooper/mapgen-core/testing";
import ecology from "../../../../../../src/domain/ecology/router.js";
import { TEST_MAP_SIZE } from "../../../../../setup.js";

function coldForestFields() {
  const { width, height } = TEST_MAP_SIZE.dimensions;
  const size = width * height;
  return {
    width,
    height,
    landMask: new Uint8Array(size).fill(1),
    energy01: new Float32Array(size).fill(0.28),
    atmosphericWater01: new Float32Array(size).fill(0.48),
    plantWaterStress01: new Float32Array(size),
    coldStress01: new Float32Array(size).fill(0.65),
    biomass01: new Float32Array(size),
    fertility01: new Float32Array(size).fill(0.6),
  };
}

function score(input: ReturnType<typeof coldForestFields>): Float32Array {
  return ecology.features.ops.scoreVegetationTaiga.run(
    input,
    normalizeOperationSelectionForTest(
      ecology.features.ops.scoreVegetationTaiga,
      ecology.features.ops.scoreVegetationTaiga.defaultConfig
    )
  ).score01;
}

// Preserve the released atmospheric response and the unchanged warm energy shoulder exactly.
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

describe("taiga suitability", () => {
  it("uses the energy envelope without an independent frost requirement or veto", () => {
    const input = coldForestFields();
    input.coldStress01.set([0, 0.05, 0.1297498643398285, 0.23, 0.35, 0.65, 0.9, 1]);
    input.fertility01.set([0, 1, 0.2, 0.8, 0.4, 0.6, 1, 0]);

    const scores = score(input);

    expect(scores).toEqual(new Float32Array(scores.length).fill(0.35));
    input.biomass01.fill(1);
    expect(score(input)).toEqual(new Float32Array(scores.length).fill(1));
  });

  it("closes the zero-energy endpoint while preserving the existing warm exclusion", () => {
    const input = coldForestFields();
    const energy = [0, 0.001, 0.08, 0.1, 0.2, 0.38, 0.5, 0.62, 0.8, 1];
    input.energy01.set(energy);
    input.coldStress01.fill(1);

    const scores = score(input);

    expect(scores[0]).toBe(0);
    expect(scores[1]).toBeGreaterThan(0);
    expect(scores[1]).toBeLessThan(scores[2]!);
    expect(scores[2]).toBeCloseTo(0.35 * 0.352, 6);
    expect(scores[3]).toBeCloseTo(0.35 * 0.5, 6);
    for (let i = 4; i < energy.length; i++) {
      expect(scores[i]).toBe(Math.fround(0.35 * legacyBandpass(input.energy01[i]!, 0.08, 0.5, 0.12)));
    }
    for (const i of [7, 8, 9]) expect(scores[i]).toBe(0);
  });

  it("exactly retains the atmospheric habitat band, biomass baseline, and plant-stress attenuation", () => {
    const input = coldForestFields();
    const water = [0, 0.1, 0.1001, 0.16, 0.22, 0.34, 0.48, 0.66, 0.78, 0.9, 0.9001, 1];
    const expected = new Float32Array(input.landMask.length);
    for (let i = 0; i < expected.length; i++) {
      input.atmosphericWater01[i] = water[i % water.length]!;
      input.biomass01[i] = (Math.floor(i / water.length) % 5) / 4;
      input.plantWaterStress01[i] = (Math.floor(i / (water.length * 5)) % 5) / 4;
      expected[i] =
        (0.35 + 0.65 * input.biomass01[i]!) *
        legacyBandpass(input.atmosphericWater01[i]!, 0.22, 0.78, 0.12) *
        (1 - 0.75 * input.plantWaterStress01[i]!);
    }

    expect(score(input)).toEqual(expected);

    input.atmosphericWater01.fill(0.48);
    input.biomass01.fill(0.12);
    input.plantWaterStress01.set([1, 0.75, 0.5, 0.25, 0]);
    const scores = score(input);
    for (let i = 1; i < 5; i++) expect(scores[i]).toBeGreaterThan(scores[i - 1]!);
    expect(scores[0]).toBe(Math.fround(scores[4]! * 0.25));
  });

  it("is deterministic, bounded, masks water, and leaves every admitted input field unchanged", () => {
    const input = coldForestFields();
    const fields = [
      input.landMask,
      input.energy01,
      input.atmosphericWater01,
      input.plantWaterStress01,
      input.coldStress01,
      input.biomass01,
      input.fertility01,
    ];
    for (let i = 0; i < input.landMask.length; i++) {
      input.landMask[i] = i % 9 === 0 ? 0 : 1;
      input.energy01[i] = (i % 101) / 100;
      input.atmosphericWater01[i] = (i % 97) / 96;
      input.plantWaterStress01[i] = (i % 89) / 88;
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
    for (let i = 0; i < first.length; i++) {
      expect(Number.isFinite(first[i])).toBe(true);
      expect(first[i]).toBeGreaterThanOrEqual(0);
      expect(first[i]).toBeLessThanOrEqual(1);
      if (input.landMask[i] === 0) expect(first[i]).toBe(0);
    }
    for (let i = 0; i < fields.length; i++) expect(fields[i]).toEqual(snapshots[i]);
  });
});
