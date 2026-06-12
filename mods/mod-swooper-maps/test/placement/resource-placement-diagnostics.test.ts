import { describe, expect, it } from "bun:test";

import { createMockAdapter } from "@civ7/adapter";
import { hexDistanceOddQPeriodicX } from "@swooper/mapgen-core/lib/grid";
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
        minSpacingTiles: 0,
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
      coordinateProof: {
        version: 1,
        placed: { count: 4, hash32: "3c3530cb" },
        rejected: { count: 0, hash32: "811c9dc5" },
        mismatch: { count: 0, hash32: "811c9dc5" },
      },
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
    expect(outcomes.summary.coordinateProof.placed.hash32).toMatch(/^[0-9a-f]{8}$/);
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

  it("rejects non-initial-map resource ids before engine materialization", () => {
    const width = 4;
    const height = 3;
    const adapter = createMockAdapter({
      width,
      height,
      mapInfo: { GridWidth: width, GridHeight: height },
      mapSizeId: 1,
      rng: createLabelRng(1932),
    });

    expect(() =>
      placeResourcesWithTypedOutcomes({
        adapter,
        width,
        height,
        resources: {
          width,
          height,
          candidateResourceTypes: [4, 36, 38, 40],
          targetCount: 1,
          plannedCount: 1,
          minSpacingTiles: 0,
          placements: [
            { plotIndex: 0, preferredResourceType: 38, preferredTypeOffset: 0, priority: 0.9 },
          ],
        },
      })
    ).toThrow(/RESOURCE_COAL:deferred-future-age.*RESOURCE_OIL:deferred-future-age.*RESOURCE_RUBBER:deferred-future-age/);
  });

  it("preserves resource spacing while rescuing adjacent planned plots", () => {
    const width = 8;
    const height = 4;
    const adapter = createMockAdapter({
      width,
      height,
      mapInfo: { GridWidth: width, GridHeight: height },
      mapSizeId: 1,
      rng: createLabelRng(1933),
      canHaveResource: () => true,
    });

    const outcomes = placeResourcesWithTypedOutcomes({
      adapter,
      width,
      height,
      resources: {
        width,
        height,
        candidateResourceTypes: [4],
        targetCount: 4,
        plannedCount: 4,
        minSpacingTiles: 2,
        placements: [
          { plotIndex: 0, preferredResourceType: 4, preferredTypeOffset: 0, priority: 0.9 },
          { plotIndex: 1, preferredResourceType: 4, preferredTypeOffset: 0, priority: 0.8 },
          { plotIndex: 2, preferredResourceType: 4, preferredTypeOffset: 0, priority: 0.7 },
          { plotIndex: 3, preferredResourceType: 4, preferredTypeOffset: 0, priority: 0.6 },
        ],
      },
    });

    expect(outcomes.summary.placedCount).toBe(4);
    expect(outcomes.assignment.minSpacingTiles).toBe(2);
    expect(outcomes.assignment.spacingBlockedCount).toBeGreaterThan(0);
    const placedPlotIndices = outcomes.outcomes.map((outcome) => outcome.plotIndex);
    for (let i = 0; i < placedPlotIndices.length; i++) {
      for (let j = i + 1; j < placedPlotIndices.length; j++) {
        expect(
          hexDistanceOddQPeriodicX(placedPlotIndices[i]!, placedPlotIndices[j]!, width)
        ).toBeGreaterThanOrEqual(2);
      }
    }
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
      ],
      [
        {
          status: "rejected",
          plotIndex: 67,
          x: 12,
          y: 3,
          resourceType: 44,
          reason: "cannot-have-resource",
          observedResourceType: -1,
        },
      ],
      [
        {
          plotIndex: 67,
          resourceType: 44,
          initialResourceType: 44,
          preferredResourceType: 13,
          assignmentPhase: "scarce-floor",
          assignmentOrder: 9,
          perTypeCountBefore: 2,
          legalPlotCountForResource: 128,
          targetMinPerType: 7,
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
      coordinateProof: {
        version: 1,
        placedCount: 3,
        placedHash32: "12345678",
        rejectedCount: 1,
        rejectedHash32: "abcdef12",
      },
      rejectedResourceTypes: [44],
      rejectionExampleCount: 1,
      rejectionExamples: [
        "status=rejected resource=RESOURCE_RUBIES resourceType=44 plot=67 x=12 y=3 reason=cannot-have-resource observed=-1",
      ],
      rejectionRows: [
        {
          status: "rejected",
          resourceType: 44,
          resource: "RESOURCE_RUBIES",
          plotIndex: 67,
          x: 12,
          y: 3,
          reason: "cannot-have-resource",
          observedResourceType: -1,
          observedResource: null,
          phase: "scarce-floor",
          order: 9,
          initial: 44,
          preferred: 13,
          countBefore: 2,
          legalPlots: 128,
          targetMin: 7,
        },
      ],
      byReason: [{ reason: "cannot-have-resource", count: 1 }],
    });
    expect(telemetry).not.toHaveProperty("placedResourceTypes");
    expect(telemetry).not.toHaveProperty("assignment");
    expect(telemetry).not.toHaveProperty("unmappedPlacedResourceTypes");
    expect(telemetry).not.toHaveProperty("plannedResourceTypes");
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
        requestedPlannedCount: 159,
        assignedCount: 159,
        minSpacingTiles: 2,
        spacingBlockedCount: 11,
        spacingShortfallCount: 0,
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
      coordinateProof: {
        version: 1,
        placedCount: 159,
        placedHash32: "22222222",
      },
      placedResourceTypes,
      rejectedResourceTypes: [],
      assignment: {
        requestedPlannedCount: 159,
        assignedCount: 159,
        reassignedCount: 120,
        unassignedPreferredCount: 18,
        legalCandidateResourceTypeCount: 53,
        unassignableResourceTypes: [5, 15],
      },
    });
    expect(telemetry).not.toHaveProperty("unmappedPlacedResourceTypes");
    expect(telemetry).not.toHaveProperty("plannedResourceTypes");
    expect(JSON.stringify(telemetry).length).toBeLessThan(900);
    expect(`[SWOOPER_MOD] RESOURCE_PLACEMENT_V1 ${JSON.stringify(telemetry)}`.length).toBeLessThan(
      900
    );
  });
});
