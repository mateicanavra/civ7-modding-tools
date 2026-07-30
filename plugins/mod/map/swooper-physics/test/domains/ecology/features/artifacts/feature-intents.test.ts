import { describe, expect, it } from "bun:test";

import { artifacts as featureArtifacts } from "../../../../../src/domain/ecology/modules/features/artifacts/index.js";
import { TEST_MAP_SIZE } from "../../../../setup.js";

const FEATURE_INTENT_ARTIFACTS = [
  ["vegetation", featureArtifacts.vegetationIntents, "forest", "marsh"],
  ["wetlands", featureArtifacts.wetlandIntents, "marsh", "forest"],
  ["floodplains", featureArtifacts.floodplainIntents, "grassland-floodplain-minor", "reef"],
  ["reefs", featureArtifacts.reefIntents, "reef", "ice"],
  ["ice", featureArtifacts.iceIntents, "ice", "forest"],
] as const;

describe("Ecology feature-intent artifacts", () => {
  it("admits only feature keys owned by each intent family", () => {
    for (const [family, artifact, feature, wrongFamilyFeature] of FEATURE_INTENT_ARTIFACTS) {
      expect(
        artifact.validate([{ x: 0, y: 0, feature }], {
          dimensions: TEST_MAP_SIZE.dimensions,
        }),
        `${family} should admit its own feature key`
      ).toEqual([]);
      expect(
        artifact.validate([{ x: 0, y: 0, feature: wrongFamilyFeature }], {
          dimensions: TEST_MAP_SIZE.dimensions,
        }),
        `${family} should refuse a feature owned by another family`
      ).not.toEqual([]);
    }
  });
});
