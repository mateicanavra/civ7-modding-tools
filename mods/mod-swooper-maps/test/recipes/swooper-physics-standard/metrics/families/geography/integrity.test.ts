import { describe, expect, it } from "bun:test";
import { evaluateMetricTargets } from "@swooper/mapgen-metrics";
import { EARTHLIKE_GEOGRAPHY_TARGET } from "../../../../../../src/recipes/standard/metrics/targets/geography.js";
import { measureEarthlikeSample } from "../../fixtures/standard-product.js";

describe("Standard geography metrics", () => {
  it("fails the Earthlike target when continental shelf evidence ends at the shoreline", () => {
    const sample = measureEarthlikeSample();
    const withoutOuterShelf = {
      ...sample,
      metrics: {
        ...sample.metrics,
        geography: {
          ...sample.metrics.geography,
          shelfBeyondShoreline: {
            ...sample.metrics.geography.shelfBeyondShoreline,
            count: 0,
          },
        },
      },
    };

    const [geography] = evaluateMetricTargets(withoutOuterShelf, [EARTHLIKE_GEOGRAPHY_TARGET]);
    expect(geography?.expectations.find(({ id }) => id === "shelf-beyond-shoreline")).toMatchObject(
      { status: "fail", observed: 0 }
    );
  }, 30_000);
});
