import { describe, expect, it } from "bun:test";

import { artifacts as foundationArtifacts } from "@mapgen/domain/foundation";
import { TEST_MAP_SIZE } from "../../../../../../map-size.js";

const TEST_CARDINALITY = TEST_MAP_SIZE.dimensions.width * TEST_MAP_SIZE.dimensions.height;

describe("standard recipe artifact contracts", () => {
  it("validates volcanism as part of the projected foundation plates payload", () => {
    const payload = {
      id: new Int16Array(TEST_CARDINALITY),
      boundaryCloseness: new Uint8Array(TEST_CARDINALITY),
      boundaryType: new Uint8Array(TEST_CARDINALITY),
      tectonicStress: new Uint8Array(TEST_CARDINALITY),
      upliftPotential: new Uint8Array(TEST_CARDINALITY),
      riftPotential: new Uint8Array(TEST_CARDINALITY),
      shieldStability: new Uint8Array(TEST_CARDINALITY),
      volcanism: new Uint8Array(TEST_CARDINALITY),
      movementU: new Int8Array(TEST_CARDINALITY),
      movementV: new Int8Array(TEST_CARDINALITY),
      rotation: new Int8Array(TEST_CARDINALITY),
    };

    const validationContext = { dimensions: TEST_MAP_SIZE.dimensions };

    expect(foundationArtifacts.plates.validate(payload, validationContext)).toEqual([]);

    const { volcanism: _volcanism, ...withoutVolcanism } = payload;
    expect(
      foundationArtifacts.plates
        .validate(withoutVolcanism, validationContext)
        .some((issue) => issue.message.includes("volcanism"))
    ).toBe(true);
  });
});
