import { describe, expect, it } from "bun:test";
import { artifacts } from "../../../../../src/domain/hydrology/modules/climate/artifacts/index.js";

const dimensions = { width: 3, height: 2 };
const cellCount = dimensions.width * dimensions.height;

describe("Hydrology singular thermal artifacts", () => {
  for (const artifact of [artifacts.baselineSurfaceTemperature, artifacts.surfaceTemperature]) {
    it(`admits only a finite map-grid Float32Array for ${artifact.name}`, () => {
      expect(artifact.validate(new Float32Array(cellCount).fill(-25), { dimensions })).toEqual([]);
      for (const value of [
        undefined,
        { surfaceTemperatureC: new Float32Array(cellCount) },
        new Uint8Array(cellCount),
        new Float32Array(cellCount - 1),
      ]) {
        expect(artifact.validate(value, { dimensions })).not.toEqual([]);
      }
      for (const sample of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
        const value = new Float32Array(cellCount);
        value[cellCount - 1] = sample;
        expect(artifact.validate(value, { dimensions }).map((issue) => issue.message)).toEqual([
          `Expected ${artifact.name}[${cellCount - 1}] to be finite (received ${sample}).`,
        ]);
      }
    });
  }

  it("owns distinct baseline and refined thermal vintages", () => {
    expect(artifacts.baselineSurfaceTemperature.id).not.toBe(artifacts.surfaceTemperature.id);
    expect(artifacts.baselineSurfaceTemperature.name).not.toBe(artifacts.surfaceTemperature.name);
  });
});
