import { describe, expect, it } from "bun:test";
import { artifacts as climateArtifacts } from "../../../../../src/domain/hydrology/modules/climate/artifacts/index.js";
import { PotentialDemandParametersSchema } from "../../../../../src/domain/hydrology/modules/climate/model/atoms/potential-demand.schema.js";
import { Value } from "typebox/value";
import { TEST_MAP_SIZE } from "../../../../setup.js";

const dimensions = TEST_MAP_SIZE.dimensions;
const cellCount = dimensions.width * dimensions.height;

function forcing() {
  return {
    precipitation: new Float32Array(cellCount).fill(4.25),
    surfaceWetness: new Float32Array(cellCount).fill(0.02),
    rainfallCodec: new Uint8Array(cellCount).fill(4),
  };
}

function baseline() {
  return {
    ...forcing(),
    potentialDemand: new Float32Array(cellCount),
    demandParameters: Value.Create(PotentialDemandParametersSchema),
  };
}

describe("Hydrology climate-field artifacts", () => {
  it("admits fractional and high model P without confusing the codec with physical supply", () => {
    const value = baseline();
    value.precipitation[0] = 300.25;
    value.rainfallCodec[0] = 200;
    // Annual wetness averages clamped members independently; it need not equal clamp(mean P/200).
    value.surfaceWetness[0] = 0.75;
    expect(climateArtifacts.baselineClimateField.validate(value, { dimensions })).toEqual([]);
    expect(climateArtifacts.climateField.validate({
      precipitation: value.precipitation,
      surfaceWetness: value.surfaceWetness,
      rainfallCodec: value.rainfallCodec,
    }, { dimensions })).toEqual([]);
  });

  it("rejects negative or non-finite baseline demand before downstream consumption", () => {
    for (const sample of [-1, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      const value = baseline();
      value.potentialDemand[cellCount - 1] = sample;
      const issues = climateArtifacts.baselineClimateField.validate(value, { dimensions });
      expect(issues.map((issue) => issue.message)).toContain(
        `Expected climate.potentialDemand[${cellCount - 1}] to be finite and nonnegative (received ${sample}).`
      );
    }
  });

  it("rejects invalid physical fields, incoherent codec values, cardinality and retired names", () => {
    for (const artifact of [climateArtifacts.baselineClimateField, climateArtifacts.climateField]) {
      const value = artifact === climateArtifacts.baselineClimateField ? baseline() : forcing();
      for (const sample of [-1, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
        const precipitation = value.precipitation.slice();
        precipitation[cellCount - 1] = sample;
        expect(artifact.validate({ ...value, precipitation }, { dimensions })).not.toEqual([]);
      }
      for (const sample of [-0.01, 1.01, Number.NaN, Number.POSITIVE_INFINITY]) {
        const surfaceWetness = value.surfaceWetness.slice();
        surfaceWetness[cellCount - 1] = sample;
        expect(artifact.validate({ ...value, surfaceWetness }, { dimensions })).not.toEqual([]);
      }
      const rainfallCodec = value.rainfallCodec.slice();
      rainfallCodec[cellCount - 1] = 201;
      expect(artifact.validate({ ...value, rainfallCodec }, { dimensions })).not.toEqual([]);
      rainfallCodec[cellCount - 1] = 5;
      expect(artifact.validate({ ...value, rainfallCodec }, { dimensions })).not.toEqual([]);
      expect(artifact.validate({ ...value, precipitation: new Float32Array(cellCount - 1) }, { dimensions })).not.toEqual([]);
      expect(artifact.validate({ ...value, surfaceWetness: new Float32Array(cellCount + 1) }, { dimensions })).not.toEqual([]);
      expect(artifact.validate({ ...value, rainfall: new Uint8Array(cellCount) }, { dimensions })).not.toEqual([]);
      expect(artifact.validate({ ...value, humidity: new Uint8Array(cellCount) }, { dimensions })).not.toEqual([]);
    }
  });

  it("keeps baseline thermal evidence separate while final indices retain their temperature", () => {
    const value = baseline();
    expect(climateArtifacts.baselineClimateField.validate(value, { dimensions })).toEqual([]);
    expect(climateArtifacts.baselineClimateField.validate({
      ...value, surfaceTemperatureC: new Float32Array(cellCount),
    }, { dimensions })).not.toEqual([]);
    const indices = {
      surfaceTemperatureC: new Float32Array(cellCount),
      effectiveMoisture: new Float32Array(cellCount),
      pet: new Float32Array(cellCount),
      aridityIndex: new Float32Array(cellCount),
      freezeIndex: new Float32Array(cellCount),
    };
    expect(climateArtifacts.climateIndices.validate(indices, { dimensions })).toEqual([]);
    expect(climateArtifacts.climateIndices.validate({
      ...indices, surfaceTemperatureC: undefined,
    }, { dimensions })).not.toEqual([]);
    expect(climateArtifacts.climateField.validate({
      ...forcing(), surfaceTemperatureC: new Float32Array(cellCount),
    }, { dimensions })).not.toEqual([]);
  });
});
