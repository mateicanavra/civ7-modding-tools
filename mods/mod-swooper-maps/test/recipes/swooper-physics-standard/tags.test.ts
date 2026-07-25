import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { artifacts as placementStartArtifacts } from "@mapgen/domain/placement/modules/starts/artifacts/index.js";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import {
  type Artifact,
  type DependencyEvidence,
  observeValidatedArtifact,
} from "@swooper/mapgen-core/authoring";
import { publishTestArtifact, withMapContextExecutionForTest } from "@swooper/mapgen-core/testing";

import {
  STANDARD_ENGINE_EFFECT_TAGS,
  STANDARD_TAG_DEFINITIONS,
} from "../../../src/recipes/standard/tags.js";
import { TEST_MAP_SEED, TEST_MAP_SIZE } from "../../setup.js";

const ASSIGNMENT_GRID = TEST_MAP_SIZE.dimensions;

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
    ...ASSIGNMENT_GRID,
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

function placementAppliedSatisfies(
  assignment: ReturnType<typeof makeSyntheticStartAssignment>
): boolean {
  const definition = STANDARD_TAG_DEFINITIONS.find(
    ({ id }) => id === STANDARD_ENGINE_EFFECT_TAGS.engine.placementApplied
  );
  const satisfies = definition?.satisfies;
  if (!definition || !satisfies) throw new Error("Missing placement completion predicate.");

  const adapter = createMockAdapter(ASSIGNMENT_GRID);
  const context = createMapContext({
    setup: admitMapSetup({
      mapSeed: TEST_MAP_SEED,
      dimensions: ASSIGNMENT_GRID,
      latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
    }),
    adapter,
  });
  withMapContextExecutionForTest(context, (stepContext) => {
    publishTestArtifact(stepContext, placementStartArtifacts.startAssignment, assignment);
  });
  const evidence = Object.freeze({
    verifyEffect: () => adapter.verifyEffect(definition.id),
    observeArtifact: <A extends Artifact>(artifact: A) =>
      observeValidatedArtifact(context, artifact),
  }) satisfies DependencyEvidence;
  return satisfies(evidence);
}

describe("Standard effect tags", () => {
  it("rejects terminal placement when the start assignment leaves a seat unseated", () => {
    const complete = makeSyntheticStartAssignment(2);
    expect(placementStartArtifacts.startAssignment.validate(complete)).toEqual([]);
    expect(placementAppliedSatisfies(complete)).toBe(true);

    const incomplete = makeSyntheticStartAssignment(2, 1);
    expect(placementStartArtifacts.startAssignment.validate(incomplete)).toEqual([]);
    expect(incomplete.unseatedCount).toBe(1);
    expect(placementAppliedSatisfies(incomplete)).toBe(false);
  });

  it("rejects terminal placement when no player seats were admitted", () => {
    const empty = makeSyntheticStartAssignment(0);
    expect(placementStartArtifacts.startAssignment.validate(empty)).toEqual([]);
    expect(placementAppliedSatisfies(empty)).toBe(false);
  });
});
