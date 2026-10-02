import { describe, expect, it } from "bun:test";
import { artifacts } from "../../../../../src/domain/hydrology/modules/climate/artifacts/index.js";

const dimensions = { width: 3, height: 2 };
const cellCount = dimensions.width * dimensions.height;

describe("Hydrology causal thermal vintages", () => {
  const vintages = [
    {
      artifact: artifacts.thermalField,
      fields: {},
    },
    {
      artifact: artifacts.climateIndices,
      fields: {
        effectiveMoisture: new Float32Array(cellCount),
        pet: new Float32Array(cellCount),
        aridityIndex: new Float32Array(cellCount),
        freezeIndex: new Float32Array(cellCount),
      },
    },
  ];
  for (const { artifact, fields } of vintages) {
    it(`requires finite map-grid Float32Array temperature within ${artifact.name}`, () => {
      expect(
        artifact.validate(
          { ...fields, surfaceTemperatureC: new Float32Array(cellCount).fill(-25) },
          { dimensions }
        )
      ).toEqual([]);
      expect(artifact.validate(fields, { dimensions })).not.toEqual([]);
      expect(artifact.validate(new Float32Array(cellCount), { dimensions })).not.toEqual([]);
      for (const value of [
        undefined,
        { surfaceTemperatureC: new Float32Array(cellCount) },
        new Uint8Array(cellCount),
        new Float32Array(cellCount - 1),
      ]) {
        expect(
          artifact.validate({ ...fields, surfaceTemperatureC: value }, { dimensions })
        ).not.toEqual([]);
      }
      for (const sample of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
        const value = new Float32Array(cellCount);
        value[cellCount - 1] = sample;
        expect(
          artifact.validate({ ...fields, surfaceTemperatureC: value }, { dimensions })
            .map((issue) => issue.message)
        ).toEqual([
          `Expected ${artifact.name}.surfaceTemperatureC[${cellCount - 1}] to be finite (received ${sample}).`,
        ]);
      }
    });
  }

  it("owns baseline thermal evidence and final indices without parallel temperature artifacts", () => {
    expect(artifacts.thermalField.id).toBe("artifact:hydrology._internal.thermalField");
    expect(artifacts.thermalField.id).not.toBe(artifacts.climateIndices.id);
    expect(
      artifacts.thermalField.validate(
        {
          surfaceTemperatureC: new Float32Array(cellCount),
          rainfall: new Uint8Array(cellCount),
        },
        { dimensions }
      )
    ).not.toEqual([]);
    expect(artifacts).not.toHaveProperty("baselineSurfaceTemperature");
    expect(artifacts).not.toHaveProperty("surfaceTemperature");
  });
});
