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
          rainfall: new Uint8Array(cellCount),
          humidity: new Uint8Array(cellCount),
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

  it("rejects rainfall outside the admitted climate range", () => {
    const rainfall = new Uint8Array(cellCount);
    rainfall[cellCount - 1] = 201;

    for (const artifact of [climateArtifacts.baselineClimateField, climateArtifacts.climateField]) {
      expect(
        artifact
          .validate(
            {
              rainfall,
              humidity: new Uint8Array(cellCount),
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
          `Expected climate.rainfall[${cellCount - 1}] to be within 0..200 (received 201).`,
        ])
      );
    }
  });
});
