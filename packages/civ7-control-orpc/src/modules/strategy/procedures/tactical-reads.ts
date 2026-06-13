import { Effect } from "effect";

import type {
  Civ7ControlOrpcBattlefieldScanResult,
  Civ7ControlOrpcDestinationAnalysisResult,
  Civ7ControlOrpcTargetCandidatesResult,
} from "../../../dependencies/direct-control";
import {
  civ7ControlOrpcErrorCorrelationData,
  civ7ControlOrpcFailureDetail,
} from "../../../model/correlation";
import { civ7ControlOrpcImplementer } from "../../../procedure";
import type {
  Civ7StrategyBattlefieldScanResult,
  Civ7StrategyDestinationAnalysisResult,
  Civ7StrategyTargetCandidatesResult,
} from "../contract";

type MapLocation = Readonly<{ x: number; y: number }>;

export const strategyBattlefieldScanProcedure =
  civ7ControlOrpcImplementer.strategy.battlefieldScan.effect(function* ({
    context,
    errors,
    input,
  }) {
    return yield* Effect.tryPromise({
      try: async () => {
        const result = await context.directControl.getCiv7BattlefieldScan(
          input,
          context.endpointDefaults
        );
        return battlefieldScanResult(result);
      },
      catch: (cause) =>
        errors.STRATEGY_TACTICAL_READ_UNAVAILABLE({
          data: {
            detail: civ7ControlOrpcFailureDetail(cause),
            procedureKey: "strategy.battlefieldScan",
            source: "direct-control-facade",
            ...civ7ControlOrpcErrorCorrelationData(context),
          },
        }),
    });
  });

export const strategyTargetCandidatesProcedure =
  civ7ControlOrpcImplementer.strategy.targetCandidates.effect(function* ({
    context,
    errors,
    input,
  }) {
    return yield* Effect.tryPromise({
      try: async () => {
        const result = await context.directControl.getCiv7TargetCandidates(
          input,
          context.endpointDefaults
        );
        return targetCandidatesResult(result);
      },
      catch: (cause) =>
        errors.STRATEGY_TACTICAL_READ_UNAVAILABLE({
          data: {
            detail: civ7ControlOrpcFailureDetail(cause),
            procedureKey: "strategy.targetCandidates",
            source: "direct-control-facade",
            ...civ7ControlOrpcErrorCorrelationData(context),
          },
        }),
    });
  });

export const strategyDestinationAnalysisProcedure =
  civ7ControlOrpcImplementer.strategy.destinationAnalysis.effect(function* ({
    context,
    errors,
    input,
  }) {
    return yield* Effect.tryPromise({
      try: async () => {
        const result = await context.directControl.getCiv7DestinationAnalysis(
          input,
          context.endpointDefaults
        );
        return destinationAnalysisResult(result);
      },
      catch: (cause) =>
        errors.STRATEGY_TACTICAL_READ_UNAVAILABLE({
          data: {
            detail: civ7ControlOrpcFailureDetail(cause),
            procedureKey: "strategy.destinationAnalysis",
            source: "direct-control-facade",
            ...civ7ControlOrpcErrorCorrelationData(context),
          },
        }),
    });
  });

function battlefieldScanResult(
  result: Civ7ControlOrpcBattlefieldScanResult
): Civ7StrategyBattlefieldScanResult {
  const owners = asArray(result.owners).map((owner) => {
    const record = asRecord(owner);
    const relationshipProof =
      record?.relationshipProof === "self" ? ("self" as const) : ("none" as const);
    return {
      owner: numberFromUnknown(record?.owner),
      relationship:
        relationshipProof === "self" ? ("self" as const) : ("relationship-unproven" as const),
      relationshipProof,
      unitCount: numberFromUnknown(record?.unitCount),
      cityCount: numberFromUnknown(record?.cityCount),
      apparentStrength: numberFromUnknown(record?.apparentStrength),
      nearestDistance: nearestOwnerDistance(record),
      roles: integerRecord(record?.roles),
    };
  });
  const pointsOfInterest = asArray(result.pointsOfInterest).map((point) => {
    const record = asRecord(point);
    return {
      kind: String(record?.kind ?? "unknown"),
      severity: String(record?.severity ?? "unknown"),
      location: locationFromUnknown(record?.location),
      summary: normalizeRelationshipSummary(String(record?.summary ?? "")),
    };
  });
  const nextSteps = battlefieldNextSteps({
    origins: result.origins,
    pointsOfInterest,
  });
  return {
    playerId: result.playerId,
    localPlayerId: result.localPlayerId,
    origins: result.origins,
    radius: result.radius,
    hiddenInfoPolicy: result.hiddenInfoPolicy,
    relationshipLabelPolicy: {
      relationshipSource: "not-classified",
      relationshipProof: "none",
      unprovenLabel: "relationship-unproven",
      guidance:
        "Battlefield scan is planning evidence only. Owner contact, proximity, role heuristics, and apparent strength do not prove official diplomatic status.",
    },
    summary: {
      unitCount: asArray(result.units).length,
      cityCount: asArray(result.cities).length,
      observedOwnerCount: owners.length,
      pointOfInterestCount: pointsOfInterest.length,
      apparentStrengthTotal: owners.reduce((total, owner) => total + owner.apparentStrength, 0),
      nextStepCount: nextSteps.length,
    },
    owners,
    pointsOfInterest,
    omitted: [
      {
        path: "directControl.host",
        reason: "endpoint context is not normal service output",
      },
      {
        path: "directControl.state",
        reason: "runtime state selection is context/debug owned",
      },
      {
        path: "units",
        reason: "raw unit samples stay behind bounded owner and point summaries",
      },
      {
        path: "cities",
        reason: "raw city samples stay behind bounded owner and point summaries",
      },
      {
        path: "point.units",
        reason: "raw point unit samples stay behind bounded point summaries",
      },
      {
        path: "point.cities",
        reason: "raw point city samples stay behind bounded point summaries",
      },
    ],
    notes: [
      ...result.notes.map(normalizeRelationshipSummary),
      "Use visibility reads and validator-backed unit action procedures before any mutation.",
    ],
    nextSteps,
  };
}

function targetCandidatesResult(
  result: Civ7ControlOrpcTargetCandidatesResult
): Civ7StrategyTargetCandidatesResult {
  const candidates = result.candidates.map((candidate) => {
    const targetLocation = locationFromUnknown(candidate.approach.targetLocation);
    return {
      owner: candidate.owner,
      relationship: "relationship-unproven" as const,
      relationshipProof: "none" as const,
      leaderName: probeValue(candidate.leaderName, "string"),
      civilizationName: probeValue(candidate.civilizationName, "string"),
      isHuman: probeValue(candidate.isHuman, "boolean"),
      cityCount: candidate.cityCount,
      unitCount: candidate.unitCount,
      nearestDistance: candidate.nearestDistance,
      nearbyUnitCount: candidate.nearbyUnitCount,
      apparentStrength: candidate.apparentStrength,
      nearestCityLocation: locationFromUnknown(candidate.nearestCity),
      approach: {
        nearestOrigin: locationFromUnknown(candidate.approach.nearestOrigin),
        targetLocation,
        directGridDistance: candidate.approach.directGridDistance,
        routeHint: candidate.approach.routeHint,
        routeKind: candidate.approach.routeKind,
        waterSampleCount: Math.max(0, Math.trunc(candidate.approach.waterSampleCount)),
        landSampleCount: Math.max(0, Math.trunc(candidate.approach.landSampleCount)),
        notes: [...candidate.approach.notes],
      },
      reasons: [...candidate.reasons],
    };
  });
  const nextSteps = targetCandidateNextSteps(candidates);
  return {
    playerId: result.playerId,
    localPlayerId: result.localPlayerId,
    origins: result.origins,
    unitRadius: result.unitRadius,
    hiddenInfoPolicy: result.hiddenInfoPolicy,
    relationshipLabelPolicy: {
      relationshipSource: "not-classified",
      relationshipProof: "none",
      unprovenLabel: "relationship-unproven",
      guidance:
        "Target candidates are planning evidence only. Other-owner contact, route ranking, proximity, and apparent strength do not prove official diplomatic status.",
    },
    summary: {
      candidateCount: candidates.length,
      nearestDistance: nearestDistance(candidates),
      observedOwnerCount: new Set(candidates.map((candidate) => candidate.owner)).size,
      apparentStrengthTotal: candidates.reduce(
        (total, candidate) => total + candidate.apparentStrength,
        0
      ),
      nextStepCount: nextSteps.length,
    },
    candidates,
    omitted: [
      {
        path: "directControl.host",
        reason: "endpoint context is not normal service output",
      },
      {
        path: "directControl.state",
        reason: "runtime state selection is context/debug owned",
      },
      {
        path: "candidate.cities",
        reason: "raw city samples stay behind bounded candidate summaries",
      },
      {
        path: "candidate.nearbyUnits",
        reason: "raw unit samples stay behind bounded candidate summaries",
      },
    ],
    notes: [
      ...result.notes.map(normalizeRelationshipSummary),
      "Use visibility reads and validator-backed unit action procedures before any mutation.",
    ],
    nextSteps,
  };
}

function destinationAnalysisResult(
  result: Civ7ControlOrpcDestinationAnalysisResult
): Civ7StrategyDestinationAnalysisResult {
  const corridor = asRecord(result.corridor);
  const destinationPressure = asRecord(result.destinationPressure);
  const pointsOfInterest = asArray(result.pointsOfInterest).map((point) => {
    const record = asRecord(point);
    return {
      kind: String(record?.kind ?? "unknown"),
      severity: String(record?.severity ?? "unknown"),
      location: locationFromUnknown(record?.location),
      summary: normalizeRelationshipSummary(String(record?.summary ?? "")),
    };
  });
  const nextSteps = destinationNextSteps({
    origin: result.origin,
    destination: result.destination,
    pointsOfInterest,
  });
  const corridorUnitCount = numberFromUnknown(corridor?.unitCount);
  const destinationUnitCount = numberFromUnknown(destinationPressure?.unitCount);
  const destinationCityCount = numberFromUnknown(destinationPressure?.cityCount);
  const apparentOtherStrength = numberFromUnknown(destinationPressure?.apparentOtherStrength);
  return {
    playerId: result.playerId,
    localPlayerId: result.localPlayerId,
    origin: result.origin,
    destination: result.destination,
    corridorRadius: result.corridorRadius,
    destinationRadius: result.destinationRadius,
    hiddenInfoPolicy: result.hiddenInfoPolicy,
    relationshipLabelPolicy: {
      relationshipSource: "not-classified",
      relationshipProof: "none",
      unprovenLabel: "relationship-unproven",
      guidance:
        "Destination analysis is planning evidence only. Other-owner contact, destination proximity, and apparent strength do not prove official diplomatic status.",
    },
    summary: {
      pointOfInterestCount: pointsOfInterest.length,
      corridorUnitCount,
      destinationUnitCount,
      destinationCityCount,
      apparentOtherStrength,
      nextStepCount: nextSteps.length,
    },
    corridor: {
      routeHint: String(corridor?.routeHint ?? "unknown"),
      directGridDistance: nullableNumber(corridor?.directGridDistance),
      sampleCount: numberFromUnknown(corridor?.sampleCount),
      unitCount: corridorUnitCount,
    },
    destinationPressure: {
      unitCount: destinationUnitCount,
      cityCount: destinationCityCount,
      apparentOtherStrength,
    },
    pointsOfInterest,
    omitted: [
      {
        path: "directControl.host",
        reason: "endpoint context is not normal service output",
      },
      {
        path: "directControl.state",
        reason: "runtime state selection is context/debug owned",
      },
      {
        path: "corridor.sampledPlots",
        reason: "raw plot samples stay behind bounded corridor summaries",
      },
      {
        path: "destinationPressure.units",
        reason: "raw unit samples stay behind bounded pressure summaries",
      },
      {
        path: "destinationPressure.cities",
        reason: "raw city samples stay behind bounded pressure summaries",
      },
    ],
    notes: [
      ...result.notes.map(normalizeRelationshipSummary),
      "Use visibility reads and validator-backed unit action procedures before any mutation.",
    ],
    nextSteps,
  };
}

function battlefieldNextSteps(
  input: Readonly<{
    origins: ReadonlyArray<MapLocation>;
    pointsOfInterest: Civ7StrategyBattlefieldScanResult["pointsOfInterest"];
  }>
): Civ7StrategyBattlefieldScanResult["nextSteps"] {
  const point = input.pointsOfInterest[0];
  const origin = input.origins[0];
  if (point == null) {
    return [
      {
        kind: "observe",
        source: "strategy.battlefieldScan",
        label: "No battlefield points found; refresh attention or narrow scan origins.",
        parameters: origin ? { origin } : {},
      },
    ];
  }
  return [
    {
      kind: "inspect-battlefield-point",
      source: "strategy.battlefieldScan",
      label: `Inspect ${point.kind} battlefield point before choosing a unit action.`,
      parameters: {
        ...(origin ? { origin } : {}),
        ...(point.location ? { location: point.location } : {}),
      },
    },
    {
      kind: "read-visibility",
      source: "strategy.battlefieldScan",
      label: "Read visibility/map evidence before promoting battlefield contact into an action.",
      parameters: point.location ? { location: point.location } : {},
    },
    {
      kind: "validate-unit-action",
      source: "strategy.battlefieldScan",
      label: "Use unit action validation before moving or targeting.",
      parameters: point.location ? { location: point.location } : {},
    },
  ];
}

function targetCandidateNextSteps(
  candidates: Civ7StrategyTargetCandidatesResult["candidates"]
): Civ7StrategyTargetCandidatesResult["nextSteps"] {
  const candidate = candidates[0];
  if (candidate == null) {
    return [
      {
        kind: "observe",
        source: "strategy.targetCandidates",
        label: "No target candidates found; refresh strategy evidence or narrow origins.",
        parameters: {},
      },
    ];
  }
  return [
    {
      kind: "inspect-candidate",
      source: "strategy.targetCandidates",
      label: `Inspect owner ${candidate.owner} candidate with visibility reads before treating it as actionable.`,
      parameters: {
        owner: candidate.owner,
        ...(candidate.approach.targetLocation ? { target: candidate.approach.targetLocation } : {}),
      },
    },
    {
      kind: "read-visibility",
      source: "strategy.targetCandidates",
      label: "Read visibility/map evidence before promoting candidate ranking into an action.",
      parameters: candidate.approach.targetLocation
        ? { target: candidate.approach.targetLocation }
        : {},
    },
    {
      kind: "validate-unit-action",
      source: "strategy.targetCandidates",
      label: "Use unit action validation before moving or targeting.",
      parameters: candidate.approach.targetLocation
        ? { target: candidate.approach.targetLocation }
        : {},
    },
  ];
}

function destinationNextSteps(
  input: Readonly<{
    origin: MapLocation | null;
    destination: MapLocation;
    pointsOfInterest: Civ7StrategyDestinationAnalysisResult["pointsOfInterest"];
  }>
): Civ7StrategyDestinationAnalysisResult["nextSteps"] {
  if (input.pointsOfInterest.length === 0) {
    return [
      {
        kind: "observe",
        source: "strategy.destinationAnalysis",
        label: "No destination pressure found; refresh map/visibility evidence before acting.",
        parameters: { origin: input.origin ?? undefined, destination: input.destination },
      },
    ];
  }
  return [
    {
      kind: "inspect-destination",
      source: "strategy.destinationAnalysis",
      label: "Inspect destination contact and visibility before choosing a unit action.",
      parameters: { origin: input.origin ?? undefined, destination: input.destination },
    },
    {
      kind: "read-visibility",
      source: "strategy.destinationAnalysis",
      label: "Read visibility/map evidence before promoting destination pressure into an action.",
      parameters: { destination: input.destination },
    },
    {
      kind: "validate-unit-action",
      source: "strategy.destinationAnalysis",
      label: "Use unit action validation before moving or targeting.",
      parameters: { origin: input.origin ?? undefined, destination: input.destination },
    },
  ];
}

function nearestDistance(
  candidates: Civ7StrategyTargetCandidatesResult["candidates"]
): number | null {
  const distances = candidates
    .map((candidate) => candidate.nearestDistance)
    .filter((value): value is number => value != null);
  if (distances.length === 0) return null;
  return Math.min(...distances);
}

function probeValue<T extends "string" | "boolean">(
  probe: unknown,
  type: T
): T extends "string" ? string | null : boolean | null {
  const record = asRecord(probe);
  if (record?.ok !== true || typeof record.value !== type) return null as never;
  return record.value as never;
}

function nearestOwnerDistance(owner: Record<string, unknown> | null): number | null {
  const distances = [
    distanceFromUnknown(owner?.nearestUnit),
    distanceFromUnknown(owner?.nearestCity),
  ].filter((distance): distance is number => distance != null);
  if (distances.length === 0) return null;
  return Math.min(...distances);
}

function distanceFromUnknown(value: unknown): number | null {
  const record = asRecord(value);
  return nullableNumber(record?.distance);
}

function integerRecord(value: unknown): Record<string, number> {
  const record = asRecord(value);
  if (record == null) return {};
  const out: Record<string, number> = {};
  for (const [key, candidate] of Object.entries(record)) {
    const value = numberFromUnknown(candidate);
    if (value > 0) out[key] = Math.trunc(value);
  }
  return out;
}

function locationFromUnknown(value: unknown): MapLocation | null {
  const direct = asRecord(value);
  if (typeof direct?.x === "number" && typeof direct.y === "number") {
    return { x: direct.x, y: direct.y };
  }
  const nested = asRecord(direct?.location);
  if (typeof nested?.x === "number" && typeof nested.y === "number") {
    return { x: nested.x, y: nested.y };
  }
  return null;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function numberFromUnknown(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function nullableNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizeRelationshipSummary(summary: string): string {
  return summary
    .replace(/\bfriendly\b/gi, "own")
    .replace(/\bpressure\b/gi, "contact")
    .replace(/\bthreat\b/gi, "contact")
    .replace(/\benemy\b/gi, "other-owner")
    .replace(/\bhostile\b/gi, "other-owner")
    .replace(/\bopponent\b/gi, "other-owner");
}
