import { describe, expect, it } from "bun:test";
import { evaluateMetricTargets } from "@swooper/mapgen-metrics";
import { measureStandardEcology } from "../../../../../../src/recipes/standard/metrics/families/ecology.js";
import { measureStandardMapCapture } from "../../../../../../src/recipes/standard/metrics/sample.js";
import { STANDARD_INTEGRITY_TARGET } from "../../../../../../src/recipes/standard/metrics/targets/integrity.js";
import { captureEarthlikeScenario } from "../../fixtures/standard-product.js";

describe("Standard ecology metrics", () => {
  it("excludes complete physical lake footprints from terrestrial populations", () => {
    const capture = captureEarthlikeScenario();
    expect(capture.model.physicalHydrology.model).toBe("certified-sill-spill");
    const exposedLandCount = capture.model.exposedLandMask.reduce((count, land) => count + land, 0);
    const wetLandCount = capture.model.plannedLakeMask.reduce(
      (count, wet, index) => count + Number(wet === 1 && capture.model.externalWaterMask[index] === 0), 0
    );
    expect(wetLandCount).toBeGreaterThan(0);
    const elevatedAcceptedLake = capture.model.externalWaterMask.findIndex((external, index) =>
      external === 0 && capture.model.plannedLakeMask[index] === 1 &&
      capture.observation.isLake[index] === 1 && capture.model.elevation[index]! > capture.model.seaLevel
    );
    expect(elevatedAcceptedLake).toBeGreaterThanOrEqual(0);
    expect(capture.model.biomeIndex[elevatedAcceptedLake]).toBe(255);

    const certified = measureStandardEcology(capture);
    expect(certified.unclassifiedModeledLand).toEqual({ count: 0, population: exposedLandCount });
    for (const metric of [certified.coldBiomeTiles, certified.wetlandTiles, certified.vegetationTiles]) {
      expect(metric.population).toBe(exposedLandCount);
    }
  }, 30_000);

  it("measures unclassified modeled land and lets integrity reject the observation", () => {
    const capture = captureEarthlikeScenario();
    const modeledLandIndex = capture.model.exposedLandMask.findIndex((value) => value === 1);
    if (modeledLandIndex < 0) throw new Error("Metric fixture has no modeled land.");
    const biomeIndex = capture.model.biomeIndex.slice();
    biomeIndex[modeledLandIndex] = 255;
    const sample = measureStandardMapCapture({
      ...capture,
      model: { ...capture.model, biomeIndex },
    });

    expect(sample.metrics.ecology.unclassifiedModeledLand.count).toBe(1);
    expect(measureStandardEcology({
      ...capture,
      model: { ...capture.model, biomeIndex },
      observation: { ...capture.observation, isWater: new Uint8Array(capture.model.exposedLandMask.length).fill(1) },
    }).unclassifiedModeledLand.count).toBe(1);
    const [integrity] = evaluateMetricTargets(sample, [STANDARD_INTEGRITY_TARGET]);
    expect(
      integrity?.expectations.find(({ id }) => id === "modeled-land-biome-classification")
    ).toMatchObject({ status: "fail", observed: 1 });
  }, 30_000);
});
