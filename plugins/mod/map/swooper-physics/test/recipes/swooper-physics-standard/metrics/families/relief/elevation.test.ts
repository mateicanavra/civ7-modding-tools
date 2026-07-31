import { describe, expect, it } from "bun:test";

import { evaluateMetricTargets } from "@swooper/mapgen-metrics";
import type {
  StandardMapMetricCohort,
  StandardMapProductSample,
} from "../../../../../../src/recipes/standard/metrics/sample.js";
import {
  MOUNTAIN_DRAMA_COHORT_IDENTITY,
  MOUNTAIN_DRAMA_ELEVATION_TARGET,
} from "../../../../../../src/recipes/standard/metrics/targets/relief.js";
import {
  captureEarthlikeScenario,
  measureEarthlikeSample,
} from "../../fixtures/standard-product.js";

describe("Standard relief elevation evidence", () => {
  it("summarizes every final Morphology land elevation from the closed capture", () => {
    const capture = captureEarthlikeScenario();
    const sample = measureEarthlikeSample();
    const landElevations: number[] = [];
    for (let index = 0; index < capture.model.landMask.length; index += 1) {
      if (capture.model.landMask[index] === 1) landElevations.push(capture.model.elevation[index]!);
    }

    const measured = sample.metrics.relief.finalLandElevation;
    expect(measured.count).toBe(landElevations.length);
    expect(measured.minimum).toBe(Math.min(...landElevations));
    expect(measured.maximum).toBe(Math.max(...landElevations));
    expect(measured.mean).toBeCloseTo(
      landElevations.reduce((sum, value) => sum + value, 0) / landElevations.length,
      10
    );
  }, 30_000);

  it("requires the matched peak-elevation relationship and fails when a sample is missing", () => {
    const cohort = matchedMountainDramaFixture(measureEarthlikeSample());
    const [passing] = evaluateMetricTargets(cohort, [MOUNTAIN_DRAMA_ELEVATION_TARGET]);
    expect(passing?.status).toBe("pass");
    expect(passing?.expectations.every(({ comparator }) => comparator.kind === "equal")).toBe(true);

    const [, second, ...rest] = cohort;
    if (!second) throw new Error("Matched mountain-drama fixture requires multiple samples.");
    const missing: StandardMapMetricCohort = [second, ...rest];
    const [failed] = evaluateMetricTargets(missing, [MOUNTAIN_DRAMA_ELEVATION_TARGET]);
    expect(failed?.status).toBe("fail");
    expect(failed?.expectations.map(({ status }) => status)).toEqual(["fail"]);
  }, 30_000);
});

function matchedMountainDramaFixture(
  base: StandardMapProductSample
): StandardMapMetricCohort {
  const configurationIds = [
    MOUNTAIN_DRAMA_COHORT_IDENTITY.referenceConfigurationId,
    ...MOUNTAIN_DRAMA_COHORT_IDENTITY.mountainConfigurationIds,
  ];
  const samples = configurationIds.flatMap((configurationId, configurationIndex) =>
    MOUNTAIN_DRAMA_COHORT_IDENTITY.seeds.map((seed) => {
      const referenceMaximum = 100 + (seed % 10);
      return withLandElevation(
        base,
        configurationId,
        seed,
        referenceMaximum + configurationIndex
      );
    })
  );
  const [first, ...rest] = samples;
  if (!first) throw new Error("Matched mountain-drama fixture requires samples.");
  return [first, ...rest];
}

function withLandElevation(
  base: StandardMapProductSample,
  configurationId: string,
  seed: number,
  maximum: number
): StandardMapProductSample {
  return {
    ...base,
    provenance: {
      ...base.provenance,
      configurationId,
      mapSeed: seed,
      gameSeed: seed,
    },
    metrics: {
      ...base.metrics,
      relief: {
        ...base.metrics.relief,
        finalLandElevation: {
          count: 3,
          minimum: 0,
          maximum,
          mean: base.metrics.relief.finalLandElevation.mean,
        },
      },
    },
  };
}
