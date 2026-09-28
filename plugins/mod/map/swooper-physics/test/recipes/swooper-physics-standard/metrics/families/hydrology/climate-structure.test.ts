import { describe, expect, it } from "bun:test";
import { metricShare } from "@swooper/mapgen-metrics";
import { Value } from "typebox/value";

import {
  measureStandardClimateStructure,
  measureStandardSeasonalRainfall,
  type StandardClimateStructureInput,
  StandardSeasonalRainfallMeasurementsSchema,
} from "../../../../../../src/recipes/standard/metrics/families/hydrology/climate-structure.js";

function controlledClimateInput(): StandardClimateStructureInput {
  const landMask = Uint8Array.from([1, 1, 0, 0, 1, 1, 1, 1]);
  return {
    provenance: { width: 4, height: 2 },
    model: {
      landMask,
      baselineRainfall: Uint8Array.from([199, 200, 200, 200, 0, 200, 201, 0]),
      refinedRainfall: Uint8Array.from([200, 199, 200, 200, 199, 0, 0, 0]),
      surfaceTemperature: Float32Array.from([0, 4, 900, -900, 10, 10, 10, 10]),
      seasonalRainfall: measureStandardSeasonalRainfall({
        landMask,
        seasonalRainfall: [
          Uint8Array.from([200, 0, 200, 200, 0, 0, 0, 0]),
          Uint8Array.from([200, 200, 200, 200, 200, 200, 0, 0]),
        ],
      }),
    },
  };
}

describe("Standard climate-structure measurements", () => {
  it("counts land saturation inclusively and retains the worst season", () => {
    const input = controlledClimateInput();
    expect(input.model.seasonalRainfall).toEqual({
      version: 1,
      landTileCount: 6,
      saturatedLandTileCounts: [1, 4],
    });
    expect(
      Value.Check(StandardSeasonalRainfallMeasurementsSchema, input.model.seasonalRainfall)
    ).toBe(true);
    const metrics = measureStandardClimateStructure(input);
    expect(metrics.baselineSaturatedLandTiles).toEqual({ count: 3, population: 6 });
    expect(metrics.refinedSaturatedLandTiles).toEqual({ count: 1, population: 6 });
    expect(metrics.maximumSeasonalLandSaturationFraction).toBe(4 / 6);
  });

  it("pools squared row departures by land population, not an unweighted mean of row SDs", () => {
    expect(
      measureStandardClimateStructure(controlledClimateInput()).pooledWithinRowTemperatureSdC
    ).toBeCloseTo(Math.sqrt(8 / 6), 12);
  });

  it("reports zero variation for flat rows despite different latitude means", () => {
    const input = controlledClimateInput();
    input.model.surfaceTemperature.set([5, 5, 900, -900, -25, -25, -25, -25]);
    expect(measureStandardClimateStructure(input).pooledWithinRowTemperatureSdC).toBe(0);
  });

  it("retains absent land as null evidence, not successful zero saturation or variance", () => {
    const input = controlledClimateInput();
    input.model.landMask.fill(0);
    const seasonalRainfall = measureStandardSeasonalRainfall({
      landMask: input.model.landMask,
      seasonalRainfall: [input.model.baselineRainfall],
    });
    const metrics = measureStandardClimateStructure({
      ...input,
      model: { ...input.model, seasonalRainfall },
    });
    expect(metrics.baselineSaturatedLandTiles).toEqual({ count: 0, population: 0 });
    expect(metricShare(metrics.refinedSaturatedLandTiles)).toBeNull();
    expect(metrics.maximumSeasonalLandSaturationFraction).toBeNull();
    expect(metrics.pooledWithinRowTemperatureSdC).toBeNull();
  });

  it("refuses missing seasons, truncated arrays, or mismatched seasonal counts", () => {
    const input = controlledClimateInput();
    expect(() =>
      measureStandardSeasonalRainfall({ landMask: input.model.landMask, seasonalRainfall: [] })
    ).toThrow("at least one observed season");
    expect(() =>
      measureStandardSeasonalRainfall({
        landMask: input.model.landMask,
        seasonalRainfall: [new Uint8Array(1)],
      })
    ).toThrow("identical length");
    expect(() =>
      measureStandardClimateStructure({
        ...input,
        model: { ...input.model, surfaceTemperature: new Float32Array(1) },
      })
    ).toThrow("complete rainfall, land, and temperature grids");
    for (const seasonalRainfall of [
      { version: 1 as const, landTileCount: 7, saturatedLandTileCounts: [1] },
      { version: 1 as const, landTileCount: 6, saturatedLandTileCounts: [7] },
      { version: 1 as const, landTileCount: 6, saturatedLandTileCounts: [] },
    ]) {
      expect(() =>
        measureStandardClimateStructure({
          ...input,
          model: { ...input.model, seasonalRainfall },
        })
      ).toThrow("same land population");
    }
  });
});
