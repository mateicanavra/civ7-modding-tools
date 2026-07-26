import { describe, expect, it } from "bun:test";
import { artifacts as placementStartArtifacts } from "@mapgen/domain/placement/modules/starts/artifacts/index.js";
import { TEST_MAP_SIZE } from "../../../../setup.js";

const VALIDATION_CONTEXT = { dimensions: TEST_MAP_SIZE.dimensions };

function makeSyntheticStartAssignment(seatCount: number, assigned = seatCount) {
  const seats = Array.from({ length: seatCount }, (_value, seatIndex) => {
    const seated = seatIndex < assigned;
    return {
      seatIndex,
      playerId: seatIndex,
      playerIdSource: "alive-majors" as const,
      regionSlot: seatIndex % 2 === 0 ? 1 : 2,
      realizedRegionSlot: seated ? (seatIndex % 2 === 0 ? 1 : 2) : 0,
      plotIndex: seated ? seatIndex : -1,
      rung: seated ? ("regional" as const) : ("spacing-relaxed" as const),
      status: seated ? ("full" as const) : ("degraded" as const),
      tier: seated ? ("primary" as const) : ("none" as const),
      score: seated ? 1 : 0,
      components: {
        freshwater: 0,
        fertility: 0,
        expansion: 0,
        climate: 0,
        resource: 0,
        roughness: 0,
      },
      achievedSpacing: seated ? 1 : -1,
      imputedFlags: seated ? [] : ["unseated"],
    };
  });
  return {
    ...TEST_MAP_SIZE.dimensions,
    positions: seats.map((seat) => seat.plotIndex),
    seats,
    fairnessReport: {
      tolerance: 0.3,
      parity: seats.map((seat) => seat.score),
      worstPairGap: null,
      balanced: true,
      swaps: [],
      relaxations: [],
    },
    status: assigned === seatCount ? ("full" as const) : ("degraded" as const),
    assigned,
    unseatedCount: seatCount - assigned,
    rungCounts: {
      regional: assigned,
      openPool: 0,
      qualityRelaxed: 0,
      spacingRelaxed: 0,
    },
    primaryAssigned: assigned,
    islandClusterAssigned: 0,
    marginalAssigned: 0,
    noneAssigned: 0,
    candidateCount: seatCount,
    rejectionCounts: [],
    tierCounts: { primary: seatCount, islandCluster: 0, marginal: 0 },
    inputCoverage: [],
  };
}

function hasIssue(value: unknown, messageFragment: string): boolean {
  return placementStartArtifacts.startAssignment
    .validate(value, VALIDATION_CONTEXT)
    .some((issue) => issue.message.includes(messageFragment));
}

describe("placement start-assignment artifacts", () => {
  it("validates rung counts and fairness report consistency", () => {
    const assignment = makeSyntheticStartAssignment(0);
    expect(
      placementStartArtifacts.startAssignment.validate(assignment, VALIDATION_CONTEXT)
    ).toEqual([]);

    expect(
      placementStartArtifacts.startAssignment
        .validate(
          {
            ...assignment,
            rungCounts: { ...assignment.rungCounts, regional: 1 },
          },
          VALIDATION_CONTEXT
        )
        .some((issue) => issue.message.includes("rungCounts.regional"))
    ).toBe(true);
    expect(
      placementStartArtifacts.startAssignment
        .validate(
          {
            ...assignment,
            fairnessReport: { ...assignment.fairnessReport, parity: [1] },
          },
          VALIDATION_CONTEXT
        )
        .some((issue) => issue.message.includes("fairnessReport.parity"))
    ).toBe(true);

    const complete = makeSyntheticStartAssignment(1);
    expect(
      placementStartArtifacts.startAssignment
        .validate(
          {
            ...complete,
            seats: [{ ...complete.seats[0]!, realizedRegionSlot: 0 }],
          },
          VALIDATION_CONTEXT
        )
        .some((issue) => issue.message.includes("realizedRegionSlot 1 or 2"))
    ).toBe(true);
  });

  it("rejects full status when any seat is degraded, fallback, or unseated", () => {
    const complete = makeSyntheticStartAssignment(1);
    const degradedSeat = {
      ...complete,
      seats: [{ ...complete.seats[0]!, status: "degraded" as const }],
    };
    expect(hasIssue(degradedSeat, "status full != derived degraded")).toBe(true);

    const fallbackSeat = {
      ...complete,
      seats: [
        {
          ...complete.seats[0]!,
          rung: "open-pool" as const,
          status: "degraded" as const,
        },
      ],
      rungCounts: { ...complete.rungCounts, regional: 0, openPool: 1 },
    };
    expect(hasIssue(fallbackSeat, "status full != derived degraded")).toBe(true);

    const unseatedSeat = {
      ...makeSyntheticStartAssignment(1, 0),
      status: "full" as const,
    };
    expect(hasIssue(unseatedSeat, "status full != derived degraded")).toBe(true);
  });

  it("derives full status only when region and spacing degradation flags are absent", () => {
    const complete = makeSyntheticStartAssignment(1);
    for (const degradationFlag of ["region-reassigned", "spacing-below-floor"]) {
      const flagged = {
        ...complete,
        seats: [
          {
            ...complete.seats[0]!,
            imputedFlags: [degradationFlag],
          },
        ],
      };
      expect(hasIssue(flagged, "status full != derived degraded")).toBe(true);
    }
  });

  it("rejects degraded status when every seat is full", () => {
    const complete = makeSyntheticStartAssignment(2);
    expect(
      hasIssue(
        {
          ...complete,
          status: "degraded" as const,
        },
        "status degraded != derived full"
      )
    ).toBe(true);
  });

  it("reconciles assigned and unseated counters against seated rows", () => {
    const assignment = makeSyntheticStartAssignment(2, 1);
    expect(
      hasIssue({ ...assignment, assigned: assignment.assigned + 1 }, "startAssignment.assigned")
    ).toBe(true);
    expect(
      hasIssue(
        { ...assignment, unseatedCount: assignment.unseatedCount + 1 },
        "startAssignment.unseatedCount"
      )
    ).toBe(true);
  });

  it("reconciles every rung and assigned-tier counter against seated rows", () => {
    const assignment = makeSyntheticStartAssignment(4);
    const seats = [
      assignment.seats[0]!,
      {
        ...assignment.seats[1]!,
        rung: "open-pool" as const,
        status: "degraded" as const,
        tier: "islandCluster" as const,
      },
      {
        ...assignment.seats[2]!,
        rung: "quality-relaxed" as const,
        status: "degraded" as const,
        tier: "none" as const,
      },
      {
        ...assignment.seats[3]!,
        rung: "spacing-relaxed" as const,
        status: "degraded" as const,
        tier: "marginal" as const,
      },
    ];
    const reconciled = {
      ...assignment,
      positions: seats.map((seat) => seat.plotIndex),
      seats,
      status: "degraded" as const,
      rungCounts: {
        regional: 1,
        openPool: 1,
        qualityRelaxed: 1,
        spacingRelaxed: 1,
      },
      primaryAssigned: 1,
      islandClusterAssigned: 1,
      marginalAssigned: 1,
      noneAssigned: 1,
    };
    expect(
      placementStartArtifacts.startAssignment.validate(reconciled, VALIDATION_CONTEXT)
    ).toEqual([]);

    for (const rung of ["regional", "openPool", "qualityRelaxed", "spacingRelaxed"] as const) {
      const invalid = {
        ...reconciled,
        rungCounts: { ...reconciled.rungCounts, [rung]: reconciled.rungCounts[rung] + 1 },
      };
      expect(hasIssue(invalid, `rungCounts.${rung}`)).toBe(true);
    }

    for (const counter of [
      "primaryAssigned",
      "islandClusterAssigned",
      "marginalAssigned",
      "noneAssigned",
    ] as const) {
      expect(
        hasIssue(
          { ...reconciled, [counter]: reconciled[counter] + 1 },
          `startAssignment.${counter}`
        )
      ).toBe(true);
    }
  });
});
