import { describe, expect, it } from "bun:test";
import { evaluateMetricTargets } from "@swooper/mapgen-metrics";

import type { StandardMapMetricCohort } from "../../../../../../src/recipes/standard/metrics/sample.js";
import { EARTHLIKE_ECOLOGY_TARGET } from "../../../../../../src/recipes/standard/metrics/targets/ecology.js";
import { measureEarthlikeSample } from "../../fixtures/standard-product.js";

function rainforestCohort(counts: readonly [number, ...number[]]): StandardMapMetricCohort {
  const sampleWithCount = (count: number) => {
    const sample = measureEarthlikeSample();
    return {
      ...sample,
      metrics: {
        ...sample.metrics,
        ecology: {
          ...sample.metrics.ecology,
          featureCounts: { ...sample.metrics.ecology.featureCounts, FEATURE_RAINFOREST: count },
        },
      },
    };
  };
  const [first, ...rest] = counts;
  return [sampleWithCount(first), ...rest.map(sampleWithCount)];
}

function assertRainforestExpectation(
  cohort: StandardMapMetricCohort,
  observed: number,
  status: "pass" | "fail"
): void {
  const [evaluation] = evaluateMetricTargets(cohort, [EARTHLIKE_ECOLOGY_TARGET]);
  expect(evaluation?.targetId).toBe("swooper-earthlike/ecology-cohort");
  expect(evaluation?.expectations.some(({ id }) => id === "rainforest-presence")).toBe(false);
  const result = evaluation?.expectations.find(({ id }) => id === "rainforest-cohort-non-vacuity");
  expect(result?.id).toBe("rainforest-cohort-non-vacuity");
  expect(result?.observed).toBe(observed);
  expect(result?.comparator).toEqual({ kind: "at-least", value: 1 });
  expect(result?.status).toBe(status);
}

describe("Earthlike rainforest cohort smoke contract", () => {
  it("permits a zero-rainforest member and counts positive maps, not rainforest tiles", () => {
    const cohort = rainforestCohort([0, 1, 3, 1, 1, 1, 1, 1]);
    assertRainforestExpectation(cohort, 7, "pass");
  }, 30_000);

  it("rejects total rainforest erasure even when other vegetation remains", () => {
    const cohort = rainforestCohort([0, 0, 0, 0, 0, 0, 0, 0]);
    for (const sample of cohort) {
      expect(sample.metrics.ecology.featureCounts.FEATURE_FOREST).toBeGreaterThan(0);
      expect(sample.metrics.ecology.featureCounts.FEATURE_TAIGA).toBeGreaterThan(0);
      expect(sample.metrics.ecology.vegetationTiles.count).toBeGreaterThan(0);
    }
    assertRainforestExpectation(cohort, 0, "fail");
  }, 30_000);

  it.each([0, 1, 2, 3, 4, 5, 6, 7])(
    "accepts one rainforest tile only in cohort position %i at the exact smoke boundary",
    (positivePosition) => {
      const counts: [number, ...number[]] = [0, 0, 0, 0, 0, 0, 0, 0];
      counts[positivePosition] = 1;
      assertRainforestExpectation(rainforestCohort(counts), 1, "pass");
    },
    30_000
  );
});
