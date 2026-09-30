import { describe, expect, it } from "bun:test";
import { evaluateMetricTargets } from "@swooper/mapgen-metrics";
import { STANDARD_INTEGRITY_TARGET } from "../../../../../../src/recipes/standard/metrics/targets/integrity.js";
import { measureEarthlikeSample } from "../../fixtures/standard-product.js";

describe("Standard hydrology metric integrity", () => {
  it("separates native classification diagnostics from physical water closure", () => {
    const sample = measureEarthlikeSample();
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
        },
      };
      const [measured] = evaluateMetricTargets(classifiedWater, [STANDARD_INTEGRITY_TARGET]);
      expect(
        measured!.expectations.find(({ id }) => id === "final-lake-classification-drift")
      ).toBeUndefined();
      for (const id of ["final-water-surface-drift", "final-lake-water-drift"]) {
        expect(measured!.expectations.find((entry) => entry.id === id)?.status).toBe(
          waterLoss === 0 ? "pass" : "fail"
        );
      }
      expect(classifiedWater.metrics.geography.finalLakeClassificationDriftCount).toBe(48);
    }
  }, 30_000);

  it("retires selection quotas without waiving complete physical evidence", () => {
    const sample = measureEarthlikeSample();
    const withSingletons = {
      ...sample,
      metrics: {
        ...sample.metrics,
        geography: {
          ...sample.metrics.geography,
          singleTileLakeTiles: { count: 5, population: 10 },
        },
      },
    };
    const [measured] = evaluateMetricTargets(withSingletons, [STANDARD_INTEGRITY_TARGET]);
    for (const id of [
      "single-tile-lake-share",
      "lake-component-count",
      "lake-share",
      "navigable-river-eligibility",
      "navigable-river-chains",
      "durable-major-river-support",
      "navigable-selection-bounds",
    ]) {
      expect(measured!.expectations.find((entry) => entry.id === id)).toBeUndefined();
    }
    expect(
      measured!.expectations.find(({ id }) => id === "certified-basin-footprints")?.status
    ).toBe("pass");
  }, 30_000);

  it("requires completed evidence for every physical integrity check", () => {
    const sample = measureEarthlikeSample();
    const ids = [
      "certified-basin-conservation",
      "certified-basin-ledgers",
      "certified-basin-footprints",
      "certified-basin-exposure",
      "certified-lake-projection",
      "certified-river-source-classes",
    ];
    const [admitted] = evaluateMetricTargets(sample, [STANDARD_INTEGRITY_TARGET]);
    expect(
      admitted!.expectations.filter(({ id }) => ids.includes(id)).map(({ status }) => status)
    ).toEqual(ids.map(() => "pass"));
    const missing = structuredClone(sample);
    (missing.metrics.hydrology as unknown as { basinNetwork: null }).basinNetwork = null;
    const [measured] = evaluateMetricTargets(missing, [STANDARD_INTEGRITY_TARGET]);
    expect(
      measured!.expectations.filter(({ id }) => ids.includes(id)).map(({ status }) => status)
    ).toEqual(ids.map(() => "fail"));
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
