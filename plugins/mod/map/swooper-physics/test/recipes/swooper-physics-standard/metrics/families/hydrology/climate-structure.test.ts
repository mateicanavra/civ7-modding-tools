import { describe, expect, it } from "bun:test";
import { metricShare } from "@swooper/mapgen-metrics";
import { Value } from "typebox/value";

import {
  measureStandardClimateStructure,
  measureStandardSeasonalRainfallCodec,
  type StandardClimateStructureInput,
  StandardSeasonalRainfallCodecMeasurementsSchema,
} from "../../../../../../src/recipes/standard/metrics/families/hydrology/climate-structure.js";
import { captureFreshEarthlikeScenario } from "../../fixtures/standard-product.js";

function controlledClimateInput(): StandardClimateStructureInput {
  const landMask = Uint8Array.from([1, 1, 0, 0, 1, 1, 1, 1]);
  return {
    provenance: { width: 4, height: 2 },
    model: {
      landMask,
      baselineRainfallCodec: Uint8Array.from([199, 200, 200, 200, 0, 200, 200, 0]),
      refinedRainfallCodec: Uint8Array.from([200, 199, 200, 200, 199, 0, 0, 0]),
      surfaceTemperature: Float32Array.from([0, 4, 900, -900, 10, 10, 10, 10]),
      seasonalRainfallCodec: measureStandardSeasonalRainfallCodec({
        landMask,
        seasonalIntegration: {
          model: "periodic-cycle",
          phaseOrigin: "northward-equinox",
          phases: [0.25, 0.75],
          weights: [0.5, 0.5],
          observationIndices: [0, 1],
          precipitation: [
            Float32Array.from([199.5, 199.49, 800, 800, 0, 0, 0, 0]),
            Float32Array.from([200.25, 800, 200, 200, 600, 199.5, 0, 0]),
          ],
        },
      }),
    },
  };
}

describe("Standard climate-structure measurements", () => {
  it("captures immutable complete periodic sampling metadata", () => {
    const capture = captureFreshEarthlikeScenario();
    expect(capture.moistureDiagnostics).toBeUndefined();
    const measurement = capture.model.seasonalRainfallCodec;
    if (measurement.version !== 2)
      throw new Error("Earthlike must retain periodic integration evidence.");
    expect(measurement.saturatedLandTileCounts).toHaveLength(24);
    expect(measurement.sampling.phases).toEqual(
      Array.from({ length: 24 }, (_, index) => index / 24)
    );
    expect(measurement.sampling.observationIndices).toEqual([0, 6, 12, 18]);
    for (const record of [
      measurement,
      measurement.sampling,
      measurement.saturatedLandTileCounts,
      measurement.sampling.phases,
      measurement.sampling.weights,
      measurement.sampling.observationIndices,
    ]) {
      expect(Object.isFrozen(record)).toBe(true);
    }
    expect(Reflect.set(measurement.sampling.phases, "0", 0.5)).toBe(false);
    expect(measurement.sampling.phases[0]).toBe(0);
  }, 30_000);

  it("retains full periodic integration counts independently of selected observations", () => {
    const input = controlledClimateInput();
    const precipitation = Array.from({ length: 24 }, () => new Float32Array(8));
    precipitation[5]!.fill(200);
    const phases = Array.from({ length: 24 }, (_, index) => index / 24);
    const weights = new Array<number>(24).fill(1 / 24);
    const measurement = measureStandardSeasonalRainfallCodec({
      landMask: input.model.landMask,
      seasonalIntegration: {
        model: "periodic-cycle",
        phaseOrigin: "northward-equinox",
        phases,
        weights,
        observationIndices: [6, 18],
        precipitation,
      },
    });
    expect(measurement.version).toBe(2);
    expect(Value.Check(StandardSeasonalRainfallCodecMeasurementsSchema, measurement)).toBe(true);
    expect(measurement.saturatedLandTileCounts).toHaveLength(24);
    expect(measurement.saturatedLandTileCounts[5]).toBe(6);
    expect(
      measureStandardClimateStructure({
        ...input,
        model: { ...input.model, seasonalRainfallCodec: measurement },
      }).maximumSeasonalLandSaturationFraction
    ).toBe(1);
    if (measurement.version !== 2) throw new Error("Expected periodic evidence.");
    phases[0] = 0.1;
    weights[0] = 0;
    expect(measurement.sampling.phases[0]).toBe(0);
    expect(measurement.sampling.weights[0]).toBe(1 / 24);
    expect(Object.isFrozen(measurement.sampling.phases)).toBe(true);
    expect(Object.isFrozen(measurement.sampling.observationIndices)).toBe(true);
    for (const sampling of [
      { ...measurement.sampling, phases: [0] },
      { ...measurement.sampling, weights: new Array<number>(24).fill(1) },
      { ...measurement.sampling, observationIndices: [6, 24] },
    ]) {
      expect(() =>
        measureStandardClimateStructure({
          ...input,
          model: { ...input.model, seasonalRainfallCodec: { ...measurement, sampling } },
        })
      ).toThrow("Seasonal integration");
    }
  });

  it("counts land codec saturation inclusively after seasonal float conversion and retains the worst season", () => {
    const input = controlledClimateInput();
    expect(input.model.seasonalRainfallCodec).toEqual({
      version: 2,
      landTileCount: 6,
      saturatedLandTileCounts: [1, 4],
      sampling: {
        model: "periodic-cycle", phaseOrigin: "northward-equinox",
        phases: [0.25, 0.75], weights: [0.5, 0.5], observationIndices: [0, 1],
      },
    });
    expect(
      Value.Check(StandardSeasonalRainfallCodecMeasurementsSchema, input.model.seasonalRainfallCodec)
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
    const seasonalRainfallCodec = measureStandardSeasonalRainfallCodec({
      landMask: input.model.landMask,
      seasonalIntegration: {
        ...input.model.seasonalRainfallCodec.sampling,
        precipitation: [Float32Array.from(input.model.baselineRainfallCodec), Float32Array.from(input.model.baselineRainfallCodec)],
      },
    });
    const metrics = measureStandardClimateStructure({
      ...input,
      model: { ...input.model, seasonalRainfallCodec },
    });
    expect(metrics.baselineSaturatedLandTiles).toEqual({ count: 0, population: 0 });
    expect(metricShare(metrics.refinedSaturatedLandTiles)).toBeNull();
    expect(metrics.maximumSeasonalLandSaturationFraction).toBeNull();
    expect(metrics.pooledWithinRowTemperatureSdC).toBeNull();
  });

  it("refuses missing seasons, truncated arrays, or mismatched seasonal counts", () => {
    const input = controlledClimateInput();
    expect(() =>
      measureStandardSeasonalRainfallCodec({
        landMask: input.model.landMask,
        seasonalIntegration: { ...input.model.seasonalRainfallCodec.sampling, precipitation: [] },
      })
    ).toThrow("at least one observed season");
    expect(() =>
      measureStandardSeasonalRainfallCodec({
        landMask: input.model.landMask,
        seasonalIntegration: {
          ...input.model.seasonalRainfallCodec.sampling, precipitation: [new Float32Array(1), new Float32Array(1)],
        },
      })
    ).toThrow("identical length");
    expect(() =>
      measureStandardClimateStructure({
        ...input,
        model: { ...input.model, surfaceTemperature: new Float32Array(1) },
      })
    ).toThrow("complete rainfall-codec, land, and temperature grids");
    for (const seasonalRainfallCodec of [
      { ...input.model.seasonalRainfallCodec, landTileCount: 7 },
      { ...input.model.seasonalRainfallCodec, saturatedLandTileCounts: [7, 4] },
      { ...input.model.seasonalRainfallCodec, saturatedLandTileCounts: [-1, 4] },
    ]) {
      expect(() =>
        measureStandardClimateStructure({
          ...input,
          model: { ...input.model, seasonalRainfallCodec },
        })
      ).toThrow("same land population");
    }
  });

  it("refuses retired measurement envelopes and non-current integration metadata", () => {
    const input = controlledClimateInput();
    expect(Value.Check(StandardSeasonalRainfallCodecMeasurementsSchema, {
      version: 1, landTileCount: 6, saturatedLandTileCounts: [1, 4],
    })).toBe(false);
    for (const sampling of [
      { ...input.model.seasonalRainfallCodec.sampling, model: "legacy-snapshots" },
      { ...input.model.seasonalRainfallCodec.sampling, phaseOrigin: "solstice" },
      { ...input.model.seasonalRainfallCodec.sampling, phases: [0.75, 0.25] },
      { ...input.model.seasonalRainfallCodec.sampling, observationIndices: [0, 0] },
    ]) {
      expect(() => measureStandardSeasonalRainfallCodec({
        landMask: input.model.landMask,
        seasonalIntegration: { ...sampling, precipitation: [new Float32Array(8), new Float32Array(8)] } as never,
      })).toThrow("Seasonal integration");
    }
  });
});
