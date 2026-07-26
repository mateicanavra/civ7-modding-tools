import { describe, expect, it } from "bun:test";
import { artifacts as resourceSiteArtifacts } from "@mapgen/domain/resources/modules/sites/artifacts/index.js";
import { TEST_MAP_SIZE } from "../../../../setup.js";

const VALIDATION_CONTEXT = { dimensions: TEST_MAP_SIZE.dimensions };

function coherentResourcePlacementOutcomes() {
  return {
    summary: {
      plannedCount: 3,
      placedCount: 1,
      rejectedCount: 2,
      mismatchCount: 0,
      coordinateEvidence: {
        version: 1 as const,
        placed: { count: 1, hash32: "c65190cb" },
        rejected: { count: 2, hash32: "d6d40598" },
        mismatch: { count: 0, hash32: "811c9dc5" },
      },
      byResource: [
        {
          resourceType: 10,
          plannedCount: 2,
          placedCount: 1,
          rejectedCount: 1,
          mismatchCount: 0,
          reasons: [{ reason: "cannot-have-resource" as const, count: 1 }],
        },
        {
          resourceType: 20,
          plannedCount: 1,
          placedCount: 0,
          rejectedCount: 1,
          mismatchCount: 0,
          reasons: [{ reason: "invalid-resource-type" as const, count: 1 }],
        },
      ],
      byReason: [
        { reason: "cannot-have-resource" as const, count: 1 },
        { reason: "invalid-resource-type" as const, count: 1 },
      ],
    },
    reconciliation: {
      plannedCount: 3,
      placedCount: 1,
      rejectedCount: 2,
      shortfalls: [
        { resourceType: 10, reason: "cannot-have-resource" as const, count: 1 },
        { resourceType: 20, reason: "invalid-resource-type" as const, count: 1 },
      ],
      byPhase: {
        rotation: 1,
        rangeFloor: 0,
        regionMinimum: 0,
        support: 0,
      },
      supportAdjustedPlacedCount: 0,
    },
    outcomes: [
      {
        status: "placed" as const,
        plotIndex: 1,
        x: 1,
        y: 0,
        resourceType: 10,
        observedResourceType: 10,
      },
      {
        status: "rejected" as const,
        plotIndex: 2,
        x: 2,
        y: 0,
        resourceType: 10,
        reason: "cannot-have-resource" as const,
      },
      {
        status: "rejected" as const,
        plotIndex: 3,
        x: 3,
        y: 0,
        resourceType: 20,
        reason: "invalid-resource-type" as const,
      },
    ],
  };
}

function validationMessages(value: unknown): string[] {
  return resourceSiteArtifacts.resourcePlacementOutcomes
    .validate(value, VALIDATION_CONTEXT)
    .map((issue) => issue.message);
}

describe("resource placement outcomes artifact admission", () => {
  it("admits coherent row-derived summaries and reconciliation evidence", () => {
    expect(validationMessages(coherentResourcePlacementOutcomes())).toEqual([]);
  });

  it("rejects aggregate status counts that disagree with the authored outcomes", () => {
    const value = coherentResourcePlacementOutcomes();
    value.summary.placedCount = 0;

    expect(validationMessages(value)).toContain("summary.placedCount 0 != outcomes-derived 1.");
  });

  it("rejects coordinate evidence that was not derived from the outcome rows", () => {
    const value = coherentResourcePlacementOutcomes();
    value.summary.coordinateEvidence.rejected.hash32 = "00000000";

    expect(validationMessages(value)).toContain(
      "summary.coordinateEvidence.rejected.hash32 00000000 != outcomes-derived d6d40598."
    );
  });

  it("rejects aggregate reason counts that disagree with the outcome rows", () => {
    const value = coherentResourcePlacementOutcomes();
    value.summary.byReason[0]!.count = 2;

    expect(validationMessages(value)).toContain(
      "summary.byReason must exactly match canonical outcomes-derived reason counts."
    );
  });

  it("rejects per-resource summaries that disagree with the outcome rows", () => {
    const value = coherentResourcePlacementOutcomes();
    value.summary.byResource[0]!.rejectedCount = 0;

    expect(validationMessages(value)).toContain(
      "summary.byResource must exactly match canonical outcomes-derived per-resource counts and reasons."
    );
  });

  it("rejects reconciliation counts, shortfalls, and phase totals that drift from outcomes", () => {
    const value = coherentResourcePlacementOutcomes();
    value.reconciliation.rejectedCount = 1;
    value.reconciliation.shortfalls[0]!.count = 2;
    value.reconciliation.byPhase.rotation = 0;

    const messages = validationMessages(value);
    expect(messages).toContain("reconciliation.rejectedCount 1 != outcomes-derived 2.");
    expect(messages).toContain(
      "reconciliation.shortfalls must exactly match canonical rejected-outcome resource/reason counts."
    );
    expect(messages).toContain("reconciliation.byPhase total 0 != outcomes-derived placedCount 1.");
  });

  it("rejects structurally valid wrong-type readback as fail-hard evidence", () => {
    const value = {
      summary: {
        plannedCount: 1,
        placedCount: 0,
        rejectedCount: 0,
        mismatchCount: 1,
        coordinateEvidence: {
          version: 1,
          placed: { count: 0, hash32: "811c9dc5" },
          rejected: { count: 0, hash32: "811c9dc5" },
          mismatch: { count: 1, hash32: "e63aca4c" },
        },
        byResource: [
          {
            resourceType: 30,
            plannedCount: 1,
            placedCount: 0,
            rejectedCount: 0,
            mismatchCount: 1,
            reasons: [{ reason: "wrong-resource-type", count: 1 }],
          },
        ],
        byReason: [{ reason: "wrong-resource-type", count: 1 }],
      },
      reconciliation: {
        plannedCount: 1,
        placedCount: 0,
        rejectedCount: 0,
        shortfalls: [],
        byPhase: {
          rotation: 0,
          rangeFloor: 0,
          regionMinimum: 0,
          support: 0,
        },
        supportAdjustedPlacedCount: 0,
      },
      outcomes: [
        {
          status: "mismatch",
          plotIndex: 4,
          x: 0,
          y: 1,
          resourceType: 30,
          reason: "wrong-resource-type",
          observedResourceType: 31,
        },
      ],
    };

    expect(validationMessages(value)).toEqual([
      "outcomes contain 1 fail-hard mismatch row(s); mismatch outcomes must never be published.",
    ]);
  });
});
