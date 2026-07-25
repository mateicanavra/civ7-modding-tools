import { describe, expect, it } from "bun:test";

import { buildResourcePlacementRuntimeTelemetry } from "../../../../../src/recipes/standard/stages/placement/log.js";

type ResourcePlacementEvidence = Parameters<typeof buildResourcePlacementRuntimeTelemetry>[1];

const CIV7_LOG_TRUNCATION_BUDGET = 900;
const RESOURCE_PLACEMENT_LOG_PREFIX = "[SWOOPER_MOD] RESOURCE_PLACEMENT_V1 ";

function evidence(
  byResource: ResourcePlacementEvidence["summary"]["byResource"],
  counts: Readonly<{
    planned: number;
    placed: number;
    rejected: number;
  }>
): ResourcePlacementEvidence {
  return {
    summary: {
      plannedCount: counts.planned,
      placedCount: counts.placed,
      rejectedCount: counts.rejected,
      mismatchCount: 0,
      coordinateEvidence: {
        version: 1,
        placed: { count: counts.placed, hash32: "12345678" },
        rejected: { count: counts.rejected, hash32: "abcdef12" },
        mismatch: { count: 0, hash32: "811c9dc5" },
      },
      byResource,
      byReason:
        counts.rejected === 0 ? [] : [{ reason: "cannot-have-resource", count: counts.rejected }],
    },
    reconciliation: {
      plannedCount: counts.planned,
      placedCount: counts.placed,
      rejectedCount: counts.rejected,
      shortfalls:
        counts.rejected === 0
          ? []
          : [
              {
                resourceType: 44,
                reason: "cannot-have-resource",
                count: counts.rejected,
              },
            ],
      byPhase: {
        rotation: counts.placed,
        rangeFloor: 0,
        regionMinimum: 0,
        support: 0,
      },
      supportAdjustedPlacedCount: 0,
    },
    outcomes:
      counts.rejected === 0
        ? []
        : [
            {
              status: "rejected",
              plotIndex: 67,
              x: 12,
              y: 3,
              resourceType: 44,
              reason: "cannot-have-resource",
            },
          ],
  };
}

describe("resource placement runtime telemetry", () => {
  it("preserves the compact RESOURCE_PLACEMENT_V1 evidence envelope", () => {
    const telemetry = buildResourcePlacementRuntimeTelemetry(
      [
        { index: 13, resourceType: "RESOURCE_GOLD", resourceClassType: null, name: null },
        { index: 44, resourceType: "RESOURCE_RUBIES", resourceClassType: null, name: null },
      ],
      evidence(
        [
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
        { planned: 4, placed: 3, rejected: 1 }
      )
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
      coordinateEvidence: {
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
        byPhase: { rotation: 3, rangeFloor: 0, regionMinimum: 0, support: 0 },
        shortfalls: [{ resourceType: 44, reason: "cannot-have-resource", count: 1 }],
      },
      byReason: [{ reason: "cannot-have-resource", count: 1 }],
    });
    expect(telemetry).not.toHaveProperty("assignment");
    expect(JSON.stringify(telemetry).length).toBeLessThan(CIV7_LOG_TRUNCATION_BUDGET);
  });

  it("keeps a full runtime catalog below Civ7's log truncation budget", () => {
    const byResource = Array.from({ length: 55 }, (_, resourceType) => ({
      resourceType,
      plannedCount: resourceType === 5 || resourceType === 15 ? 0 : 3,
      placedCount: resourceType === 5 || resourceType === 15 ? 0 : 3,
      rejectedCount: 0,
      mismatchCount: 0,
      reasons: [],
    }));
    const telemetry = buildResourcePlacementRuntimeTelemetry(
      Array.from({ length: 55 }, (_, index) => ({
        index,
        resourceType: `RESOURCE_${index}`,
        resourceClassType: "RESOURCECLASS_BONUS",
        name: `Resource ${index}`,
      })),
      evidence(byResource, { planned: 159, placed: 159, rejected: 0 })
    );
    const line = `${RESOURCE_PLACEMENT_LOG_PREFIX}${JSON.stringify(telemetry)}`;

    expect(telemetry).toMatchObject({
      version: 1,
      plannedCount: 159,
      placedCount: 159,
      rejectedCount: 0,
      runtimeCatalogCount: 55,
      rejectedResourceTypes: [],
      reconciliation: {
        plannedCount: 159,
        placedCount: 159,
        rejectedCount: 0,
        byPhase: { rotation: 159, rangeFloor: 0, regionMinimum: 0, support: 0 },
      },
    });
    expect(telemetry).not.toHaveProperty("unmappedPlacedResourceTypes");
    expect(line.length).toBeLessThan(CIV7_LOG_TRUNCATION_BUDGET);
  });
});
