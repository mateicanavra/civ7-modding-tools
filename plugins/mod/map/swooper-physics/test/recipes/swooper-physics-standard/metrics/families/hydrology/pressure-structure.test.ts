import { describe, expect, it } from "bun:test";

import {
  measureStandardPressureStructure,
  type StandardPressureStructureInput,
} from "../../../../../../src/recipes/standard/metrics/families/hydrology/pressure-structure.js";

/**
 * This symmetric synthetic field makes every pressure measurement analytically exact: a triangular
 * latitude scaffold supplies the belts, and a fixed +/-2 hPa column departure supplies anomalies.
 */
function controlledPressureInput(): StandardPressureStructureInput {
  const width = 2;
  const height = 26;
  const topLatitude = 62.5;
  const bottomLatitude = -62.5;
  const pressure = new Float32Array(width * height);
  const windU = new Int8Array(width * height).fill(10);

  for (let row = 0; row < height; row += 1) {
    const latitude = topLatitude + ((bottomLatitude - topLatitude) / (height - 1)) * row;
    const latitudeAbs = Math.abs(latitude);
    const rowMean = latitudeAbs <= 30 ? latitudeAbs - 30 : 30 - latitudeAbs;
    pressure[row * width] = rowMean - 2;
    pressure[row * width + 1] = rowMean + 2;
  }

  return {
    provenance: { width, height, topLatitude, bottomLatitude },
    model: { pressure, windU },
  };
}

describe("Standard pressure-structure measurements", () => {
  it("measures controlled belts, mirror, shared-frame signs, and anomalies exactly", () => {
    expect(measureStandardPressureStructure(controlledPressureInput())).toEqual({
      bandMeans: {
        northItcz: -25,
        northRidge: -2.5,
        northSubpolar: -30,
        southItcz: -25,
        southRidge: -2.5,
        southSubpolar: -30,
      },
      mirrorAsymmetry: 0,
      scaffoldFrameSign: {
        north: { count: 5, population: 5 },
        south: { count: 5, population: 5 },
      },
      zonalAnomalyRmsHpa: 2,
    });
  });

  it("retains missing-band evidence instead of inventing a pressure profile", () => {
    const input: StandardPressureStructureInput = {
      provenance: {
        width: 2,
        height: 2,
        topLatitude: 5,
        bottomLatitude: -5,
      },
      model: {
        pressure: Float32Array.from([-1, 1, -1, 1]),
        windU: Int8Array.from([10, 10, 10, 10]),
      },
    };

    expect(measureStandardPressureStructure(input)).toEqual({
      bandMeans: {
        northItcz: 0,
        northRidge: null,
        northSubpolar: null,
        southItcz: 0,
        southRidge: null,
        southSubpolar: null,
      },
      mirrorAsymmetry: null,
      scaffoldFrameSign: {
        north: { count: 0, population: 0 },
        south: { count: 0, population: 0 },
      },
      zonalAnomalyRmsHpa: 1,
    });
  });
});
