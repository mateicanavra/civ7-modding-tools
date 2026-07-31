import { describe, expect, it } from "bun:test";
import { metricShare } from "@swooper/mapgen-metrics";

import {
  measureStandardWindStructure,
  type StandardWindStructureInput,
} from "../../../../../../src/recipes/standard/metrics/families/hydrology/wind-structure.js";
import { measureStandardMapCapture } from "../../../../../../src/recipes/standard/metrics/sample.js";
import { captureEarthlikeScenario } from "../../fixtures/standard-product.js";

/**
 * A small synthetic grid is intentional here: controlled row means and deviations let the
 * measurement math carry exact assertions that an evolving shipped product cannot provide.
 */
function controlledWindInput(): StandardWindStructureInput {
  const width = 4;
  const height = 8;
  const rowMeanU = [-10, 10, 10, -10, -10, 10, 10, -10] as const;
  const rowMeanV = [4, 4, 4, 4, -4, -4, -4, -4] as const;
  const zonalDeviation = [-3, -1, 1, 3] as const;
  const windU = new Int8Array(width * height);
  const windV = new Int8Array(width * height);

  for (let row = 0; row < height; row += 1) {
    for (let column = 0; column < width; column += 1) {
      const index = row * width + column;
      windU[index] = (rowMeanU[row] ?? 0) + (zonalDeviation[column] ?? 0);
      windV[index] = rowMeanV[row] ?? 0;
    }
  }

  return {
    provenance: {
      width,
      height,
      topLatitude: 70,
      bottomLatitude: -70,
    },
    model: { windU, windV },
  };
}

describe("Standard wind-structure measurements", () => {
  it("measures controlled bands, texture, tropical flow, and chirality exactly", () => {
    const wind = measureStandardWindStructure(controlledWindInput());

    expect({
      saturatedTiles: wind.saturatedTiles,
      deviationDominantTiles: wind.deviationDominantTiles,
      zonalBandSignRows: wind.zonalBandSignRows,
      rowMeanAbsU: wind.rowMeanAbsU,
      rowMeanAbsV: wind.rowMeanAbsV,
      withinRowRmsU: wind.withinRowRmsU,
      tropicalMeridional: wind.tropicalMeridional,
    }).toEqual({
      saturatedTiles: { count: 0, population: 32 },
      deviationDominantTiles: { count: 0, population: 32 },
      zonalBandSignRows: { count: 8, population: 8 },
      rowMeanAbsU: { count: 8, minimum: 10, maximum: 10, mean: 10 },
      rowMeanAbsV: { count: 8, minimum: 4, maximum: 4, mean: 4 },
      withinRowRmsU: {
        count: 8,
        minimum: Math.sqrt(5),
        maximum: Math.sqrt(5),
        mean: Math.sqrt(5),
      },
      tropicalMeridional: { northMeanV: 4, southMeanV: -4 },
    });
    expect(wind.hemisphericCurl.northMeanCurl).toBeCloseTo(
      -(wind.hemisphericCurl.southMeanCurl ?? 0),
      10
    );
  });

  it("counts vector-magnitude saturation rather than component extrema", () => {
    const input: StandardWindStructureInput = {
      provenance: {
        width: 2,
        height: 1,
        topLatitude: 0,
        bottomLatitude: 0,
      },
      model: {
        windU: Int8Array.from([90, 89]),
        windV: Int8Array.from([90, 89]),
      },
    };

    expect(measureStandardWindStructure(input).saturatedTiles).toEqual({
      count: 1,
      population: 2,
    });
  });

  it("keeps one shipped Earthlike directional-signal smoke check", () => {
    const capture = captureEarthlikeScenario();
    const wind = measureStandardMapCapture(capture).metrics.hydrology.windStructure;

    expect(metricShare(wind.zonalBandSignRows)).toBeGreaterThanOrEqual(0.9);
  }, 30_000);
});
