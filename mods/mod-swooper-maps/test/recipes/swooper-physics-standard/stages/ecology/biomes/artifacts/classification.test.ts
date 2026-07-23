import { describe, expect, it } from "bun:test";

import { artifactModules as ecologyArtifactModules } from "@mapgen/domain/ecology";

const SYNTHETIC_DIMENSIONS = { width: 1, height: 1 } as const;
const SYNTHETIC_CARDINALITY = SYNTHETIC_DIMENSIONS.width * SYNTHETIC_DIMENSIONS.height;

function biomePayload() {
  return {
    ...SYNTHETIC_DIMENSIONS,
    biomeIndex: new Uint8Array(SYNTHETIC_CARDINALITY),
    vegetationDensity: new Float32Array(SYNTHETIC_CARDINALITY),
    treeLine01: new Float32Array(SYNTHETIC_CARDINALITY),
  };
}

describe("ecology-biomes biome-classification artifact", () => {
  it("refuses unknown biome indices and non-finite classifier fields", () => {
    const payload = biomePayload();
    payload.biomeIndex[0] = 8;
    payload.treeLine01[0] = Number.NaN;

    const messages = ecologyArtifactModules.biomeClassification
      .validate(payload, { dimensions: SYNTHETIC_DIMENSIONS })
      .map((issue) => issue.message);
    expect(messages.some((message) => message.includes("closed biome vocabulary"))).toBe(true);
    expect(messages.some((message) => message.includes("treeLine01"))).toBe(true);
  });

  it("admits the explicit unclassified-biome sentinel", () => {
    const value = biomePayload();
    value.biomeIndex[0] = 255;

    expect(
      ecologyArtifactModules.biomeClassification.validate(value, {
        dimensions: SYNTHETIC_DIMENSIONS,
      })
    ).toEqual([]);
  });
});
