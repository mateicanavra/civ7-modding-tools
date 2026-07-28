import { describe, expect, it } from "bun:test";
import { evaluateMetricTargets } from "@swooper/mapgen-metrics";
import { STANDARD_INTEGRITY_TARGET } from "../../../../../../src/recipes/standard/metrics/targets/integrity.js";
import { measureEarthlikeSample } from "../../fixtures/standard-product.js";

describe("Standard hydrology metric integrity", () => {
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
