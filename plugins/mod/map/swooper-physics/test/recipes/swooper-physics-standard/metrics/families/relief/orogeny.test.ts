import { describe, expect, it } from "bun:test";
import {
  evaluateMetricTargets,
  measureMetricCount,
  summarizeMetricComponents,
} from "@swooper/mapgen-metrics";

import type { StandardMapProductSample } from "../../../../../../src/recipes/standard/metrics/sample.js";
import { EARTHLIKE_OROGENY_TARGET } from "../../../../../../src/recipes/standard/metrics/targets/relief.js";
import { measureEarthlikeSample } from "../../fixtures/standard-product.js";

type Region = StandardMapProductSample["metrics"]["relief"]["mountainRegion"];

function orogenyFixture(): StandardMapProductSample {
  const base = measureEarthlikeSample();
  return {
    ...base,
    metrics: {
      ...base.metrics,
      relief: {
        ...base.metrics.relief,
        plannedMountains: measureMetricCount(200, 2000),
        plannedMountainComponents: summarizeMetricComponents(
          Array.from({ length: 20 }, () => ({ size: 10, diameter: 9 }))
        ),
        mountainRegion: {
          tiles: 1000,
          components: summarizeMetricComponents([{ size: 1000, diameter: 40 }]),
          mountains: measureMetricCount(200, 1000),
          foothills: measureMetricCount(300, 1000),
          roughLand: measureMetricCount(100, 1000),
          nonMountains: measureMetricCount(800, 1000),
          flatInterior: measureMetricCount(400, 1000),
          flatInteriorComponents: summarizeMetricComponents([{ size: 400, diameter: 30 }]),
        },
      },
    },
  };
}

describe("Earthlike orogeny contract", () => {
  it("retires only the categorical peak-span floor, preserving all regional bounds", () => {
    expect(
      EARTHLIKE_OROGENY_TARGET.expectations.map(({ id, comparator }) => ({ id, comparator }))
    ).toEqual([
      { id: "mountain-presence", comparator: { kind: "at-least", value: 1 } },
      { id: "mountain-region-diameter", comparator: { kind: "at-least", value: 38 } },
      { id: "mountain-region-size", comparator: { kind: "at-least", value: 450 } },
      { id: "mountain-region-non-mountain-share", comparator: { kind: "at-least", value: 0.65 } },
      { id: "mountain-region-flat-share", comparator: { kind: "at-least", value: 0.35 } },
      { id: "mountain-region-flat-volume", comparator: { kind: "at-least", value: 300 } },
      { id: "mountain-region-mountain-share", comparator: { kind: "at-most", value: 0.38 } },
      { id: "mountain-region-shoulder-share", comparator: { kind: "at-least", value: 0.25 } },
    ]);
  });

  it("accepts short categorical spines in a qualifying region without discarding their diagnostic", () => {
    const sample = orogenyFixture();
    const diagnostic = structuredClone(sample.metrics.relief.plannedMountainComponents);
    const [evaluation] = evaluateMetricTargets([sample], [EARTHLIKE_OROGENY_TARGET]);
    expect(evaluation?.status).toBe("pass");
    expect(sample.metrics.relief.plannedMountainComponents.maximumComponentDiameter).toBe(9);
    expect(sample.metrics.relief.plannedMountainComponents).toEqual(diagnostic);
  }, 30_000);

  it("still rejects deficient regional extent and passable interiors regardless of peak span", () => {
    const base = orogenyFixture();
    const deficientRegions: readonly [string, Partial<Region>][] = [
      [
        "mountain-region-diameter",
        { components: summarizeMetricComponents([{ size: 1000, diameter: 37 }]) },
      ],
      [
        "mountain-region-size",
        { components: summarizeMetricComponents([{ size: 449, diameter: 40 }]) },
      ],
      ["mountain-region-non-mountain-share", { nonMountains: measureMetricCount(649, 1000) }],
      ["mountain-region-flat-share", { flatInterior: measureMetricCount(349, 1000) }],
      ["mountain-region-flat-volume", { flatInterior: measureMetricCount(299, 800) }],
      ["mountain-region-mountain-share", { mountains: measureMetricCount(381, 1000) }],
      ["mountain-region-shoulder-share", { foothills: measureMetricCount(149, 1000) }],
    ];
    for (const diameter of [9, 40]) {
      for (const [expectationId, regionPatch] of deficientRegions) {
        const sample: StandardMapProductSample = {
          ...base,
          metrics: {
            ...base.metrics,
            relief: {
              ...base.metrics.relief,
              plannedMountainComponents: summarizeMetricComponents([{ size: 200, diameter }]),
              mountainRegion: { ...base.metrics.relief.mountainRegion, ...regionPatch },
            },
          },
        };
        const [evaluation] = evaluateMetricTargets([base, sample], [EARTHLIKE_OROGENY_TARGET]);
        expect(evaluation?.status).toBe("fail");
        expect(evaluation?.expectations.find(({ id }) => id === expectationId)?.status).toBe(
          "fail"
        );
      }
    }
  }, 30_000);
});
