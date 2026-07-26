import { describe, expect, it } from "bun:test";

import { artifacts as featureArtifacts } from "@mapgen/domain/ecology/modules/features/artifacts/index.js";
import { TEST_MAP_SIZE } from "../../../../setup.js";

const FEATURE_INTENT_ARTIFACTS = [
  ["vegetation", featureArtifacts.vegetationIntents, "forest", "marsh"],
  ["wetlands", featureArtifacts.wetlandIntents, "marsh", "forest"],
  ["floodplains", featureArtifacts.floodplainIntents, "grassland-floodplain-minor", "reef"],
  ["reefs", featureArtifacts.reefIntents, "reef", "ice"],
  ["ice", featureArtifacts.iceIntents, "ice", "forest"],
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

  it("refuses feature keys owned by another intent family", () => {
    for (const [family, artifact, , wrongFamilyFeature] of FEATURE_INTENT_ARTIFACTS) {
      expect(
        artifact.validate([{ x: 0, y: 0, feature: wrongFamilyFeature }], {
          dimensions: TEST_MAP_SIZE.dimensions,
        }),
        `${family} should refuse a feature owned by another family`
      ).not.toEqual([]);
    }
  });

  it("refuses two intents from the same family that claim one tile", () => {
    for (const [family, artifact, feature] of FEATURE_INTENT_ARTIFACTS) {
      const issues = artifact.validate(
        [
          { x: 0, y: 0, feature, weight: 0.25 },
          { x: 0, y: 0, feature, weight: 0.75 },
        ],
        { dimensions: TEST_MAP_SIZE.dimensions }
      );

      expect(
        issues.some((issue) => issue.message.includes("duplicates the tile claim at 0,0")),
        `${family} should refuse duplicate tile claims`
      ).toBe(true);
    }
  });
});
