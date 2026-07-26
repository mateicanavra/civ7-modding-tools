import { describe, expect, it } from "bun:test";
import { artifacts as hydrographyArtifacts } from "@mapgen/domain/hydrology/modules/hydrography/artifacts/index.js";
import { TEST_MAP_SIZE } from "../../../../setup.js";

const dimensions = TEST_MAP_SIZE.dimensions;
const cellCount = dimensions.width * dimensions.height;

describe("lake plan artifact", () => {
  it("refuses a planned tile count that disagrees with the lake mask", () => {
    const lakeMask = new Uint8Array(cellCount);
    lakeMask[1] = 1;
    lakeMask[2] = 1;

    const messages = hydrographyArtifacts.lakePlan
      .validate(
        {
          width: dimensions.width,
          height: dimensions.height,
          lakeMask,
          plannedLakeTileCount: 1,
          sinkLakeCount: 1,
        },
        { dimensions }
      )
      .map((issue) => issue.message);

    expect(messages).toContain(
      "plannedLakeTileCount 1 does not match the 2 planned tiles in lakeMask."
    );
  });
});
