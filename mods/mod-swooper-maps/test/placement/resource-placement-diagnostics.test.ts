import { describe, expect, it } from "bun:test";

import { createMockAdapter } from "@civ7/adapter";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";

import {
  buildResourcePlacementRuntimeTelemetry,
  placeResourcesWithTypedOutcomes,
} from "../../src/recipes/standard/stages/placement/steps/place-resources/materialize.js";

describe("resource placement diagnostics", () => {
  it("summarizes placement outcomes by resource and reason", () => {
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
      resources: {
        width,
        height,
        candidateResourceTypes: [4, 9],
        targetCount: 4,
        plannedCount: 4,
        placements: [
          { plotIndex: 0, preferredResourceType: 4, preferredTypeOffset: 0, priority: 0.9 },
          { plotIndex: 1, preferredResourceType: 9, preferredTypeOffset: 1, priority: 0.8 },
          { plotIndex: 5, preferredResourceType: 9, preferredTypeOffset: 1, priority: 0.7 },
          { plotIndex: 6, preferredResourceType: 4, preferredTypeOffset: 0, priority: 0.6 },
        ],
      },
    });

    expect(outcomes.summary).toEqual({
      plannedCount: 4,
      placedCount: 4,
      rejectedCount: 0,
      mismatchCount: 0,
      byResource: [
        {
          resourceType: 4,
          plannedCount: 4,
          placedCount: 4,
          rejectedCount: 0,
          mismatchCount: 0,
          reasons: [],
        },
      ],
      byReason: [],
    });
    expect(outcomes.assignment).toMatchObject({
      requestedPlannedCount: 4,
      assignedCount: 4,
      reassignedCount: 2,
      unassignedPreferredCount: 0,
      candidateResourceTypes: [4, 9],
      legalCandidateResourceTypes: [4],
      unassignableResourceTypes: [9],
      byPreferredResource: [
        {
          resourceType: 4,
          plannedCount: 2,
          assignedCount: 4,
          reassignedOutCount: 0,
          reassignedInCount: 2,
          unassignedCount: 0,
        },
        {
          resourceType: 9,
          plannedCount: 2,
          assignedCount: 0,
          reassignedOutCount: 2,
          reassignedInCount: 0,
          unassignedCount: 0,
        },
      ],
    });
  });

  it("formats compact runtime telemetry for scripting logs", () => {
    const telemetry = buildResourcePlacementRuntimeTelemetry(
      {
        plannedCount: 4,
        placedCount: 3,
        rejectedCount: 1,
        mismatchCount: 0,
        byResource: [
          {
            resourceType: 4,
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
      undefined,
      [
        {
          index: 4,
          resourceType: "RESOURCE_GOLD",
          resourceClassType: "RESOURCECLASS_EMPIRE",
          name: "Gold",
        },
        {
          index: 44,
          resourceType: "RESOURCE_RUBIES",
          resourceClassType: "RESOURCECLASS_BONUS",
          name: "Rubies",
        },
      ]
    );

    expect(telemetry).toEqual({
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
      plannedResourceTypes: [4, 44],
      placedResourceTypes: [4, 44],
      rejectedResourceTypes: [44],
      unmappedPlacedResourceTypes: [],
      byReason: [{ reason: "cannot-have-resource", count: 1 }],
    });
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
        byResource: resourceRows,
        byReason: [],
      },
      {
        requestedPlannedCount: 159,
        assignedCount: 159,
        reassignedCount: 120,
        unassignedPreferredCount: 18,
        candidateResourceTypes: Array.from({ length: 55 }, (_, resourceType) => resourceType),
        legalCandidateResourceTypes: resourceRows
          .filter((row) => row.placedCount > 0)
          .map((row) => row.resourceType),
        unassignableResourceTypes: [5, 15],
        byPreferredResource: [],
      },
      Array.from({ length: 55 }, (_, index) => ({
        index,
        resourceType: `RESOURCE_${index}`,
        resourceClassType: "RESOURCECLASS_BONUS",
        name: `Resource ${index}`,
      }))
    );

    const placedResourceTypes = resourceRows
      .filter((row) => row.placedCount > 0)
      .map((row) => row.resourceType);

    expect(telemetry).toMatchObject({
      version: 1,
      plannedCount: 159,
      placedCount: 159,
      rejectedCount: 0,
      runtimeCatalogCount: 55,
      plannedResourceTypes: placedResourceTypes,
      placedResourceTypes,
      rejectedResourceTypes: [],
      unmappedPlacedResourceTypes: [],
      assignment: {
        requestedPlannedCount: 159,
        assignedCount: 159,
        reassignedCount: 120,
        unassignedPreferredCount: 18,
        candidateResourceTypeCount: 55,
        legalCandidateResourceTypeCount: 53,
        unassignableResourceTypes: [5, 15],
      },
    });
    expect(JSON.stringify(telemetry).length).toBeLessThan(900);
    expect(`[SWOOPER_MOD] RESOURCE_PLACEMENT_V1 ${JSON.stringify(telemetry)}`.length).toBeLessThan(
      900
    );
  });
});
