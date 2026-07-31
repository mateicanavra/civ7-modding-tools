import { describe, expect, it } from "bun:test";
import {
  admitsQualifyingLandmassDensityChange,
  qualifyingLandmassDensitySpread,
  qualifyingLandmassRows,
} from "../../../../../src/domain/resources/model/policy/qualifying-landmass-density.js";

describe("qualifying-landmass density policy", () => {
  it("rejects the count-balanced addition that overshoots density on an unequal-area landmass", () => {
    const rows = qualifyingLandmassRows([10, 90]);
    const counts = new Map([
      [0, 1],
      [1, 9],
    ]);

    expect(qualifyingLandmassDensitySpread(rows, counts).densityRatio).toBe(1);
    expect(
      admitsQualifyingLandmassDensityChange({
        qualifyingRows: rows,
        resourceCountByLandmass: counts,
        maxDensityRatio: 1.8,
        addedLandmassId: 0,
      })
    ).toBe(false);
    expect(
      admitsQualifyingLandmassDensityChange({
        qualifyingRows: rows,
        resourceCountByLandmass: counts,
        maxDensityRatio: 1.8,
        addedLandmassId: 1,
      })
    ).toBe(true);
  });

  it("admits a same-landmass move as a density no-op", () => {
    const rows = qualifyingLandmassRows([50, 50]);
    const counts = new Map([
      [0, 4],
      [1, 2],
    ]);

    expect(
      admitsQualifyingLandmassDensityChange({
        qualifyingRows: rows,
        resourceCountByLandmass: counts,
        maxDensityRatio: 1.8,
        removedLandmassId: 0,
        addedLandmassId: 0,
      })
    ).toBe(true);
  });

  it("admits repair from an infinite zero-count spread but rejects worsening it", () => {
    const rows = qualifyingLandmassRows([50, 50]);
    const counts = new Map([
      [0, 4],
      [1, 0],
    ]);

    expect(qualifyingLandmassDensitySpread(rows, counts).densityRatio).toBe(
      Number.POSITIVE_INFINITY
    );
    expect(
      admitsQualifyingLandmassDensityChange({
        qualifyingRows: rows,
        resourceCountByLandmass: counts,
        maxDensityRatio: 1.8,
        addedLandmassId: 1,
      })
    ).toBe(true);
    expect(
      admitsQualifyingLandmassDensityChange({
        qualifyingRows: rows,
        resourceCountByLandmass: counts,
        maxDensityRatio: 1.8,
        addedLandmassId: 0,
      })
    ).toBe(false);
  });
});
