import { describe, expect, it } from "bun:test";
import { measureStandardRelief } from "../../../../../../src/recipes/standard/metrics/families/relief.js";
import { reliefCoherenceFixture } from "../../fixtures/relief-coherence.js";

function fixture(width = 6, height = 2) {
  const base = reliefCoherenceFixture(width, height);
  const size = width * height;
  return {
    ...base,
    model: {
      ...base.model,
      hillMask: new Uint8Array(size),
      mountainRegionMask: new Uint8Array(size),
      volcanoes: [],
    },
    observation: {
      ...base.observation,
      feature: new Int32Array(size).fill(-1),
      volcanoFeature: 9,
    },
  };
}

const plannedCategories = ["plannedMountains", "plannedHills", "plannedFoothills", "plannedRoughLandHills", "plannedRoughTerrain"] as const;

describe("Standard planned relief surface population", () => {
  it("uses exposed land for every certified planned category, without changing geological or observed diagnostics", () => {
    const input = fixture();
    input.model.landMask[11] = 0;
    input.model.plannedLakeMask.set([1, 1, 1]);
    // A malformed wet mark on original marine terrain must not subtract land a second time.
    input.model.plannedLakeMask[11] = 1;
    input.model.mountainMask[3] = 1;
    input.model.hillMask.set([1, 1, 1], 4);
    input.model.foothillMask.set([1, 1], 4);
    input.model.roughLandMask[6] = 1;
    input.model.mountainRegionMask.fill(1, 0, 7);
    input.model.elevation[0] = 500;
    input.observation.terrain.set([1, 2, 2, 2], 3);
    input.observation.isWater.set([1, 1, 1]);
    input.observation.isWater[11] = 1;
    const beforeLand = Uint8Array.from(input.model.landMask);
    const beforeLakes = Uint8Array.from(input.model.plannedLakeMask);

    const noLakes = measureStandardRelief({ ...input, model: { ...input.model,
      plannedLakeMask: new Uint8Array(input.model.plannedLakeMask.length) } });
    const result = measureStandardRelief(input);
    for (const key of plannedCategories) {
      expect(noLakes[key].population).toBe(11);
      expect(result[key].population).toBe(8);
      expect(result[key].count).toBe(noLakes[key].count);
    }
    expect(plannedCategories.map((key) => result[key].count)).toEqual([1, 3, 2, 1, 4]);
    expect(result.mountainRegion).toEqual(noLakes.mountainRegion);
    expect(result.mountainRegion.tiles).toBe(7);
    expect(result.finalLandElevation).toEqual(noLakes.finalLandElevation);
    expect(result.finalLandElevation.maximum).toBe(500);
    expect(result.coherence.plannedLandTiles).toBe(11);
    for (const key of ["finalMountains", "finalNonVolcanoMountains", "finalHills", "finalRoughTerrain", "finalNonVolcanoRoughTerrain", "finalFlatTerrain"] as const) {
      expect(result[key]).toEqual(noLakes[key]);
      expect(result[key].population).toBe(11);
    }
    expect(input.model.landMask).toEqual(beforeLand);
    expect(input.model.plannedLakeMask).toEqual(beforeLakes);
  });

  for (const { seed, originalLand, exposedLand, foothills, floor } of [
    { seed: 1018, originalLand: 2720, exposedLand: 2517, foothills: 317, floor: 0.12 },
    { seed: 7777, originalLand: 2656, exposedLand: 2484, foothills: 207, floor: 0.08 },
  ]) {
    it(`quantifies the seed ${seed} population correction without fitting counts or thresholds`, () => {
      const input = fixture(68, 40);
      input.model.landMask.fill(0, originalLand);
      input.observation.isWater.fill(1, originalLand);
      input.model.plannedLakeMask.fill(1, exposedLand, originalLand);
      input.model.foothillMask.fill(1, 0, foothills);
      input.model.hillMask.fill(1, 0, foothills);
      const result = measureStandardRelief(input).plannedFoothills;
      expect(result).toEqual({ count: foothills, population: exposedLand });
      expect(foothills / originalLand).toBeLessThan(floor);
      expect(result.count / result.population!).toBeGreaterThan(floor);
    });
  }

  it("updates planned surface shares while preserving their counts when lake intent changes", () => {
    const input = fixture();
    input.model.mountainMask[0] = 1;
    input.model.hillMask[1] = 1;
    input.model.foothillMask[1] = 1;
    const before = measureStandardRelief(input);
    input.model.plannedLakeMask.fill(1, 3, 8);
    const after = measureStandardRelief(input);
    for (const key of plannedCategories) {
      expect(after[key].count).toBe(before[key].count);
      expect(before[key].population).toBe(12);
      expect(after[key].population).toBe(7);
    }
  });
});
