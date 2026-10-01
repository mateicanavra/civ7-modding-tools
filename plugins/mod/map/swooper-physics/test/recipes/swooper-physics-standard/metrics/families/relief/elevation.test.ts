import { describe, expect, it } from "bun:test";

import {
  captureEarthlikeScenario,
  measureEarthlikeSample,
} from "../../fixtures/standard-product.js";

describe("Standard relief elevation evidence", () => {
  it("captures exact authored elevation preservation without claiming native proof", () => {
    const capture = captureEarthlikeScenario();
    for (const evidence of [
      capture.projection.elevation.postWrite,
      capture.projection.elevation.final,
    ]) {
      expect(evidence.status).toBe("mock-only");
      if (evidence.status === "unavailable") throw new Error("Missing elevation evidence");
      expect(evidence.mismatchCount).toBe(0);
      expect(evidence.nonLakeMismatchCount).toBe(0);
      expect(evidence.maximumAbsoluteError).toBe(0);
      expect(evidence.plotCount).toBe(capture.provenance.width * capture.provenance.height);
    }
  }, 30_000);

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

});
