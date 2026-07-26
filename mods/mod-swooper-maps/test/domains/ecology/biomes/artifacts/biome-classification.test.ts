import { describe, expect, it } from "bun:test";

import { artifacts as biomeArtifacts } from "@mapgen/domain/ecology/modules/biomes/artifacts/index.js";
import { TEST_MAP_SIZE } from "../../../../setup.js";

function biomePayload() {
  const cardinality = TEST_MAP_SIZE.dimensions.width * TEST_MAP_SIZE.dimensions.height;
  return {
    ...TEST_MAP_SIZE.dimensions,
    biomeIndex: new Uint8Array(cardinality),
    vegetationDensity: new Float32Array(cardinality),
    treeLine01: new Float32Array(cardinality),
  };
}

describe("ecology-biomes biome-classification artifact", () => {
  it("refuses unknown biome indices and non-finite classifier fields", () => {
    const payload = biomePayload();
    payload.biomeIndex[0] = 8;
    payload.treeLine01[0] = Number.NaN;

    const messages = biomeArtifacts.biomeClassification
      .validate(payload, { dimensions: TEST_MAP_SIZE.dimensions })
      .map((issue) => issue.message);
    expect(messages.some((message) => message.includes("closed biome vocabulary"))).toBe(true);
    expect(messages.some((message) => message.includes("treeLine01"))).toBe(true);
  });

  it("admits the explicit unclassified-biome sentinel", () => {
    const value = biomePayload();
    value.biomeIndex[0] = 255;

    expect(
      biomeArtifacts.biomeClassification.validate(value, {
        dimensions: TEST_MAP_SIZE.dimensions,
      })
    ).toEqual([]);
  });
});
