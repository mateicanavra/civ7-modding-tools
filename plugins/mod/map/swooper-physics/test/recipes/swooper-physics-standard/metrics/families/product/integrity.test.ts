import { describe, expect, it } from "bun:test";
import { measureStandardMapCapture } from "../../../../../../src/recipes/standard/metrics/sample.js";
import { captureFreshEarthlikeScenario } from "../../fixtures/standard-product.js";

describe("Standard product metric integrity", () => {
  it("repeats one named Civ7 preset as an identical completed metric sample", () => {
    const capture = captureFreshEarthlikeScenario();
    expect(capture.model.baselineRainfall).toBeInstanceOf(Float32Array);
    expect(capture.model.baselineRainfall.some((value) => value > 0 && !Number.isInteger(value))).toBe(true);
    expect(capture.model.refinedRainfall).toEqual(capture.model.baselineRainfall);
    expect(capture.model.refinedSurfaceWetness).toEqual(capture.model.baselineSurfaceWetness);
    expect(capture.model.baselineRainfallCodec).toEqual(
      Uint8Array.from(capture.model.baselineRainfall, (value) => Math.round(Math.min(200, value)))
    );
    const first = measureStandardMapCapture(capture);
    const second = measureStandardMapCapture(captureFreshEarthlikeScenario());

    expect(second).toEqual(first);
  }, 30_000);
});
