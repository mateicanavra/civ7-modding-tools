import { describe, expect, it } from "bun:test";
import { evaluateMetricTargets } from "@swooper/mapgen-metrics";

import { EARTHLIKE_CLIMATE_STRUCTURE_TARGET } from "../../../../../../src/recipes/standard/metrics/targets/hydrology.js";
import { EARTHLIKE_CLIMATE_BIOME_STRUCTURE_TARGET } from "../../../../../../src/recipes/standard/metrics/targets/ecology.js";
import { measureEarthlikeSample } from "../../fixtures/standard-product.js";

function boundarySample() {
  const sample = measureEarthlikeSample();
  return {
    ...sample,
    metrics: {
      ...sample.metrics,
      hydrology: {
        ...sample.metrics.hydrology,
        climateStructure: {
          baselineSaturatedLandTiles: { count: 0, population: 100 },
          refinedSaturatedLandTiles: { count: 4, population: 100 },
          maximumSeasonalLandSaturationFraction: 0.09,
          pooledWithinRowTemperatureSdC: 1,
        },
      },
      ecology: {
        ...sample.metrics.ecology,
        biomeRows: {
          ...sample.metrics.ecology.biomeRows,
          dominantBiomeTiles: { count: 75, population: 100 },
        },
        coldBiomeTiles: { count: 1, population: 100 },
        biomeDiversity: 3,
      },
    },
  };
}

describe("Earthlike climate target boundaries", () => {
  it("accepts rainfall below its limits and inclusive temperature/biome boundaries", () => {
    const lower = boundarySample();
    const upper = boundarySample();
    upper.metrics.hydrology.climateStructure.pooledWithinRowTemperatureSdC = 8;
    const results = evaluateMetricTargets([lower, upper], [
      EARTHLIKE_CLIMATE_STRUCTURE_TARGET,
      EARTHLIKE_CLIMATE_BIOME_STRUCTURE_TARGET,
    ]);
    expect(results.every((target) => target.status === "pass")).toBe(true);
  }, 30_000);

  it("rejects rainfall exactly at either pre-declared ceiling", () => {
    const boundary = boundarySample();
    boundary.metrics.hydrology.climateStructure.maximumSeasonalLandSaturationFraction = 0.1;
    boundary.metrics.hydrology.climateStructure.refinedSaturatedLandTiles.count = 5;
    const [result] = evaluateMetricTargets([boundary], [EARTHLIKE_CLIMATE_STRUCTURE_TARGET]);
    expect(result?.expectations.filter(({ status }) => status === "fail").map(({ id }) => id)).toEqual([
      "seasonal-land-rainfall-saturation",
      "refined-land-rainfall-saturation",
    ]);
  }, 30_000);

  it("rejects a single bad member rather than hiding it in a cohort average", () => {
    const good = boundarySample();
    const bad = boundarySample();
    bad.metrics.hydrology.climateStructure.maximumSeasonalLandSaturationFraction = 0.1001;
    bad.metrics.hydrology.climateStructure.refinedSaturatedLandTiles.count = 6;
    bad.metrics.hydrology.climateStructure.pooledWithinRowTemperatureSdC = 0;
    bad.metrics.ecology.biomeRows.dominantBiomeTiles.count = 76;
    const [climate, biomes] = evaluateMetricTargets([good, bad], [
      EARTHLIKE_CLIMATE_STRUCTURE_TARGET,
      EARTHLIKE_CLIMATE_BIOME_STRUCTURE_TARGET,
    ]);
    expect(
      climate?.expectations.filter(({ status }) => status === "fail").map(({ id }) => id)
    ).toEqual([
      "seasonal-land-rainfall-saturation",
      "refined-land-rainfall-saturation",
      "within-row-temperature-variation-floor",
    ]);
    expect(
      biomes?.expectations.find(({ id }) => id === "land-weighted-row-biome-dominance")
    ).toMatchObject({ status: "fail", observed: 0.76 });
    bad.metrics.hydrology.climateStructure.pooledWithinRowTemperatureSdC = 8.001;
    const [tooVariable] = evaluateMetricTargets([good, bad], [EARTHLIKE_CLIMATE_STRUCTURE_TARGET]);
    expect(
      tooVariable?.expectations.find(({ id }) => id === "within-row-temperature-variation-ceiling")
    ).toMatchObject({ status: "fail", observed: 8.001 });
  }, 30_000);
});
