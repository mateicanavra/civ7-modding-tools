import { describe, expect, it } from "bun:test";
import { artifacts as climateArtifacts } from "@mapgen/domain/hydrology/modules/climate/artifacts/index.js";
import { TEST_MAP_SIZE } from "../../../../setup.js";

const dimensions = TEST_MAP_SIZE.dimensions;
const cellCount = dimensions.width * dimensions.height;

describe("Hydrology climate-field artifacts", () => {
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
