import { describe, expect, it } from "bun:test";

import { artifacts as placementWonderArtifacts } from "@mapgen/domain/placement/modules/wonders/artifacts/index.js";
import type { ArtifactValueOf } from "@swooper/mapgen-core/authoring";

import { TEST_MAP_SIZE } from "../../../../setup.js";

type NaturalWonderPlan = ArtifactValueOf<typeof placementWonderArtifacts.naturalWonderPlan>;

function naturalWonderPlan(): NaturalWonderPlan {
  const { width, height } = TEST_MAP_SIZE.dimensions;
  const plotIndex = Math.floor(height / 2) * width + Math.floor(width / 2);
  return {
    width,
    height,
    wondersCount: 1,
    targetCount: 1,
    plannedCount: 1,
    placements: [
      {
        plotIndex,
        featureType: 1,
        direction: -1,
        elevation: 120,
        priority: 1,
        fallbacks: [
          { plotIndex: plotIndex + 1, elevation: 121 },
          { plotIndex: plotIndex + 2, elevation: 122 },
        ],
      },
    ],
  };
}

describe("naturalWonderPlan artifact admission", () => {
  it("binds plan dimensions to the admitted execution", () => {
    const plan = naturalWonderPlan();
    const issues = placementWonderArtifacts.naturalWonderPlan.validate(plan, {
      dimensions: { width: plan.width + 1, height: plan.height },
    });

    expect(issues.map(({ message }) => message)).toContain(
      `naturalWonderPlan dimensions ${plan.width}x${plan.height} do not match execution dimensions ${plan.width + 1}x${plan.height}.`
    );
  });

  it("rejects out-of-bounds and repeated fallback anchors", () => {
    const plan = naturalWonderPlan();
    const primary = plan.placements[0]!.plotIndex;
    const invalid: NaturalWonderPlan = {
      ...plan,
      placements: [
        {
          ...plan.placements[0]!,
          fallbacks: [
            { plotIndex: primary, elevation: 120 },
            { plotIndex: primary + 1, elevation: 121 },
            { plotIndex: primary + 1, elevation: 121 },
            { plotIndex: plan.width * plan.height, elevation: 122 },
          ],
        },
      ],
    };
    const issues = placementWonderArtifacts.naturalWonderPlan.validate(invalid, {
      dimensions: TEST_MAP_SIZE.dimensions,
    });

    expect(issues.map(({ message }) => message)).toEqual(
      expect.arrayContaining([
        `naturalWonderPlan anchor ${primary} is repeated for primary ${primary}.`,
        `naturalWonderPlan anchor ${primary + 1} is repeated for primary ${primary}.`,
        `naturalWonderPlan fallback anchor ${plan.width * plan.height} for primary ${primary} is out of bounds.`,
      ])
    );
  });

  it("keeps the requested target within the admitted wonder catalog", () => {
    const plan = naturalWonderPlan();
    const invalid: NaturalWonderPlan = {
      ...plan,
      wondersCount: 1,
      targetCount: 2,
      plannedCount: 1,
    };

    expect(
      placementWonderArtifacts.naturalWonderPlan
        .validate(invalid, { dimensions: TEST_MAP_SIZE.dimensions })
        .map(({ message }) => message)
    ).toContain("targetCount 2 exceeds wondersCount 1.");
  });
});
