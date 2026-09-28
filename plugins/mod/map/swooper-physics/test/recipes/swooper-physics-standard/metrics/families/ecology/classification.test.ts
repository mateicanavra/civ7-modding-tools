import { describe, expect, it } from "bun:test";
import { evaluateMetricTargets } from "@swooper/mapgen-metrics";
import { measureStandardEcology } from "../../../../../../src/recipes/standard/metrics/families/ecology.js";
import { measureStandardMapCapture } from "../../../../../../src/recipes/standard/metrics/sample.js";
import { STANDARD_INTEGRITY_TARGET } from "../../../../../../src/recipes/standard/metrics/targets/integrity.js";
import { captureEarthlikeScenario } from "../../fixtures/standard-product.js";

describe("Standard ecology metrics", () => {
  it("excludes certified lake footprints from terrestrial populations without changing legacy measurement", () => {
    const capture = captureEarthlikeScenario();
    expect(capture.model.physicalHydrology.model).toBe("certified-sill-spill");
    const originalLandCount = capture.model.landMask.reduce((count, land) => count + land, 0);
    const wetLandCount = capture.model.plannedLakeMask.reduce(
      (count, wet, index) => count + Number(wet === 1 && capture.model.landMask[index] === 1), 0
    );
    expect(wetLandCount).toBeGreaterThan(0);
    const elevatedAcceptedLake = capture.model.landMask.findIndex((land, index) =>
      land === 1 && capture.model.plannedLakeMask[index] === 1 &&
      capture.observation.isLake[index] === 1 && capture.model.elevation[index]! > capture.model.seaLevel
    );
    expect(elevatedAcceptedLake).toBeGreaterThanOrEqual(0);
    expect(capture.model.biomeIndex[elevatedAcceptedLake]).toBe(255);

    const certified = measureStandardEcology(capture);
    expect(certified.unclassifiedModeledLand).toEqual({ count: 0, population: originalLandCount - wetLandCount });
    for (const metric of [certified.coldBiomeTiles, certified.wetlandTiles, certified.vegetationTiles]) {
      expect(metric.population).toBe(originalLandCount - wetLandCount);
    }
    const legacy = measureStandardEcology({
      ...capture,
      model: {
        ...capture.model,
        physicalHydrology: {
          model: "legacy-sink-budget",
          routingElevation: Float32Array.from(capture.model.elevation),
          outletMask: new Uint8Array(capture.model.landMask.length),
        },
      },
    });
    expect(legacy.unclassifiedModeledLand).toEqual({ count: wetLandCount, population: originalLandCount });
    for (const metric of [legacy.coldBiomeTiles, legacy.wetlandTiles, legacy.vegetationTiles]) {
      expect(metric.population).toBe(originalLandCount);
    }
  }, 30_000);

  it("measures unclassified modeled land and lets integrity reject the observation", () => {
    const capture = captureEarthlikeScenario();
    const modeledLandIndex = capture.model.landMask.findIndex(
      (value, index) => value === 1 && capture.model.plannedLakeMask[index] === 0
    );
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
      observation: { ...capture.observation, isWater: new Uint8Array(capture.model.landMask.length).fill(1) },
    }).unclassifiedModeledLand.count).toBe(1);
    const [integrity] = evaluateMetricTargets(sample, [STANDARD_INTEGRITY_TARGET]);
    expect(
      integrity?.expectations.find(({ id }) => id === "modeled-land-biome-classification")
    ).toMatchObject({ status: "fail", observed: 1 });
  }, 30_000);
});
