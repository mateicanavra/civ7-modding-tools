import { describe, expect, it } from "bun:test";
import { metricShare } from "@swooper/mapgen-metrics";

import { measureStandardBiomeRows } from "../../../../../../src/recipes/standard/metrics/families/ecology.js";

function controlledBiomeRows() {
  const width = 40;
  const height = 3;
  const landMask = new Uint8Array(width * height);
  landMask.fill(1, 0, 60);
  landMask.fill(1, 80, 99);
  const biomeIndex = new Uint8Array(width * height).fill(5);
  biomeIndex.fill(0, 0, 30);
  biomeIndex.fill(0, 40, 50);
  return {
    provenance: { width, height },
    model: {
      landMask,
      biomeIndex,
      plannedLakeMask: new Uint8Array(width * height),
      physicalHydrology: { model: "certified-sill-spill" as const },
    },
  };
}

describe("Standard biome-row measurements", () => {
  it("uses exposed land for row qualification and shares without mutating original land", () => {
    const certified = controlledBiomeRows();
    const landBefore = certified.model.landMask.slice();
    certified.model.plannedLakeMask.fill(1, 0, 10);
    certified.model.plannedLakeMask[40] = 1;
    certified.model.biomeIndex.fill(255, 0, 10);
    certified.model.biomeIndex[40] = 255;
    expect(measureStandardBiomeRows(certified).dominantBiomeTiles).toEqual({ count: 20, population: 30 });
    expect(measureStandardBiomeRows(certified).qualifiedRainforestRowCount).toBe(1);
    expect(certified.model.landMask).toEqual(landBefore);
  });

  it("weights row dominance by land population and qualifies exactly twenty land tiles", () => {
    const rows = measureStandardBiomeRows(controlledBiomeRows());
    expect(rows.dominantBiomeTiles).toEqual({ count: 40, population: 60 });
    expect(metricShare(rows.dominantBiomeTiles)).toBe(2 / 3);
    expect(rows.qualifiedRainforestRowCount).toBe(2);
    expect(rows.landRowCount).toBe(3);
  });

  it("treats biome IDs as categories whose numeric spacing cannot change dominance", () => {
    const input = controlledBiomeRows();
    const before = measureStandardBiomeRows(input).dominantBiomeTiles;
    input.model.biomeIndex = input.model.biomeIndex.map((id) => (id === 0 ? 17 : 99));
    expect(measureStandardBiomeRows(input).dominantBiomeTiles).toEqual(before);
  });

  it("counts horizontally uniform classified rows as fully dominant and excludes water", () => {
    const input = controlledBiomeRows();
    input.model.biomeIndex.fill(0);
    for (let index = 0; index < input.model.landMask.length; index += 1) {
      if (input.model.landMask[index] === 0) input.model.biomeIndex[index] = 5;
    }
    expect(measureStandardBiomeRows(input).dominantBiomeTiles).toEqual({
      count: 60,
      population: 60,
    });
  });

  it("distinguishes unclassified IDs and absent qualified rows from measured biomes", () => {
    const input = controlledBiomeRows();
    input.model.biomeIndex.fill(255);
    const rows = measureStandardBiomeRows(input);
    expect(rows.dominantBiomeTiles).toEqual({ count: 0, population: 60 });
    expect(rows.maximumBiomeDiversity).toBe(0);
    input.model.landMask.fill(0);
    input.model.landMask.fill(1, 0, 19);
    const unqualified = measureStandardBiomeRows(input);
    expect(unqualified.dominantBiomeTiles).toEqual({ count: 0, population: 0 });
    expect(metricShare(unqualified.dominantBiomeTiles)).toBeNull();
  });
});
