import { Effect } from "effect";

import type {
  Civ7ControlOrpcDirectControlFacade,
  Civ7ControlOrpcBattlefieldScanResult,
  Civ7ControlOrpcDestinationAnalysisResult,
  Civ7ControlOrpcTargetCandidatesResult,
} from "../../../dependencies/direct-control";
import {
  civ7ControlOrpcErrorCorrelationData,
  civ7ControlOrpcFailureDetail,
} from "../../../model/correlation";
import { civ7ControlOrpcImplementer } from "../../../procedure";
import type { Civ7StrategyFrontSummaryInput, Civ7StrategyFrontSummaryResult } from "../contract";

type Civ7StrategyTargetCandidatesInput = NonNullable<
  Parameters<Civ7ControlOrpcDirectControlFacade["getCiv7TargetCandidates"]>[0]
>;
type Civ7StrategyBattlefieldScanInput = NonNullable<
  Parameters<Civ7ControlOrpcDirectControlFacade["getCiv7BattlefieldScan"]>[0]
>;
type Civ7StrategyDestinationAnalysisInput = Parameters<
  Civ7ControlOrpcDirectControlFacade["getCiv7DestinationAnalysis"]
>[0];
type Civ7StrategyPointOfInterest = Civ7StrategyFrontSummaryResult["pointsOfInterest"][number];

export const strategyFrontSummaryProcedure =
  civ7ControlOrpcImplementer.strategy.frontSummary.effect(function* ({ context, errors, input }) {
    return yield* Effect.tryPromise({
      try: async () => {
        const targetInput = targetCandidatesInput(input);
        const battlefieldInput = battlefieldScanInput(input);
        const [targetCandidates, battlefieldScan] = await Promise.all([
          context.directControl.getCiv7TargetCandidates(targetInput, context.endpointDefaults),
          context.directControl.getCiv7BattlefieldScan(battlefieldInput, context.endpointDefaults),
        ]);
        const target = input.target ?? firstCandidateCityLocation(targetCandidates.candidates);
        const destinationAnalysis =
          target == null
            ? null
            : await context.directControl.getCiv7DestinationAnalysis(
                destinationAnalysisInput({
                  input,
                  target,
                  origin: targetCandidates.origins[0] ?? battlefieldScan.origins[0],
                }),
                context.endpointDefaults
              );

        return strategyFrontSummaryResult({
          input,
          targetCandidates,
          battlefieldScan,
          destinationAnalysis,
          target,
        });
      },
      catch: (cause) =>
        errors.STRATEGY_FRONT_SUMMARY_UNAVAILABLE({
          data: {
            detail: civ7ControlOrpcFailureDetail(cause),
            procedureKey: "strategy.frontSummary",
            source: "direct-control-facade",
            ...civ7ControlOrpcErrorCorrelationData(context),
          },
        }),
    });
  });

function targetCandidatesInput(
  input: Civ7StrategyFrontSummaryInput
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
  input: Civ7StrategyFrontSummaryInput
): Civ7StrategyBattlefieldScanInput {
  return {
    playerId: input.playerId,
    origins: input.origins,
    radius: input.scanRadius ?? 8,
    maxPlayers: input.maxPlayers,
    maxUnits: input.maxUnits ?? 48,
    maxCities: input.maxCities ?? 24,
  };
}

function destinationAnalysisInput({
  input,
  target,
  origin,
}: Readonly<{
  input: Civ7StrategyFrontSummaryInput;
  target: NonNullable<Civ7StrategyFrontSummaryResult["target"]>;
  origin: Civ7StrategyFrontSummaryResult["origins"][number] | undefined;
}>): Civ7StrategyDestinationAnalysisInput {
  return {
    playerId: input.playerId,
    origin,
    destination: target,
    corridorRadius: input.corridorRadius ?? 2,
    destinationRadius: input.destinationRadius ?? 4,
    maxPlayers: input.maxPlayers,
    maxUnits: input.maxUnits,
    maxCities: input.maxCities,
  };
}

function strategyFrontSummaryResult({
  targetCandidates,
  battlefieldScan,
  destinationAnalysis,
  target,
}: Readonly<{
  input: Civ7StrategyFrontSummaryInput;
  targetCandidates: Civ7ControlOrpcTargetCandidatesResult;
  battlefieldScan: Civ7ControlOrpcBattlefieldScanResult;
  destinationAnalysis: Civ7ControlOrpcDestinationAnalysisResult | null;
  target: Civ7StrategyFrontSummaryResult["target"];
}>): Civ7StrategyFrontSummaryResult {
  const targetCandidateSummaries = targetCandidates.candidates.map((candidate) => ({
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
  }));
  const pointsOfInterest = [
    ...battlefieldScan.pointsOfInterest.map((point) => ({
      kind: point.kind,
      severity: point.severity,
      location: point.location,
      summary: normalizeRelationshipSummary(point.summary),
      source: "battlefield" as const,
    })),
    ...(destinationAnalysis?.pointsOfInterest.map((point) => ({
      kind: point.kind,
      severity: point.severity,
      location: point.location,
      summary: normalizeRelationshipSummary(point.summary),
      source: "destination" as const,
    })) ?? []),
  ];
  const observedOwners = battlefieldScan.owners.map((owner) => ({
    owner: owner.owner,
    relationship:
      owner.relationshipProof === "self" ? ("self" as const) : ("relationship-unproven" as const),
    relationshipProof: owner.relationshipProof === "self" ? ("self" as const) : ("none" as const),
    unitCount: owner.unitCount,
    cityCount: owner.cityCount,
    apparentStrength: owner.apparentStrength,
    nearestDistance: nearestOwnerDistance(owner),
  }));
  const nextSteps = strategyNextSteps({
    targetCandidates: targetCandidateSummaries,
    pointsOfInterest,
  });
  const front = strategyFrontView({
    origins:
      targetCandidates.origins.length > 0 ? targetCandidates.origins : battlefieldScan.origins,
    target,
    targetCandidates: targetCandidateSummaries,
    pointsOfInterest,
    destinationAnalysis,
    nextSteps,
  });

  return {
    playerId: targetCandidates.playerId,
    localPlayerId: targetCandidates.localPlayerId,
    origins:
      targetCandidates.origins.length > 0 ? targetCandidates.origins : battlefieldScan.origins,
    target,
    sourceStatus: {
      targetCandidates: "read",
      battlefieldScan: "read",
      destinationAnalysis: destinationAnalysis == null ? "skipped-no-target" : "read",
    },
    relationshipLabelPolicy: {
      relationshipSource: "not-classified",
      relationshipProof: "none",
      unprovenLabel: "relationship-unproven",
      guidance:
        "Front summary composes planning evidence only. Other-owner contact, proximity, ranking, and action legality do not prove official diplomatic status.",
    },
    summary: {
      targetCandidateCount: targetCandidateSummaries.length,
      pointOfInterestCount: pointsOfInterest.length,
      observedOwnerCount: observedOwners.length,
      nextStepCount: nextSteps.length,
    },
    front,
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
  owner: Civ7ControlOrpcBattlefieldScanResult["owners"][number]
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
  pointsOfInterest: readonly Civ7StrategyPointOfInterest[];
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
      label: "Use unit action validation before moving or targeting.",
    });
  }

  if (nextSteps.length === 0) {
    return [
      {
        kind: "observe",
        source: "strategy.frontSummary",
        label: "No front planning evidence found; refresh attention or narrow the scan origins.",
      },
    ];
  }

  return nextSteps;
}

function strategyFrontView({
  origins,
  target,
  targetCandidates,
  pointsOfInterest,
  destinationAnalysis,
  nextSteps,
}: Readonly<{
  origins: Civ7StrategyFrontSummaryResult["origins"];
  target: Civ7StrategyFrontSummaryResult["target"];
  targetCandidates: Civ7StrategyFrontSummaryResult["targetCandidates"];
  pointsOfInterest: readonly Civ7StrategyPointOfInterest[];
  destinationAnalysis: Civ7ControlOrpcDestinationAnalysisResult | null;
  nextSteps: Civ7StrategyFrontSummaryResult["nextSteps"];
}>): Civ7StrategyFrontSummaryResult["front"] {
  const pressure = [...pointsOfInterest]
    .map((point) => ({
      kind: point.kind,
      severity: point.severity,
      summary: point.summary,
      location: point.location,
      source: point.source,
    }))
    .sort((a, b) => severityRank(b.severity) - severityRank(a.severity));
  const highPressure = pressure.filter((item) => item.severity === "high");
  const risks = uniqueStrings([
    ...highPressure.map((item) => item.summary),
    ...destinationRisks(destinationAnalysis),
  ]).slice(0, 8);
  const origin = origins[0] ?? null;
  const candidate = targetCandidates[0];
  const targetLabel = target
    ? `target/front (${target.x},${target.y})`
    : "no target/front selected";
  const originLabel = origin ? `origin (${origin.x},${origin.y})` : "inferred runtime origins";
  const candidateLabel = candidate ? `owner ${candidate.owner}` : "no ranked target candidate";

  return {
    posture: postureFromPressure(pressure, destinationAnalysis),
    headline: `${originLabel} toward ${targetLabel}; leading candidate: ${candidateLabel}`,
    risks,
    nextInspections: nextSteps,
    pressure,
  };
}

function destinationRisks(
  destinationAnalysis: Civ7ControlOrpcDestinationAnalysisResult | null
): string[] {
  const pressure = asRecord(destinationAnalysis?.destinationPressure);
  const risks: string[] = [];
  const unitCount = Number(pressure?.unitCount ?? 0);
  const cityCount = Number(pressure?.cityCount ?? 0);
  const apparentOtherStrength = Number(pressure?.apparentOtherStrength ?? 0);
  if (unitCount > 0) {
    risks.push(`${unitCount} other-owner units near intended front`);
  }
  if (cityCount > 0) {
    risks.push(`${cityCount} relationship-unproven cities near intended front`);
  }
  if (apparentOtherStrength > 0) {
    risks.push(`apparent destination contact ${apparentOtherStrength}`);
  }
  return risks;
}

function postureFromPressure(
  pressure: ReadonlyArray<Civ7StrategyFrontSummaryResult["front"]["pressure"][number]>,
  destinationAnalysis: Civ7ControlOrpcDestinationAnalysisResult | null
): string {
  if (pressure.some((item) => item.kind === "civilian-risk" && item.severity === "high"))
    return "screen-civilians-before-advance";
  if (pressure.some((item) => item.kind === "nearby-other-owners" && item.severity === "high"))
    return "stabilize-front-before-committing-siege";
  const destinationPressure = asRecord(destinationAnalysis?.destinationPressure);
  if (
    Number(destinationPressure?.unitCount ?? 0) > 0 ||
    Number(destinationPressure?.cityCount ?? 0) > 0
  ) {
    return "stage-before-entering-target-contact";
  }
  return "inspect-and-advance-cautiously";
}

function severityRank(severity: string): number {
  if (severity === "high") return 3;
  if (severity === "medium") return 2;
  if (severity === "low") return 1;
  return 0;
}

function normalizeRelationshipSummary(summary: string): string {
  return summary
    .replace(/\bfriendly\b/gi, "own")
    .replace(/\bpressure\b/gi, "contact")
    .replace(/\bthreat\b/gi, "contact");
}

function firstCandidateCityLocation(
  candidates: ReadonlyArray<Civ7ControlOrpcTargetCandidatesResult["candidates"][number]>
): Civ7StrategyFrontSummaryResult["target"] {
  for (const candidate of candidates) {
    if (candidate.approach.targetLocation != null) {
      return candidate.approach.targetLocation;
    }
    const cityLocation = locationFromUnknown(candidate.nearestCity);
    if (cityLocation != null) return cityLocation;
  }
  return null;
}

function locationFromUnknown(value: unknown): Civ7StrategyFrontSummaryResult["target"] {
  const record = asRecord(value);
  const location = asRecord(record?.location);
  return typeof location?.x === "number" && typeof location.y === "number"
    ? { x: location.x, y: location.y }
    : null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function uniqueStrings(values: ReadonlyArray<string>): string[] {
  return [...new Set(values.filter((value) => value.length > 0))];
}
