import { describe, expect, it } from "bun:test";

import { createMockAdapter } from "@civ7/adapter";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";

import {
  buildResourcePlacementRuntimeTelemetry,
  placeResourcesWithTypedOutcomes,
} from "../../src/recipes/standard/stages/placement/steps/place-resources/materialize.js";

type PlanIntent = {
  plotIndex: number;
  x: number;
  y: number;
  resourceType: string;
  resourceTypeId: number;
  family: "aquatic" | "cultivated" | "terrestrial" | "geological";
  laneId: string;
  laneKind: "land" | "water";
  phase: "rotation" | "range-floor" | "region-minimum";
  order: number;
  regionSlot: number;
  landmassId: number;
  inHabitat: boolean;
};

function intent(
  plotIndex: number,
  width: number,
  resourceTypeId: number,
  phase: PlanIntent["phase"] = "rotation"
): PlanIntent {
  const y = (plotIndex / width) | 0;
  return {
    plotIndex,
    x: plotIndex - y * width,
    y,
    resourceType: `RESOURCE_${resourceTypeId}`,
    resourceTypeId,
    family: "geological",
    laneId: "test-lane",
    laneKind: "land",
    phase,
    order: plotIndex,
    regionSlot: 1,
    landmassId: 0,
    inHabitat: true,
  };
}

function plan(width: number, height: number, intents: PlanIntent[]) {
  return {
    width,
    height,
    seed: 1,
    plannedCount: intents.length,
    rotationCount: intents.filter((row) => row.phase === "rotation").length,
    rangeFloorCount: intents.filter((row) => row.phase === "range-floor").length,
    regionMinimumCount: intents.filter((row) => row.phase === "region-minimum").length,
    siteSpacingTiles: 3,
    equitySkippedSiteCount: 0,
    intents,
    perType: [],
    regionMinimums: [],
    settings: {
      density: 1,
      sparsity: 0,
      rarityFidelity: 1,
      perTypeSpacingFloorScale: 1,
      equityMaxDensityRatio: 1.8,
      affinityRuleCount: 0,
    },
  } as unknown as Parameters<typeof placeResourcesWithTypedOutcomes>[0]["plan"];
}

describe("resource placement diagnostics", () => {
  it("stamps plan intents verbatim and records typed per-type shortfalls", () => {
    const width = 4;
    const height = 3;
    const adapter = createMockAdapter({
      width,
      height,
      mapInfo: { GridWidth: width, GridHeight: height },
      mapSizeId: 1,
      rng: createLabelRng(1931),
      canHaveResource: (_x, _y, resourceType) => resourceType !== 9,
    });

    const outcomes = placeResourcesWithTypedOutcomes({
      adapter,
      width,
      height,
      plan: plan(width, height, [
        intent(0, width, 4),
        intent(1, width, 9),
        intent(5, width, 9, "range-floor"),
        intent(6, width, 4),
      ]),
    });

    expect(outcomes.summary).toMatchObject({
      plannedCount: 4,
      placedCount: 2,
      rejectedCount: 2,
      mismatchCount: 0,
      byReason: [{ reason: "cannot-have-resource", count: 2 }],
    });
    expect(outcomes.summary.coordinateProof.placed.hash32).toMatch(/^[0-9a-f]{8}$/);
    // Plan authority: type-at-plot is never re-decided; rejections stay at the
    // planned plot with the planned type.
    expect(outcomes.outcomes.map((row) => [row.plotIndex, row.resourceType, row.status])).toEqual([
      [0, 4, "placed"],
      [1, 9, "rejected"],
      [5, 9, "rejected"],
      [6, 4, "placed"],
    ]);
    expect(outcomes.reconciliation).toEqual({
      plannedCount: 4,
      placedCount: 2,
      rejectedCount: 2,
      shortfalls: [{ resourceType: 9, reason: "cannot-have-resource", count: 2 }],
      byPhase: { rotation: 2, rangeFloor: 0, regionMinimum: 0 },
    });
  });

  it("fails hard on plan metadata mismatch", () => {
    const width = 4;
    const height = 3;
    const adapter = createMockAdapter({
      width,
      height,
      mapInfo: { GridWidth: width, GridHeight: height },
      mapSizeId: 1,
      rng: createLabelRng(1932),
    });
    const broken = plan(width, height, [intent(0, width, 4)]) as { plannedCount: number };
    broken.plannedCount = 2;

    expect(() =>
      placeResourcesWithTypedOutcomes({
        adapter,
        width,
        height,
        plan: broken as Parameters<typeof placeResourcesWithTypedOutcomes>[0]["plan"],
      })
    ).toThrow(/plan metadata mismatch/i);
  });

  it("formats compact runtime telemetry for scripting logs", () => {
    const telemetry = buildResourcePlacementRuntimeTelemetry(
      {
        plannedCount: 4,
        placedCount: 3,
        rejectedCount: 1,
        mismatchCount: 0,
        coordinateProof: {
          version: 1,
          placed: { count: 3, hash32: "12345678" },
          rejected: { count: 1, hash32: "abcdef12" },
          mismatch: { count: 0, hash32: "811c9dc5" },
        },
        byResource: [
          {
            resourceType: 13,
            plannedCount: 2,
            placedCount: 2,
            rejectedCount: 0,
            mismatchCount: 0,
            reasons: [],
          },
          {
            resourceType: 44,
            plannedCount: 2,
            placedCount: 1,
            rejectedCount: 1,
            mismatchCount: 0,
            reasons: [{ reason: "cannot-have-resource", count: 1 }],
          },
        ],
        byReason: [{ reason: "cannot-have-resource", count: 1 }],
      },
      {
        plannedCount: 4,
        placedCount: 3,
        rejectedCount: 1,
        shortfalls: [{ resourceType: 44, reason: "cannot-have-resource", count: 1 }],
        byPhase: { rotation: 3, rangeFloor: 0, regionMinimum: 0 },
      },
      [
        { index: 13, resourceType: "RESOURCE_GOLD", resourceClassType: null, name: null },
        { index: 44, resourceType: "RESOURCE_RUBIES", resourceClassType: null, name: null },
      ],
      [
        {
          status: "rejected",
          plotIndex: 67,
          x: 12,
          y: 3,
          resourceType: 44,
          reason: "cannot-have-resource",
        },
      ]
    );

    expect(telemetry).toMatchObject({
      version: 1,
      plannedCount: 4,
      placedCount: 3,
      rejectedCount: 1,
      mismatchCount: 0,
      uniquePlannedTypes: 2,
      uniquePlacedTypes: 2,
      minPlacedCountByType: 1,
      maxPlacedCountByType: 2,
      runtimeCatalogCount: 2,
      coordinateProof: {
        version: 1,
        placedCount: 3,
        placedHash32: "12345678",
        rejectedCount: 1,
        rejectedHash32: "abcdef12",
      },
      rejectedResourceTypes: [44],
      rejectionExampleCount: 1,
      rejectionRows: [
        {
          status: "rejected",
          resourceType: 44,
          resource: "RESOURCE_RUBIES",
          plotIndex: 67,
          x: 12,
          y: 3,
          reason: "cannot-have-resource",
        },
      ],
      reconciliation: {
        plannedCount: 4,
        placedCount: 3,
        rejectedCount: 1,
        byPhase: { rotation: 3, rangeFloor: 0, regionMinimum: 0 },
        shortfalls: [{ resourceType: 44, reason: "cannot-have-resource", count: 1 }],
      },
      byReason: [{ reason: "cannot-have-resource", count: 1 }],
    });
    expect(telemetry).not.toHaveProperty("assignment");
    expect(JSON.stringify(telemetry).length).toBeLessThan(900);
  });

  it("keeps full-catalog runtime telemetry below the Civ7 log truncation limit", () => {
    const resourceRows = Array.from({ length: 55 }, (_, resourceType) => ({
      resourceType,
      plannedCount: resourceType === 5 || resourceType === 15 ? 0 : 3,
      placedCount: resourceType === 5 || resourceType === 15 ? 0 : 3,
      rejectedCount: 0,
      mismatchCount: 0,
      reasons: [],
    }));
    const telemetry = buildResourcePlacementRuntimeTelemetry(
      {
        plannedCount: 159,
        placedCount: 159,
        rejectedCount: 0,
        mismatchCount: 0,
        coordinateProof: {
          version: 1,
          placed: { count: 159, hash32: "22222222" },
          rejected: { count: 0, hash32: "811c9dc5" },
          mismatch: { count: 0, hash32: "811c9dc5" },
        },
        byResource: resourceRows,
        byReason: [],
      },
      {
        plannedCount: 159,
        placedCount: 159,
        rejectedCount: 0,
        shortfalls: [],
        byPhase: { rotation: 140, rangeFloor: 15, regionMinimum: 4 },
      },
      Array.from({ length: 55 }, (_, index) => ({
        index,
        resourceType: `RESOURCE_${index}`,
        resourceClassType: "RESOURCECLASS_BONUS",
        name: `Resource ${index}`,
      }))
    );

    expect(telemetry).toMatchObject({
      version: 1,
      plannedCount: 159,
      placedCount: 159,
      rejectedCount: 0,
      runtimeCatalogCount: 55,
      coordinateProof: {
        version: 1,
        placedCount: 159,
        placedHash32: "22222222",
      },
      rejectedResourceTypes: [],
      reconciliation: {
        plannedCount: 159,
        placedCount: 159,
        rejectedCount: 0,
        byPhase: { rotation: 140, rangeFloor: 15, regionMinimum: 4 },
      },
    });
    expect(telemetry).not.toHaveProperty("unmappedPlacedResourceTypes");
    expect(JSON.stringify(telemetry).length).toBeLessThan(900);
    expect(`[SWOOPER_MOD] RESOURCE_PLACEMENT_V1 ${JSON.stringify(telemetry)}`.length).toBeLessThan(
      900
    );
  });
});
