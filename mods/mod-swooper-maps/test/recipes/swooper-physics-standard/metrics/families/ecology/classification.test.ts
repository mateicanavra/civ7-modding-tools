import { describe, expect, it } from "bun:test";
import { evaluateMetricTargets } from "@swooper/mapgen-metrics";
import { measureStandardMapCapture } from "../../../../../../src/recipes/standard/metrics/sample.js";
import { STANDARD_INTEGRITY_TARGET } from "../../../../../../src/recipes/standard/metrics/targets/integrity.js";
import { captureEarthlikeScenario } from "../../fixtures/standard-product.js";

describe("Standard ecology metrics", () => {
  it("measures unclassified modeled land and lets integrity reject the observation", () => {
    const capture = captureEarthlikeScenario();
    const modeledLandIndex = capture.model.landMask.findIndex((value) => value === 1);
    if (modeledLandIndex < 0) throw new Error("Metric fixture has no modeled land.");
    const biomeIndex = capture.model.biomeIndex.slice();
    biomeIndex[modeledLandIndex] = 255;
    const sample = measureStandardMapCapture({
      ...capture,
      model: { ...capture.model, biomeIndex },
    });

    expect(sample.metrics.ecology.unclassifiedModeledLand.count).toBe(1);
    const [integrity] = evaluateMetricTargets(sample, [STANDARD_INTEGRITY_TARGET]);
    expect(
      integrity?.expectations.find(({ id }) => id === "modeled-land-biome-classification")
    ).toMatchObject({ status: "fail", observed: 1 });
  }, 30_000);
});
