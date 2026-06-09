import { Effect } from "effect";

import type {
  Civ7ControlOrpcBattlefieldScanResult,
  Civ7ControlOrpcDestinationAnalysisResult,
  Civ7ControlOrpcPlayNotificationViewResult,
  Civ7ControlOrpcReadyUnitViewResult,
  Civ7ControlOrpcSettlementRecommendationsResult,
} from "../../../dependencies/direct-control";
import { civ7ControlOrpcErrorCorrelationData } from "../../../model/correlation";
import type { Civ7ControlOrpcMapLocation } from "../../../model/primitives";
import { civ7ControlOrpcImplementer } from "../../../procedure";
import type {
  Civ7StrategyCivilianRouteTriageInput,
  Civ7StrategyCivilianRouteTriageResult,
} from "../contract";

type TriageStatus = Civ7StrategyCivilianRouteTriageResult["triage"]["status"];
type TriageNextStep =
  Civ7StrategyCivilianRouteTriageResult["nextSteps"][number];

export const strategyCivilianRouteTriageProcedure =
  civ7ControlOrpcImplementer.strategy.civilianRouteTriage.effect(function* ({
    context,
    errors,
    input,
  }) {
    return yield* Effect.tryPromise({
      try: async () => {
        const endpointDefaults = context.endpointDefaults;
        const notifications = await context.directControl.getCiv7PlayNotificationView({
          ...endpointDefaults,
          maxNotifications: 10,
        });
        const requestedOrigin = input.origin ?? null;
        const readyUnitId = probeValue(notifications.firstReadyUnitId);
        const readyUnit = requestedOrigin != null || readyUnitId == null
          ? null
          : await context.directControl.getCiv7ReadyUnitView({
            unitId: readyUnitId,
            radius: 2,
          }, endpointDefaults);
        const origin = requestedOrigin ?? readyUnitLocation(readyUnit);
        const origins = origin == null ? undefined : [origin];
        const settlement =
          await context.directControl.getCiv7SettlementRecommendations({
            playerId: input.playerId,
            locations: origins,
            count: input.settlementCount ?? 5,
            includeSettlers: origin == null,
            includeCities: false,
          }, endpointDefaults);
        const destination = input.destination ??
          firstSettlementSuggestion(settlement);
        const battlefield = await context.directControl.getCiv7BattlefieldScan({
          playerId: input.playerId,
          origins,
          radius: input.scanRadius ?? 6,
          maxUnits: input.maxUnits ?? 96,
          maxCities: input.maxCities ?? 40,
        }, endpointDefaults);
        const destinationAnalysis = origin != null && destination != null
          ? await context.directControl.getCiv7DestinationAnalysis({
            playerId: input.playerId,
            origin,
            destination,
            corridorRadius: input.corridorRadius ?? 2,
            destinationRadius: input.destinationRadius ?? 4,
            maxUnits: input.maxUnits ?? 96,
            maxCities: input.maxCities ?? 40,
          }, endpointDefaults)
          : null;

        return civilianRouteTriageResult({
          input,
          notifications,
          readyUnit,
          settlement,
          battlefield,
          destinationAnalysis,
          origin,
          destination,
        });
      },
      catch: () =>
        errors.STRATEGY_CIVILIAN_ROUTE_TRIAGE_UNAVAILABLE({
          data: {
            procedureKey: "strategy.civilianRouteTriage",
            source: "direct-control-facade",
            ...civ7ControlOrpcErrorCorrelationData(context),
          },
        }),
    });
  });

function civilianRouteTriageResult({
  input,
  notifications,
  readyUnit,
  settlement,
  battlefield,
  destinationAnalysis,
  origin,
  destination,
}: Readonly<{
  input: Civ7StrategyCivilianRouteTriageInput;
  notifications: Civ7ControlOrpcPlayNotificationViewResult;
  readyUnit: Civ7ControlOrpcReadyUnitViewResult | null;
  settlement: Civ7ControlOrpcSettlementRecommendationsResult;
  battlefield: Civ7ControlOrpcBattlefieldScanResult;
  destinationAnalysis: Civ7ControlOrpcDestinationAnalysisResult | null;
  origin: Civ7ControlOrpcMapLocation | null;
  destination: Civ7ControlOrpcMapLocation | null;
}>): Civ7StrategyCivilianRouteTriageResult {
  const reasons = triageReasons({ battlefield, destinationAnalysis });
  const status = triageStatus({ destination, reasons });
  const nextSteps = triageNextSteps({ origin, destination, status });
  const unit = readyUnit == null ? null : probeValue(readyUnit.unit);
  const firstSuggestion = firstSettlementSuggestion(settlement);

  return {
    playerId: settlement.playerId,
    localPlayerId: settlement.localPlayerId,
    origin,
    destination,
    sourceStatus: {
      notifications: "read",
      readyUnit: input.origin != null
        ? "skipped-explicit-origin"
        : readyUnit == null ? "skipped-no-ready-unit" : "read",
      settlementRecommendations: "read",
      battlefieldScan: "read",
      destinationAnalysis: destinationAnalysis == null
        ? "skipped-no-origin-or-destination"
        : "read",
    },
    relationshipLabelPolicy: {
      relationshipSource: "not-classified",
      relationshipProof: "none",
      unprovenLabel: "relationship-unproven",
      guidance: "Civilian route triage composes planning evidence only. Other-owner contact, proximity, ranking, and action legality do not prove official diplomatic status.",
    },
    readyUnit: readyUnit == null
      ? null
      : {
        unitId: readyUnit.unitId,
        typeName: stringValue(asRecord(unit)?.typeName),
        location: locationFromUnknown(asRecord(unit)?.location),
        legalOperationCount: readyUnit.legalOperations.length,
      },
    settlement: {
      originCount: settlement.origins.length,
      recommendationCount: settlement.recommendations.length,
      firstSuggestion,
    },
    battlefield: {
      pointOfInterestCount: battlefield.pointsOfInterest.length,
      observedOwnerCount: battlefield.owners.length,
      hiddenInfoPolicy: battlefield.hiddenInfoPolicy,
    },
    destinationAnalysis: destinationAnalysis == null
      ? null
      : {
        pointOfInterestCount: destinationAnalysis.pointsOfInterest.length,
        destinationUnitCount: numericValue(
          asRecord(destinationAnalysis.destinationPressure)?.unitCount,
        ) ?? 0,
        destinationCityCount: numericValue(
          asRecord(destinationAnalysis.destinationPressure)?.cityCount,
        ) ?? 0,
        apparentOtherStrength: numericValue(
          asRecord(destinationAnalysis.destinationPressure)
            ?.apparentOtherStrength,
        ) ?? 0,
      },
    triage: {
      status,
      summary: routeSummary(origin, destination),
      reasons,
      nextSteps,
    },
    notes: [
      "Read-only civilian route triage. It does not move, found, buy, or reserve routes.",
      "Settlement recommendations are site hints, not movement orders.",
      "Use validator-backed unit procedures before any concrete movement or target send.",
      "Relationship labels stay relationship-unproven unless official diplomatic evidence proves more.",
    ],
    nextSteps,
  };
}

function triageReasons({
  battlefield,
  destinationAnalysis,
}: Readonly<{
  battlefield: Civ7ControlOrpcBattlefieldScanResult;
  destinationAnalysis: Civ7ControlOrpcDestinationAnalysisResult | null;
}>): string[] {
  return uniqueStrings([
    ...battlefield.pointsOfInterest.map((point) =>
      `${point.severity} local ${point.kind}: ${normalizeRelationshipSummary(point.summary)}`
    ),
    ...(destinationAnalysis?.pointsOfInterest.map((point) =>
      `${point.severity} route ${point.kind}: ${normalizeRelationshipSummary(point.summary)}`
    ) ?? []),
    ...destinationPressureReasons(destinationAnalysis),
  ]).slice(0, 10);
}

function triageStatus({
  destination,
  reasons,
}: Readonly<{
  destination: Civ7ControlOrpcMapLocation | null;
  reasons: readonly string[];
}>): TriageStatus {
  const hasCivilianRisk = reasons.some((reason) =>
    reason.includes("civilian-risk")
  );
  const hasHighRouteRisk = reasons.some((reason) =>
    reason.includes("high route") || reason.includes("high local")
  );
  if (destination == null) return "inspect-candidate";
  if (hasCivilianRisk) return "hold-or-screen";
  if (hasHighRouteRisk) return "reroute-or-stage";
  return "proceed-with-validation";
}

function triageNextSteps({
  origin,
  destination,
  status,
}: Readonly<{
  origin: Civ7ControlOrpcMapLocation | null;
  destination: Civ7ControlOrpcMapLocation | null;
  status: TriageStatus;
}>): TriageNextStep[] {
  const nextSteps: TriageNextStep[] = [{
    kind: "read-priorities",
    source: "strategy.civilianRouteTriage",
    label: "Refresh current attention priorities before choosing a civilian action.",
    parameters: {},
  }];
  if (origin != null) {
    nextSteps.push({
      kind: "inspect-battlefield",
      source: "strategy.civilianRouteTriage",
      label: "Inspect battlefield evidence at the civilian origin.",
      parameters: { origin },
    }, {
      kind: "inspect-settlement",
      source: "strategy.civilianRouteTriage",
      label: "Inspect settlement recommendation evidence at the civilian origin.",
      parameters: { origin },
    });
  }
  if (origin != null && destination != null) {
    nextSteps.push({
      kind: "inspect-destination",
      source: "strategy.civilianRouteTriage",
      label: "Inspect route and destination evidence before moving.",
      parameters: { origin, destination },
    });
  }
  if (status === "hold-or-screen" || status === "reroute-or-stage") {
    nextSteps.push({
      kind: "inspect-front",
      source: "strategy.civilianRouteTriage",
      label: "Inspect the surrounding front before committing the civilian.",
      parameters: { origin: origin ?? undefined, destination: destination ?? undefined },
    });
  }
  nextSteps.push({
    kind: "inspect-ready-unit",
    source: "strategy.civilianRouteTriage",
    label: "Re-read the ready unit before validating a route action.",
    parameters: {},
  }, {
    kind: "validate-unit-action",
    source: "strategy.civilianRouteTriage",
    label: "Use unit action validation before any movement or target send.",
    parameters: { destination: destination ?? undefined },
  });
  return nextSteps;
}

function destinationPressureReasons(
  destinationAnalysis: Civ7ControlOrpcDestinationAnalysisResult | null,
): string[] {
  const pressure = asRecord(destinationAnalysis?.destinationPressure);
  const reasons: string[] = [];
  const unitCount = numericValue(pressure?.unitCount) ?? 0;
  const cityCount = numericValue(pressure?.cityCount) ?? 0;
  const apparentOtherStrength = numericValue(pressure?.apparentOtherStrength)
    ?? 0;
  if (unitCount > 0) {
    reasons.push(`${unitCount} other-owner units near candidate destination`);
  }
  if (cityCount > 0) {
    reasons.push(`${cityCount} relationship-unproven cities near candidate destination`);
  }
  if (apparentOtherStrength > 0) {
    reasons.push(`apparent candidate contact ${apparentOtherStrength}`);
  }
  return reasons;
}

function firstSettlementSuggestion(
  settlement: Civ7ControlOrpcSettlementRecommendationsResult,
): Civ7ControlOrpcMapLocation | null {
  for (const recommendation of settlement.recommendations) {
    const suggestions = probeValue(recommendation.suggestions);
    if (!Array.isArray(suggestions)) continue;
    for (const suggestion of suggestions) {
      const location = locationFromUnknown(asRecord(suggestion)?.location);
      if (location != null) return location;
    }
  }
  return null;
}

function readyUnitLocation(
  readyUnit: Civ7ControlOrpcReadyUnitViewResult | null,
): Civ7ControlOrpcMapLocation | null {
  const unit = readyUnit == null ? null : probeValue(readyUnit.unit);
  return locationFromUnknown(asRecord(unit)?.location);
}

function routeSummary(
  origin: Civ7ControlOrpcMapLocation | null,
  destination: Civ7ControlOrpcMapLocation | null,
): string {
  const originLabel = origin == null
    ? "<unknown origin>"
    : `(${origin.x},${origin.y})`;
  const destinationLabel = destination == null
    ? "<no candidate destination>"
    : `(${destination.x},${destination.y})`;
  return `civilian route ${originLabel} -> ${destinationLabel}`;
}

function normalizeRelationshipSummary(summary: string): string {
  return summary
    .replace(/\bfriendly\b/gi, "own")
    .replace(/\bpressure\b/gi, "contact")
    .replace(/\bthreat\b/gi, "contact");
}

function locationFromUnknown(value: unknown): Civ7ControlOrpcMapLocation | null {
  const record = asRecord(value);
  return typeof record?.x === "number" && typeof record.y === "number"
    ? { x: record.x, y: record.y }
    : null;
}

function probeValue<T>(
  probe: { ok: true; value: T } | { ok: false; error: string } | null | undefined,
): T | null {
  return probe?.ok === true ? probe.value : null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object"
    ? value as Record<string, unknown>
    : null;
}

function numericValue(value: unknown): number | null {
  return typeof value === "number" ? value : null;
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function uniqueStrings(values: ReadonlyArray<string>): string[] {
  return [...new Set(values.filter((value) => value.length > 0))];
}
