import { describe, expect, it } from "bun:test";
import { evaluateMetricTargets } from "@swooper/mapgen-metrics";
import type { StandardMapCapture } from "../../../../../../src/recipes/standard/metrics/capture.js";
import { measureStandardMapCapture } from "../../../../../../src/recipes/standard/metrics/sample.js";
import { measureStandardGeography } from "../../../../../../src/recipes/standard/metrics/families/geography.js";
import { EARTHLIKE_GEOGRAPHY_TARGET } from "../../../../../../src/recipes/standard/metrics/targets/geography.js";
import { STANDARD_INTEGRITY_TARGET } from "../../../../../../src/recipes/standard/metrics/targets/integrity.js";
import {
  captureEarthlikeScenario,
  measureEarthlikeSample,
} from "../../fixtures/standard-product.js";

describe("Standard geography metrics", () => {
  it("restricts historical shelf evidence to external water, excluding newly dry and retained-lake initial water", () => {
    const capture = captureEarthlikeScenario();
    capture.model.shelfMask.fill(0);
    capture.model.shelfMask.set([1, 1, 1]);
    capture.model.landMask.set([0, 0, 0]);
    capture.model.externalWaterMask.set([1, 0, 0]);
    capture.model.exposedLandMask.set([0, 1, 0]);
    capture.model.plannedLakeMask.set([0, 0, 1]);
    capture.model.coastalWater.set([0, 0, 0]);
    capture.model.distanceToCoast.set([3, 3, 3]);
    capture.observation.isWater.set([1, 0, 1]);
    expect(measureStandardGeography(capture).shelfBeyondShoreline.count).toBe(1);
    capture.model.landMask.set([0, 1, 1]);
    expect(measureStandardGeography(capture).shelfBeyondShoreline.count).toBe(1);
  }, 30_000);
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

  it("fails product integrity when the terminal engine water surface drifts from recipe intent", () => {
    const capture = captureEarthlikeScenario();
    const withWaterDrift: StandardMapCapture = {
      ...capture,
      projection: {
        ...capture.projection,
        placementParity: {
          ...capture.projection.placementParity,
          waterDriftCount: 1,
        },
      },
    };

    const [integrity] = evaluateMetricTargets(measureStandardMapCapture(withWaterDrift), [
      STANDARD_INTEGRITY_TARGET,
    ]);
    expect(
      integrity?.expectations.find(({ id }) => id === "final-water-surface-drift")
    ).toMatchObject({
      status: "fail",
      observed: 1,
    });
  }, 30_000);
});
