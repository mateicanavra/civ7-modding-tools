import { Effect } from "effect";

import type {
  Civ7ControlOrpcDirectControlFacade,
  Civ7ControlOrpcBattlefieldScanResult,
  Civ7ControlOrpcTargetCandidatesResult,
} from "../../../dependencies/direct-control";
import { civ7ControlOrpcErrorCorrelationData } from "../../../model/correlation";
import { civ7ControlOrpcImplementer } from "../../../procedure";
import type {
  Civ7StrategyFrontSummaryInput,
  Civ7StrategyFrontSummaryResult,
} from "../contract";

type Civ7StrategyTargetCandidatesInput = NonNullable<
  Parameters<Civ7ControlOrpcDirectControlFacade["getCiv7TargetCandidates"]>[0]
>;
type Civ7StrategyBattlefieldScanInput = NonNullable<
  Parameters<Civ7ControlOrpcDirectControlFacade["getCiv7BattlefieldScan"]>[0]
>;

export const strategyFrontSummaryProcedure =
  civ7ControlOrpcImplementer.strategy.frontSummary.effect(function* ({
    context,
    errors,
    input,
  }) {
    return yield* Effect.tryPromise({
      try: async () => {
        const targetInput = targetCandidatesInput(input);
        const battlefieldInput = battlefieldScanInput(input);
        const [targetCandidates, battlefieldScan] = await Promise.all([
          context.directControl.getCiv7TargetCandidates(
            targetInput,
            context.endpointDefaults,
          ),
          context.directControl.getCiv7BattlefieldScan(
            battlefieldInput,
            context.endpointDefaults,
          ),
        ]);

        return strategyFrontSummaryResult({
          input,
          targetCandidates,
          battlefieldScan,
        });
      },
      catch: () =>
        errors.STRATEGY_FRONT_SUMMARY_UNAVAILABLE({
          data: {
            procedureKey: "strategy.frontSummary",
            source: "direct-control-facade",
            ...civ7ControlOrpcErrorCorrelationData(context),
          },
        }),
    });
  });

function targetCandidatesInput(
  input: Civ7StrategyFrontSummaryInput,
): Civ7StrategyTargetCandidatesInput {
  return {
    playerId: input.playerId,
    origins: input.origins,
    maxCandidates: input.candidateLimit ?? 5,
    maxPlayers: input.maxPlayers,
    unitRadius: Math.min(input.scanRadius ?? 8, 16),
  };
}

function battlefieldScanInput(
  input: Civ7StrategyFrontSummaryInput,
): Civ7StrategyBattlefieldScanInput {
  return {
    playerId: input.playerId,
    origins: input.origins,
    radius: input.scanRadius ?? 8,
    maxPlayers: input.maxPlayers,
    maxUnits: 48,
    maxCities: 24,
  };
}

function strategyFrontSummaryResult({
  targetCandidates,
  battlefieldScan,
}: Readonly<{
  input: Civ7StrategyFrontSummaryInput;
  targetCandidates: Civ7ControlOrpcTargetCandidatesResult;
  battlefieldScan: Civ7ControlOrpcBattlefieldScanResult;
}>): Civ7StrategyFrontSummaryResult {
  const targetCandidateSummaries = targetCandidates.candidates.map(
    (candidate) => ({
      owner: candidate.owner,
      relationship: "relationship-unproven" as const,
      relationshipProof: "none" as const,
      nearestDistance: candidate.nearestDistance,
      cityCount: candidate.cityCount,
      unitCount: candidate.unitCount,
      nearbyUnitCount: candidate.nearbyUnitCount,
      apparentStrength: candidate.apparentStrength,
      routeKind: candidate.approach.routeKind,
      routeHint: candidate.approach.routeHint,
      reasons: [...candidate.reasons],
    }),
  );
  const pointsOfInterest = battlefieldScan.pointsOfInterest.map((point) => ({
    kind: point.kind,
    severity: point.severity,
    location: point.location,
    summary: normalizeRelationshipSummary(point.summary),
  }));
  const observedOwners = battlefieldScan.owners.map((owner) => ({
    owner: owner.owner,
    relationship: owner.relationshipProof === "self"
      ? "self" as const
      : "relationship-unproven" as const,
    relationshipProof: owner.relationshipProof === "self"
      ? "self" as const
      : "none" as const,
    unitCount: owner.unitCount,
    cityCount: owner.cityCount,
    apparentStrength: owner.apparentStrength,
    nearestDistance: nearestOwnerDistance(owner),
  }));
  const nextSteps = strategyNextSteps({
    targetCandidates: targetCandidateSummaries,
    pointsOfInterest,
  });

  return {
    playerId: targetCandidates.playerId,
    localPlayerId: targetCandidates.localPlayerId,
    origins: targetCandidates.origins.length > 0
      ? targetCandidates.origins
      : battlefieldScan.origins,
    sourceStatus: {
      targetCandidates: "read",
      battlefieldScan: "read",
    },
    relationshipLabelPolicy: {
      relationshipSource: "not-classified",
      relationshipProof: "none",
      unprovenLabel: "relationship-unproven",
      guidance: "Front summary composes planning evidence only. Other-owner contact, proximity, ranking, and action legality do not prove official diplomatic status.",
    },
    summary: {
      targetCandidateCount: targetCandidateSummaries.length,
      pointOfInterestCount: pointsOfInterest.length,
      observedOwnerCount: observedOwners.length,
      nextStepCount: nextSteps.length,
    },
    targetCandidates: targetCandidateSummaries,
    pointsOfInterest,
    observedOwners,
    notes: [
      "Read-only strategy front summary. It does not move, attack, send actions, or change diplomacy.",
      "Use visibility and validator-backed unit action procedures before any mutation.",
      "Relationship labels stay relationship-unproven unless official diplomatic evidence proves more.",
    ],
    nextSteps,
  };
}

function nearestOwnerDistance(
  owner: Civ7ControlOrpcBattlefieldScanResult["owners"][number],
): number | null {
  const distances = [
    distanceFromUnknown(owner.nearestUnit),
    distanceFromUnknown(owner.nearestCity),
  ].filter((distance): distance is number => distance != null);
  if (distances.length === 0) return null;
  return Math.min(...distances);
}

function distanceFromUnknown(value: unknown): number | null {
  if (value == null || typeof value !== "object") return null;
  if (!("distance" in value) || typeof value.distance !== "number") return null;
  return value.distance;
}

function strategyNextSteps({
  targetCandidates,
  pointsOfInterest,
}: Readonly<{
  targetCandidates: Civ7StrategyFrontSummaryResult["targetCandidates"];
  pointsOfInterest: Civ7StrategyFrontSummaryResult["pointsOfInterest"];
}>): Civ7StrategyFrontSummaryResult["nextSteps"] {
  const nextSteps: Civ7StrategyFrontSummaryResult["nextSteps"] = [];
  const candidate = targetCandidates[0];
  if (candidate != null) {
    nextSteps.push({
      kind: "inspect-target-candidate",
      source: "strategy.frontSummary",
      label: `Inspect owner ${candidate.owner} planning candidate with visibility reads before treating it as actionable.`,
    });
  }

  const point = pointsOfInterest[0];
  if (point != null) {
    nextSteps.push({
      kind: "inspect-battlefield-point",
      source: "strategy.frontSummary",
      label: `Inspect ${point.kind} battlefield point before choosing a unit action.`,
    });
  }

  if (targetCandidates.length > 0 || pointsOfInterest.length > 0) {
    nextSteps.push({
      kind: "read-visibility",
      source: "strategy.frontSummary",
      label: "Read visibility/map evidence before promoting planning evidence into an action.",
    });
    nextSteps.push({
      kind: "validate-unit-action",
      source: "strategy.frontSummary",
      label: "Use unit action validation before any movement or target send.",
    });
  }

  if (nextSteps.length === 0) {
    return [{
      kind: "observe",
      source: "strategy.frontSummary",
      label: "No front planning evidence found; refresh attention or narrow the scan origins.",
    }];
  }

  return nextSteps;
}

function normalizeRelationshipSummary(summary: string): string {
  return summary
    .replace(/\bfriendly\b/gi, "own")
    .replace(/\bpressure\b/gi, "contact")
    .replace(/\bthreat\b/gi, "contact");
}
