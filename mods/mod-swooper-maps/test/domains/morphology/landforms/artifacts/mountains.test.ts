import { describe, expect, it } from "bun:test";

import { artifacts as morphologyLandformsArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
import { TEST_MAP_SIZE } from "../../../../setup.js";

const TEST_CARDINALITY = TEST_MAP_SIZE.dimensions.width * TEST_MAP_SIZE.dimensions.height;

describe("landforms mountains artifact", () => {
  it("refuses nonbinary mountain-region membership", () => {
    const payload = {
      mountainMask: new Uint8Array(TEST_CARDINALITY),
      mountainRegionMask: new Uint8Array(TEST_CARDINALITY),
      mountainRegionIdByTile: new Int32Array(TEST_CARDINALITY).fill(-1),
      hillMask: new Uint8Array(TEST_CARDINALITY),
      foothillMask: new Uint8Array(TEST_CARDINALITY),
      roughLandMask: new Uint8Array(TEST_CARDINALITY),
      orogenyPotential: new Uint8Array(TEST_CARDINALITY),
      fracturePotential: new Uint8Array(TEST_CARDINALITY),
      roughnessPotential: new Uint8Array(TEST_CARDINALITY),
    };
    payload.mountainRegionMask[0] = 2;

    expect(
      morphologyLandformsArtifacts.mountains
        .validate(payload, { dimensions: TEST_MAP_SIZE.dimensions })
        .some((issue) => issue.message.includes("mountainRegionMask"))
    ).toBe(true);
  });
});
