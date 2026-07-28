import { describe, expect, it } from "bun:test";

import { artifacts as resourceSiteArtifacts } from "../../../../../src/domain/resources/modules/sites/artifacts/index.js";
import type { ArtifactValueOf } from "@swooper/mapgen-core/authoring/contracts";
import { TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../../setup.js";

type ResourcePlan = ArtifactValueOf<typeof resourceSiteArtifacts.resourcePlan>;

const DIMENSIONS = TEST_MAP_SIZE.dimensions;
const CELL_COUNT = DIMENSIONS.width * DIMENSIONS.height;

function coherentResourcePlan(): ResourcePlan {
  return {
    ...DIMENSIONS,
    seed: TEST_MAP_SEED,
    plannedCount: 1,
    rotationCount: 1,
    rangeFloorCount: 0,
    regionMinimumCount: 0,
    siteSpacingTiles: 1,
    equitySkippedSiteCount: 0,
    intents: [
      {
        plotIndex: 0,
        x: 0,
        y: 0,
        resourceType: "RESOURCE_A",
        family: "geological",
        laneId: "test",
        laneKind: "land",
        phase: "rotation",
        order: 0,
        regionSlot: 1,
        landmassId: 0,
        inHabitat: true,
      },
    ],
    perType: [
      {
        resourceType: "RESOURCE_A",
        family: "geological",
        laneId: "test",
        laneKind: "land",
        weight: 10,
        effectiveWeight: 1,
        authoredTargetCount: 2,
        effectiveTargetCount: 2,
        minCount: 1,
        maxCount: 2,
        spacingFloorTiles: 1,
        habitatTileCount: CELL_COUNT,
        legalTileCount: CELL_COUNT,
        eligibleTileCount: CELL_COUNT,
        plannedCount: 1,
        rotationCount: 1,
        rangeFloorCount: 0,
        regionMinimumCount: 0,
        shortfalls: [
          {
            resourceType: "RESOURCE_A",
            reason: "no-admitted-site",
            count: 1,
          },
        ],
      },
    ],
    regionMinimums: [],
    settings: {
      density: 1,
      sparsity: 0,
      rarityFidelity: 1,
      perTypeSpacingFloorScale: 1,
      equityMaxDensityRatio: 1.8,
      affinityRuleCount: 0,
      affinityRules: [],
    },
  };
}

function validationMessages(value: ResourcePlan): string[] {
  return resourceSiteArtifacts.resourcePlan
    .validate(value, { dimensions: DIMENSIONS })
    .map((issue) => issue.message);
}

function expectValidationMessage(value: ResourcePlan, fragment: string): void {
  expect(validationMessages(value).some((message) => message.includes(fragment))).toBe(true);
}

describe("resource plan artifact admission", () => {
  it("requires exact terminal shortfall evidence for each resource deficit", () => {
    expect(validationMessages(coherentResourcePlan())).toEqual([]);

    const missing = structuredClone(coherentResourcePlan());
    missing.perType[0]!.shortfalls.splice(0);
    expectValidationMessage(missing, "requires one terminal shortfall for deficit 1");

    const wrongType = structuredClone(coherentResourcePlan());
    wrongType.perType[0]!.shortfalls[0]!.resourceType = "RESOURCE_B";
    expectValidationMessage(wrongType, "shortfall names another resource type");

    const wrongCount = structuredClone(coherentResourcePlan());
    wrongCount.perType[0]!.shortfalls[0]!.count = 2;
    expectValidationMessage(wrongCount, "shortfall count 2 != terminal deficit 1");

    const stale = structuredClone(coherentResourcePlan());
    stale.perType[0]!.effectiveTargetCount = stale.perType[0]!.plannedCount;
    expectValidationMessage(stale, "requires no terminal shortfall for deficit 0");
  });
});
