import { describe, expect, it } from "bun:test";
import { measureStandardMapCapture } from "../../../../../../src/recipes/standard/metrics/sample.js";
import { captureFreshEarthlikeScenario } from "../../fixtures/standard-product.js";

describe("Standard product metric integrity", () => {
  it("repeats one named Civ7 preset as an identical completed metric sample", () => {
    const first = measureStandardMapCapture(captureFreshEarthlikeScenario());
    const second = measureStandardMapCapture(captureFreshEarthlikeScenario());

    expect(second).toEqual(first);
  }, 30_000);
});
