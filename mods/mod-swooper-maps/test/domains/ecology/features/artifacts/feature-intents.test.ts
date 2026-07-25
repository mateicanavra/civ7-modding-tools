import { describe, expect, it } from "bun:test";

import { artifacts as featureArtifacts } from "@mapgen/domain/ecology/modules/features/artifacts/index.js";
import { TEST_MAP_SIZE } from "../../../../setup.js";

const FEATURE_INTENT_ARTIFACTS = [
  ["vegetation", featureArtifacts.featureIntentsVegetation, "forest"],
  ["wetlands", featureArtifacts.featureIntentsWetlands, "marsh"],
  ["floodplains", featureArtifacts.featureIntentsFloodplains, "grassland-floodplain-minor"],
  ["reefs", featureArtifacts.featureIntentsReefs, "reef"],
  ["ice", featureArtifacts.featureIntentsIce, "ice"],
] as const;

describe("Ecology feature-intent artifacts", () => {
  it("admit map-bound placements and refuse coordinates beyond the admitted Civ7 map", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;

    for (const [family, artifact, feature] of FEATURE_INTENT_ARTIFACTS) {
      expect(
        artifact.validate([{ x: width - 1, y: height - 1, feature }], {
          dimensions: TEST_MAP_SIZE.dimensions,
        }),
        `${family} should admit the final map coordinate`
      ).toEqual([]);

      expect(
        artifact
          .validate([{ x: width, y: 0, feature }], {
            dimensions: TEST_MAP_SIZE.dimensions,
          })
          .some((issue) => issue.message.includes(`outside ${width}x${height}`)),
        `${family} should refuse a coordinate beyond the map`
      ).toBe(true);
    }
  });
});
