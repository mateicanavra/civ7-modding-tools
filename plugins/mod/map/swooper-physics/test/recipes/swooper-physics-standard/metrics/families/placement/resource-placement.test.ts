import { describe, expect, it } from "bun:test";
import { requireResourceRuntimeId } from "@civ7/map-policy";
import { measureStandardResourcePlacement } from "../../../../../../src/recipes/standard/metrics/families/placement/resource-placement.js";
import { TEST_MAP_SIZE } from "../../../../../setup.js";

type MeasurementInput = Parameters<typeof measureStandardResourcePlacement>[0];
type MeasurementRow = MeasurementInput[number];
type ResourcePlacementPhase = MeasurementRow["phase"];
type ResourcePlacementRejectionReason = Extract<MeasurementRow, { status: "rejected" }>["reason"];

const GOLD_RUNTIME_ID = requireResourceRuntimeId("RESOURCE_GOLD").resourceTypeId;
const JADE_RUNTIME_ID = requireResourceRuntimeId("RESOURCE_JADE").resourceTypeId;

function outcome(
  plotIndex: number,
  resourceType: number,
  phase: ResourcePlacementPhase,
  status: "placed" | "rejected",
  reason: ResourcePlacementRejectionReason = "cannot-have-resource"
): MeasurementRow {
  const { width } = TEST_MAP_SIZE.dimensions;
  const y = Math.floor(plotIndex / width);
  const identity = {
    plotIndex,
    x: plotIndex - y * width,
    y,
    resourceType,
    phase,
  };
  return status === "placed" ? { status, ...identity } : { status, ...identity, reason };
}

function canonicalFixture(): MeasurementInput {
  return [
    outcome(0, GOLD_RUNTIME_ID, "rotation", "placed"),
    outcome(1, JADE_RUNTIME_ID, "range-floor", "rejected", "cannot-have-resource"),
    outcome(2, GOLD_RUNTIME_ID, "region-minimum", "placed"),
    outcome(3, JADE_RUNTIME_ID, "support", "rejected", "out-of-bounds"),
  ];
}

describe("Standard resource placement measurements", () => {
  it("derives canonical resource, reason, phase, shortfall, and coordinate evidence", () => {
    const measurement = measureStandardResourcePlacement(canonicalFixture());

    expect(measurement).toEqual({
      version: 1,
      summary: {
        plannedCount: 4,
        placedCount: 2,
        rejectedCount: 2,
        coordinateEvidence: {
          version: 1,
          placed: { count: 2, hash32: "d19556e7" },
          rejected: { count: 2, hash32: "67370e60" },
        },
        byResource: [
          {
            resourceType: GOLD_RUNTIME_ID,
            plannedCount: 2,
            placedCount: 2,
            rejectedCount: 0,
            reasons: [],
          },
          {
            resourceType: JADE_RUNTIME_ID,
            plannedCount: 2,
            placedCount: 0,
            rejectedCount: 2,
            reasons: [
              { reason: "cannot-have-resource", count: 1 },
              { reason: "out-of-bounds", count: 1 },
            ],
          },
        ],
        byReason: [
          { reason: "cannot-have-resource", count: 1 },
          { reason: "out-of-bounds", count: 1 },
        ],
        shortfalls: [
          { resourceType: JADE_RUNTIME_ID, reason: "cannot-have-resource", count: 1 },
          { resourceType: JADE_RUNTIME_ID, reason: "out-of-bounds", count: 1 },
        ],
        byPhase: {
          rotation: 1,
          rangeFloor: 0,
          regionMinimum: 1,
          support: 0,
        },
      },
      outcomes: [
        {
          status: "placed",
          plotIndex: 0,
          x: 0,
          y: 0,
          resourceType: GOLD_RUNTIME_ID,
          phase: "rotation",
        },
        {
          status: "rejected",
          plotIndex: 1,
          x: 1,
          y: 0,
          resourceType: JADE_RUNTIME_ID,
          phase: "range-floor",
          reason: "cannot-have-resource",
        },
        {
          status: "placed",
          plotIndex: 2,
          x: 2,
          y: 0,
          resourceType: GOLD_RUNTIME_ID,
          phase: "region-minimum",
        },
        {
          status: "rejected",
          plotIndex: 3,
          x: 3,
          y: 0,
          resourceType: JADE_RUNTIME_ID,
          phase: "support",
          reason: "out-of-bounds",
        },
      ],
    });
  });

  it("keeps coordinate digests stable when equivalent plan and outcome rows are reordered", () => {
    const canonical = canonicalFixture();
    const reversed = canonical.slice().reverse();

    expect(measureStandardResourcePlacement(reversed).summary.coordinateEvidence).toEqual(
      measureStandardResourcePlacement(canonical).summary.coordinateEvidence
    );
  });

  it("returns a deeply frozen snapshot rather than retaining caller-owned rows", () => {
    const fixture = canonicalFixture();
    const measurement = measureStandardResourcePlacement(fixture);

    expect(Object.isFrozen(measurement)).toBe(true);
    expect(Object.isFrozen(measurement.summary)).toBe(true);
    expect(Object.isFrozen(measurement.summary.byResource)).toBe(true);
    expect(Object.isFrozen(measurement.summary.byResource[0])).toBe(true);
    expect(Object.isFrozen(measurement.outcomes)).toBe(true);
    expect(Object.isFrozen(measurement.outcomes[0])).toBe(true);
    expect(measurement.outcomes[0]).not.toBe(fixture[0]);
  });
});
