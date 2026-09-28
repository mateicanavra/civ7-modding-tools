import { describe, expect, it } from "bun:test";
import { evaluateMetricTargets } from "@swooper/mapgen-metrics";
import { STANDARD_INTEGRITY_TARGET } from "../../../../../../src/recipes/standard/metrics/targets/integrity.js";
import { measureEarthlikeSample } from "../../fixtures/standard-product.js";

describe("Standard hydrology metric integrity", () => {
  it("separates certified native classification from water closure without relaxing legacy", () => {
    const sample = measureEarthlikeSample();
    for (const model of ["certified-sill-spill", "legacy-sink-budget"] as const) {
      for (const waterLoss of [0, 1]) {
        const classifiedWater = {
          ...sample,
          metrics: {
            ...sample.metrics,
            geography: {
              ...sample.metrics.geography,
              waterDriftCount: waterLoss,
              finalLakeWaterDriftCount: waterLoss,
              finalLakeClassificationDriftCount: 48,
            },
            hydrology: { ...sample.metrics.hydrology, model },
          },
        };
        const [measured] = evaluateMetricTargets(classifiedWater, [STANDARD_INTEGRITY_TARGET]);
        expect(measured!.expectations.find(({ id }) => id === "final-lake-classification-drift")?.status)
          .toBe(model === "legacy-sink-budget" ? "fail" : "pass");
        for (const id of ["final-water-surface-drift", "final-lake-water-drift"]) {
          expect(measured!.expectations.find((entry) => entry.id === id)?.status)
            .toBe(waterLoss === 0 ? "pass" : "fail");
        }
        expect(classifiedWater.metrics.geography.finalLakeClassificationDriftCount).toBe(48);
      }
    }
  }, 30_000);

  it("retains singleton quotas only for legacy selection without waiving certified evidence", () => {
    const sample = measureEarthlikeSample();
    for (const model of ["certified-sill-spill", "legacy-sink-budget"] as const) {
      const withSingletons = {
        ...sample,
        metrics: {
          ...sample.metrics,
          geography: {
            ...sample.metrics.geography,
            singleTileLakeTiles: { count: 5, population: 10 },
          },
          hydrology: { ...sample.metrics.hydrology, model, basinNetwork: null },
        },
      };
      const [measured] = evaluateMetricTargets(withSingletons, [STANDARD_INTEGRITY_TARGET]);
      expect(measured!.expectations.find(({ id }) => id === "single-tile-lake-share")?.status)
        .toBe(model === "legacy-sink-budget" ? "fail" : "pass");
      expect(measured!.expectations.find(({ id }) => id === "certified-basin-footprints")?.status)
        .toBe(model === "legacy-sink-budget" ? "pass" : "fail");
    }
  }, 30_000);

  it("requires certified evidence and preserves explicit legacy absence", () => {
    const sample = measureEarthlikeSample();
    const ids = [
      "certified-basin-conservation",
      "certified-basin-certificates",
      "certified-basin-footprints",
      "certified-basin-exposure",
      "certified-lake-projection",
      "certified-river-source-classes",
    ];
    const [admitted] = evaluateMetricTargets(sample, [STANDARD_INTEGRITY_TARGET]);
    expect(
      admitted!.expectations.filter(({ id }) => ids.includes(id)).map(({ status }) => status)
    ).toEqual(ids.map(() => "pass"));
    for (const model of ["certified-sill-spill", "legacy-sink-budget"] as const) {
      const missing = {
        ...sample,
        metrics: {
          ...sample.metrics,
          hydrology: { ...sample.metrics.hydrology, model, basinNetwork: null },
        },
      };
      const [measured] = evaluateMetricTargets(missing, [STANDARD_INTEGRITY_TARGET]);
      expect(
        measured!.expectations.filter(({ id }) => ids.includes(id)).map(({ status }) => status)
      ).toEqual(ids.map(() => (model === "legacy-sink-budget" ? "pass" : "fail")));
    }
  }, 30_000);

  it("fails product integrity when a completed river network retains an unresolved mouth", () => {
    const sample = measureEarthlikeSample();
    const withOpenRiverNetwork = {
      ...sample,
      metrics: {
        ...sample.metrics,
        hydrology: {
          ...sample.metrics.hydrology,
          networkSummary: {
            ...sample.metrics.hydrology.networkSummary,
            unresolvedMouthTileCount: 1,
          },
        },
      },
    };

    const [integrity] = evaluateMetricTargets(withOpenRiverNetwork, [STANDARD_INTEGRITY_TARGET]);
    expect(integrity?.expectations.find(({ id }) => id === "river-network-closure")).toMatchObject({
      status: "fail",
      observed: false,
    });
  }, 30_000);
});
