import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import {
  type Artifact,
  type DependencyEvidence,
  observeValidatedArtifact,
} from "@swooper/mapgen-core/authoring";
import { publishTestArtifact, withMapContextExecutionForTest } from "@swooper/mapgen-core/testing";

import { artifacts as placementArtifacts } from "../../../../../../src/recipes/standard/stages/placement/artifacts/index.js";
import {
  STANDARD_ENGINE_EFFECT_TAGS,
  STANDARD_TAG_DEFINITIONS,
} from "../../../../../../src/recipes/standard/tags.js";
import { TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../../../setup.js";

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

describe("placement start-assignment artifacts", () => {
  it("closes placement against the admitted start assignment instead of map slot capacity", () => {
    const definition = STANDARD_TAG_DEFINITIONS.find(
      ({ id }) => id === STANDARD_ENGINE_EFFECT_TAGS.engine.placementApplied
    );
    if (!definition?.satisfies) throw new Error("Missing placement completion predicate.");

    const createHarness = () => {
      const adapter = createMockAdapter({
        ...TEST_MAP_SIZE.dimensions,
        mapInfo: TEST_MAP_SIZE.mapInfo,
        mapSizeId: TEST_MAP_SIZE.id,
      });
      const context = createMapContext({
        setup: admitMapSetup({
          mapSeed: TEST_MAP_SEED,
          dimensions: TEST_MAP_SIZE.dimensions,
          latitudeBounds: {
            topLatitude: TEST_MAP_SIZE.mapInfo.MaxLatitude!,
            bottomLatitude: TEST_MAP_SIZE.mapInfo.MinLatitude!,
          },
        }),
        adapter,
      });
      return { adapter, context };
    };
    const satisfies = (
      assignment: ReturnType<typeof makeSyntheticStartAssignment>,
      startsAssigned: number
    ) => {
      const { adapter, context } = createHarness();
      withMapContextExecutionForTest(context, (stepContext) => {
        publishTestArtifact(stepContext, placementArtifacts.startAssignment, assignment);
        publishTestArtifact(stepContext, placementArtifacts.placementOutputs, {
          naturalWondersCount: 0,
          resourcesCount: 0,
          startsAssigned,
          discoveriesCount: 0,
        });
      });
      const evidence = Object.freeze({
        verifyEffect: () => adapter.verifyEffect(definition.id),
        observeArtifact<A extends Artifact>(artifact: A) {
          return observeValidatedArtifact(context, artifact);
        },
      }) satisfies DependencyEvidence;
      return definition.satisfies?.(evidence);
    };

    const completeAssignment = makeSyntheticStartAssignment(10);
    expect(placementArtifacts.startAssignment.validate(completeAssignment)).toEqual([]);
    expect(satisfies(completeAssignment, 10)).toBe(true);
    expect(satisfies(completeAssignment, 11)).toBe(false);

    const partialAssignment = makeSyntheticStartAssignment(10, 9);
    expect(placementArtifacts.startAssignment.validate(partialAssignment)).toEqual([]);
    expect(satisfies(partialAssignment, 9)).toBe(false);
  });

  it("validates rung counts and fairness report consistency", () => {
    const assignment = makeSyntheticStartAssignment(0);
    expect(placementArtifacts.startAssignment.validate(assignment)).toEqual([]);

    expect(
      placementArtifacts.startAssignment
        .validate({
          ...assignment,
          rungCounts: { ...assignment.rungCounts, regional: 1 },
        })
        .some((issue) => issue.message.includes("rungCounts.regional"))
    ).toBe(true);
    expect(
      placementArtifacts.startAssignment
        .validate({
          ...assignment,
          fairnessReport: { ...assignment.fairnessReport, parity: [1] },
        })
        .some((issue) => issue.message.includes("fairnessReport.parity"))
    ).toBe(true);

    const complete = makeSyntheticStartAssignment(1);
    expect(
      placementArtifacts.startAssignment
        .validate({
          ...complete,
          seats: [{ ...complete.seats[0]!, realizedRegionSlot: 0 }],
        })
        .some((issue) => issue.message.includes("realizedRegionSlot 1 or 2"))
    ).toBe(true);
  });
});
