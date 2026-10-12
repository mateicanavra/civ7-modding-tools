import { describe, expect, it } from "bun:test";
import { artifacts as climateArtifacts } from "../../../../../src/domain/hydrology/modules/climate/artifacts/index.js";
import { PotentialDemandParametersSchema } from "../../../../../src/domain/hydrology/modules/climate/model/atoms/potential-demand.schema.js";
import { Value } from "typebox/value";
import { TEST_MAP_SIZE } from "../../../../setup.js";

const dimensions = TEST_MAP_SIZE.dimensions;
const cellCount = dimensions.width * dimensions.height;

describe("Hydrology climate-field artifacts", () => {
  it("rejects negative or non-finite baseline demand before downstream consumption", () => {
    for (const sample of [-1, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      const potentialDemand = new Float32Array(cellCount);
      potentialDemand[cellCount - 1] = sample;
      const issues = climateArtifacts.baselineClimateField.validate(
        {
          precipitation: new Float32Array(cellCount),
          surfaceWetness: new Float32Array(cellCount),
          rainfallCodec: new Uint8Array(cellCount),
          potentialDemand,
          demandParameters: Value.Create(PotentialDemandParametersSchema),
        },
        { dimensions }
      );
      expect(issues.map((issue) => issue.message)).toContain(
        `Expected climate.potentialDemand[${cellCount - 1}] to be finite and nonnegative (received ${sample}).`
      );
    }
  });

  it("rejects the native codec outside its range without limiting float P", () => {
    const rainfallCodec = new Uint8Array(cellCount);
    rainfallCodec[cellCount - 1] = 201;

    for (const artifact of [climateArtifacts.baselineClimateField, climateArtifacts.climateField]) {
      expect(
        artifact
          .validate(
            {
              precipitation: new Float32Array(cellCount).fill(450.25),
              surfaceWetness: new Float32Array(cellCount),
              rainfallCodec,
              ...(artifact === climateArtifacts.baselineClimateField
                ? {
                    potentialDemand: new Float32Array(cellCount),
                    demandParameters: Value.Create(PotentialDemandParametersSchema),
                  }
                : {}),
            },
            { dimensions }
          )
          .map((issue) => issue.message)
      ).toEqual(
        expect.arrayContaining([
          `Expected climate.rainfallCodec[${cellCount - 1}] to be within 0..200 (received 201).`,
        ])
      );
    }
  });

  it("admits unclipped float precipitation and refuses invalid physical P/W or retired byte inputs", () => {
    const forcing = {
      precipitation: new Float32Array(cellCount).fill(450.25),
      surfaceWetness: new Float32Array(cellCount).fill(0.5),
      rainfallCodec: new Uint8Array(cellCount).fill(200),
    };
    for (const artifact of [climateArtifacts.baselineClimateField, climateArtifacts.climateField]) {
      const value = {
        ...forcing,
        ...(artifact === climateArtifacts.baselineClimateField ? {
          potentialDemand: new Float32Array(cellCount),
          demandParameters: Value.Create(PotentialDemandParametersSchema),
        } : {}),
      };
      expect(artifact.validate(value, { dimensions })).toEqual([]);
      for (const sample of [-1, NaN, Infinity]) {
        const precipitation = new Float32Array(value.precipitation);
        precipitation[0] = sample;
        expect(artifact.validate({ ...value, precipitation }, { dimensions })).not.toEqual([]);
      }
      for (const sample of [-0.1, 1.1, NaN, Infinity]) {
        const surfaceWetness = new Float32Array(value.surfaceWetness);
        surfaceWetness[0] = sample;
        expect(artifact.validate({ ...value, surfaceWetness }, { dimensions })).not.toEqual([]);
      }
      expect(artifact.validate({ ...value, precipitation: new Uint8Array(cellCount) }, { dimensions })).not.toEqual([]);
      expect(artifact.validate({ ...value, rainfall: new Uint8Array(cellCount) }, { dimensions })).not.toEqual([]);
    }
  });

  it("keeps baseline thermal evidence separate while final indices retain their temperature", () => {
    const baseline = {
      precipitation: new Float32Array(cellCount),
      surfaceWetness: new Float32Array(cellCount),
      rainfallCodec: new Uint8Array(cellCount),
      potentialDemand: new Float32Array(cellCount),
      demandParameters: Value.Create(PotentialDemandParametersSchema),
    };
    expect(climateArtifacts.baselineClimateField.validate(baseline, { dimensions })).toEqual([]);
    expect(
      climateArtifacts.baselineClimateField.validate(
        {
          ...baseline,
          surfaceTemperatureC: new Float32Array(cellCount),
        },
        { dimensions }
      )
    ).not.toEqual([]);
    const indices = {
      surfaceTemperatureC: new Float32Array(cellCount),
      coldestMonthMeanSurfaceTemperatureC: new Float32Array(cellCount),
      effectiveMoisture: new Float32Array(cellCount),
      localSurfaceWaterOpportunity: new Float32Array(cellCount),
      plantEffectiveMoisture: new Float32Array(cellCount),
      pet: new Float32Array(cellCount),
      aridityIndex: new Float32Array(cellCount),
      plantWaterStress: new Float32Array(cellCount),
      freezeIndex: new Float32Array(cellCount),
    };
    expect(climateArtifacts.climateIndices.validate(indices, { dimensions })).toEqual([]);
    for (const localSurfaceWaterOpportunity of [
      undefined,
      new Uint8Array(cellCount),
      new Float32Array(cellCount - 1),
    ]) {
      expect(
        climateArtifacts.climateIndices.validate(
          { ...indices, localSurfaceWaterOpportunity },
          { dimensions }
        )
      ).not.toEqual([]);
    }
    for (const field of ["surfaceTemperatureC", "coldestMonthMeanSurfaceTemperatureC"] as const) {
      expect(
        climateArtifacts.climateIndices.validate(
          { ...indices, [field]: undefined },
          { dimensions }
        )
      ).not.toEqual([]);
      expect(
        climateArtifacts.baselineClimateField.validate(
          { ...baseline, [field]: new Float32Array(cellCount) },
          { dimensions }
        )
      ).not.toEqual([]);
      expect(
        climateArtifacts.climateField.validate(
          {
            precipitation: baseline.precipitation,
            surfaceWetness: baseline.surfaceWetness,
            rainfallCodec: baseline.rainfallCodec,
            [field]: new Float32Array(cellCount),
          },
          { dimensions }
        )
      ).not.toEqual([]);
    }
    expect(
      climateArtifacts.climateField.validate(
        {
          precipitation: baseline.precipitation,
          surfaceWetness: baseline.surfaceWetness,
          rainfallCodec: baseline.rainfallCodec,
          surfaceTemperatureC: new Float32Array(cellCount),
        },
        { dimensions }
      )
    ).not.toEqual([]);
  });
});
