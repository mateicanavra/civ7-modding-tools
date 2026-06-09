import { Effect } from "effect";

import type {
  Civ7ControlOrpcBattlefieldScanResult,
  Civ7ControlOrpcPlayNotificationViewResult,
  Civ7ControlOrpcReadyUnitViewResult,
} from "../../../dependencies/direct-control";
import { civ7ControlOrpcErrorCorrelationData } from "../../../model/correlation";
import type {
  Civ7ControlOrpcComponentId,
  Civ7ControlOrpcMapLocation,
} from "../../../model/primitives";
import { civ7ControlOrpcImplementer } from "../../../procedure";
import type {
  Civ7StrategyFormationSnapshotInput,
  Civ7StrategyFormationSnapshotResult,
} from "../contract";

type FormationPosture =
  Civ7StrategyFormationSnapshotResult["formation"]["posture"];
type FormationUnit =
  Civ7StrategyFormationSnapshotResult["formation"]["civilians"][number];
type FormationNextStep =
  Civ7StrategyFormationSnapshotResult["nextSteps"][number];

export const strategyFormationSnapshotProcedure =
  civ7ControlOrpcImplementer.strategy.formationSnapshot.effect(function* ({
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
        const readyUnitId = probeValue(notifications.firstReadyUnitId);
        const requestedOrigin = input.origin ?? null;
        const readyUnit = requestedOrigin != null || readyUnitId == null
          ? null
          : await context.directControl.getCiv7ReadyUnitView({
            unitId: readyUnitId,
            radius: 2,
          }, endpointDefaults);
        const origin = requestedOrigin ?? readyUnitLocation(readyUnit);
        const battlefield = await context.directControl.getCiv7BattlefieldScan({
          playerId: input.playerId,
          origins: origin == null ? undefined : [origin],
          radius: input.radius ?? 6,
          maxUnits: input.maxUnits ?? 96,
          maxCities: input.maxCities ?? 40,
        }, endpointDefaults);

        return formationSnapshotResult({
          input,
          notifications,
          readyUnit,
          battlefield,
          origin,
        });
      },
      catch: () =>
        errors.STRATEGY_FORMATION_SNAPSHOT_UNAVAILABLE({
          data: {
            procedureKey: "strategy.formationSnapshot",
            source: "direct-control-facade",
            ...civ7ControlOrpcErrorCorrelationData(context),
          },
        }),
    });
  });

function formationSnapshotResult({
  input,
  notifications,
  readyUnit,
  battlefield,
  origin,
}: Readonly<{
  input: Civ7StrategyFormationSnapshotInput;
  notifications: Civ7ControlOrpcPlayNotificationViewResult;
  readyUnit: Civ7ControlOrpcReadyUnitViewResult | null;
  battlefield: Civ7ControlOrpcBattlefieldScanResult;
  origin: Civ7ControlOrpcMapLocation | null;
}>): Civ7StrategyFormationSnapshotResult {
  const units = asRecords(battlefield.units).map(toFormationUnit);
  const civilians = units.filter((unit) =>
    unit.stance === "own" && unit.role === "civilian"
  );
  const ownUnits = units.filter((unit) =>
    unit.stance === "own" && unit.role !== "civilian"
  );
  const otherOwnerContacts = units.filter((unit) =>
    unit.stance !== "own"
  );
  const screens = ownUnits.filter((unit) =>
    civilians.some((civilian) =>
      civilian.location != null && unit.location != null &&
      gridDistance(civilian.location, unit.location) <=
        (input.screenRadius ?? 2)
    )
  );
  const nearbyContacts = otherOwnerContacts.filter((unit) =>
    civilians.some((civilian) =>
      civilian.location != null && unit.location != null &&
      gridDistance(civilian.location, unit.location) <=
        (input.contactRadius ?? 4)
    )
  );
  const poiReasons = pointReasons(battlefield.pointsOfInterest);
  const posture = postureFor({
    civilians,
    screens,
    nearbyContacts,
    poiReasons,
    readyUnit,
  });
  const nextSteps = formationNextSteps({
    origin,
    civilians,
    nearbyContacts,
    posture,
  });
  const readyUnitValue = readyUnit == null
    ? null
    : probeValue(readyUnit.unit);

  return {
    playerId: battlefield.playerId,
    localPlayerId: battlefield.localPlayerId,
    turn: probeValue(notifications.turn),
    turnDate: probeValue(notifications.turnDate),
    blocker: numericValue(probeValue(notifications.blocker)),
    nextDecision: stringValue(asRecord(notifications.hud)?.nextDecision),
    origin,
    sourceStatus: {
      notifications: "read",
      readyUnit: input.origin != null
        ? "skipped-explicit-origin"
        : readyUnit == null ? "skipped-no-ready-unit" : "read",
      battlefieldScan: "read",
    },
    readyUnit: readyUnit == null
      ? null
      : {
        unitId: readyUnit.unitId,
        typeName: stringValue(asRecord(readyUnitValue)?.typeName),
        location: locationFromUnknown(asRecord(readyUnitValue)?.location),
        legalNoTargetOperationCount: readyUnit.legalOperations.length,
      },
    battlefield: {
      originCount: battlefield.origins.length,
      unitCount: units.length,
      pointOfInterestCount: battlefield.pointsOfInterest.length,
      hiddenInfoPolicy: battlefield.hiddenInfoPolicy,
    },
    formation: {
      posture,
      relationshipLabelPolicy: {
        relationshipSource: "not-classified",
        relationshipProof: "none",
        unprovenLabel: "relationship-unproven",
        guidance: "Formation snapshot treats owner mismatch and proximity as contact evidence only. Official diplomatic or team evidence is required for stronger labels.",
      },
      headline: formationHeadline({
        origin,
        readyUnit,
        civilians,
        screens,
        nearbyContacts,
      }),
      reasons: uniqueStrings([
        ...poiReasons,
        ...civilianContactReasons(civilians, nearbyContacts),
        ...screenReasons(civilians, screens),
      ]).slice(0, 10),
      civilians,
      screens,
      otherOwnerContacts,
      nearbyContacts,
      nextSteps,
    },
    notes: [
      "Read-only formation snapshot. It does not move, attack, found, or reserve routes.",
      "Use this lens to decide what to inspect next, then validate concrete plot actions with unit procedures.",
      "Battlefield scan distances are cheap grid heuristics and may include debug-visible entities unless paired with visibility reads.",
      "Relationship labels stay relationship-unproven unless official diplomatic evidence proves more.",
    ],
    nextSteps,
  };
}

function postureFor(input: Readonly<{
  civilians: readonly FormationUnit[];
  screens: readonly FormationUnit[];
  nearbyContacts: readonly FormationUnit[];
  poiReasons: readonly string[];
  readyUnit: Civ7ControlOrpcReadyUnitViewResult | null;
}>): FormationPosture {
  if (input.readyUnit == null) return "inspect-ready-unit";
  if (input.civilians.length > 0 && input.nearbyContacts.length > 0) {
    return "screen-civilian";
  }
  if (input.civilians.length > 0 && input.screens.length === 0) {
    return "hold-ready-unit";
  }
  if (
    input.poiReasons.some((reason) =>
      reason.includes("nearby-other-owners") ||
      reason.includes("owner-contact")
    )
  ) {
    return "stabilize-front";
  }
  return "advance-with-validation";
}

function formationNextSteps({
  origin,
  civilians,
  nearbyContacts,
  posture,
}: Readonly<{
  origin: Civ7ControlOrpcMapLocation | null;
  civilians: readonly FormationUnit[];
  nearbyContacts: readonly FormationUnit[];
  posture: FormationPosture;
}>): FormationNextStep[] {
  const nextSteps: FormationNextStep[] = [{
    kind: "read-priorities",
    source: "strategy.formationSnapshot",
    label: "Refresh current attention priorities before choosing a formation action.",
    parameters: {},
  }, {
    kind: "inspect-ready-unit",
    source: "strategy.formationSnapshot",
    label: "Re-read the ready unit before validating a concrete action.",
    parameters: {},
  }];
  if (origin != null) {
    nextSteps.push({
      kind: "inspect-battlefield",
      source: "strategy.formationSnapshot",
      label: "Inspect bounded battlefield evidence around the formation origin.",
      parameters: { origin },
    });
  }
  const civilian = civilians.find((unit) => unit.location != null);
  if (civilian?.location != null) {
    nextSteps.push({
      kind: "inspect-civilian-route",
      source: "strategy.formationSnapshot",
      label: "Inspect route options for the civilian before moving.",
      parameters: { civilian: civilian.location },
    });
  }
  const contact = nearbyContacts.find((unit) => unit.location != null);
  if (contact?.location != null) {
    nextSteps.push({
      kind: "inspect-battlefield",
      source: "strategy.formationSnapshot",
      label: "Inspect battlefield evidence around nearby other-owner contact.",
      parameters: { contact: contact.location },
    });
  }
  nextSteps.push({
    kind: "validate-unit-action",
    source: "strategy.formationSnapshot",
    label: posture === "screen-civilian" || posture === "stabilize-front"
      ? "Validate a screen or contact unit action."
      : "Validate a concrete unit action.",
    parameters: {},
  });
  return uniqueNextSteps(nextSteps);
}

function toFormationUnit(unit: Record<string, unknown>): FormationUnit {
  return {
    id: componentIdFromUnknown(unit.id),
    owner: numericValue(unit.owner),
    stance: formationStance(unit.stance),
    role: typeof unit.role === "string" ? unit.role : "unknown",
    typeName: stringValue(unit.typeName),
    location: locationFromUnknown(unit.location),
    distance: numericValue(unit.distance),
  };
}

function formationHeadline({
  origin,
  readyUnit,
  civilians,
  screens,
  nearbyContacts,
}: Readonly<{
  origin: Civ7ControlOrpcMapLocation | null;
  readyUnit: Civ7ControlOrpcReadyUnitViewResult | null;
  civilians: readonly FormationUnit[];
  screens: readonly FormationUnit[];
  nearbyContacts: readonly FormationUnit[];
}>): string {
  const originLabel = origin == null
    ? "<unknown origin>"
    : `(${origin.x},${origin.y})`;
  return `${readyUnitSummary(readyUnit)} formation at ${originLabel}: ${civilians.length} civilians, ${screens.length} local screens, ${nearbyContacts.length} nearby other-owner contacts`;
}

function readyUnitSummary(
  readyUnit: Civ7ControlOrpcReadyUnitViewResult | null,
): string {
  const unit = readyUnit == null ? null : probeValue(readyUnit.unit);
  return stringValue(asRecord(unit)?.typeName) ?? "ready unit";
}

function pointReasons(value: unknown): string[] {
  return asRecords(value).map((point) => {
    const severity = String(point.severity ?? "medium");
    const kind = String(point.kind ?? "point-of-interest");
    const summary = String(point.summary ?? kind);
    return normalizeRelationshipSummary(`${severity} ${kind}: ${summary}`);
  });
}

function civilianContactReasons(
  civilians: readonly FormationUnit[],
  nearbyContacts: readonly FormationUnit[],
): string[] {
  if (civilians.length === 0 || nearbyContacts.length === 0) return [];
  return civilians.map((civilian) => {
    const location = civilian.location == null
      ? "<unknown>"
      : `(${civilian.location.x},${civilian.location.y})`;
    return `${civilian.typeName ?? "civilian"} at ${location} has ${nearbyContacts.length} other-owner units within contact radius`;
  });
}

function screenReasons(
  civilians: readonly FormationUnit[],
  screens: readonly FormationUnit[],
): string[] {
  if (civilians.length === 0) return [];
  if (screens.length === 0) {
    return ["no own screen units are within local screen radius of the civilian"];
  }
  return [`${screens.length} own screen units are within local screen radius of the civilian`];
}

function readyUnitLocation(
  readyUnit: Civ7ControlOrpcReadyUnitViewResult | null,
): Civ7ControlOrpcMapLocation | null {
  const unit = readyUnit == null ? null : probeValue(readyUnit.unit);
  return locationFromUnknown(asRecord(unit)?.location);
}

function componentIdFromUnknown(
  value: unknown,
): Civ7ControlOrpcComponentId | null {
  const record = asRecord(value);
  return typeof record?.owner === "number" &&
      typeof record.id === "number" &&
      typeof record.type === "number"
    ? { owner: record.owner, id: record.id, type: record.type }
    : null;
}

function locationFromUnknown(value: unknown): Civ7ControlOrpcMapLocation | null {
  const record = asRecord(value);
  return typeof record?.x === "number" && typeof record.y === "number"
    ? { x: record.x, y: record.y }
    : null;
}

function gridDistance(
  left: Civ7ControlOrpcMapLocation,
  right: Civ7ControlOrpcMapLocation,
): number {
  return Math.max(Math.abs(left.x - right.x), Math.abs(left.y - right.y));
}

function probeValue<T>(
  probe: { ok: true; value: T } | { ok: false; error: string } | null | undefined,
): T | null {
  return probe?.ok === true ? probe.value : null;
}

function asRecords(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value)
    ? value.filter((item): item is Record<string, unknown> =>
      item !== null && typeof item === "object"
    )
    : [];
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

function normalizeRelationshipSummary(summary: string): string {
  return summary
    .replace(/\bfriendly\b/gi, "own")
    .replace(/\bpressure\b/gi, "contact")
    .replace(/\bthreat\b/gi, "contact");
}

function formationStance(value: unknown): string {
  if (value === "friendly") return "own";
  return typeof value === "string" ? value : "unknown";
}

function uniqueStrings(values: readonly string[]): string[] {
  return [...new Set(values.filter((value) => value.length > 0))];
}

function uniqueNextSteps(
  values: readonly FormationNextStep[],
): FormationNextStep[] {
  const seen = new Set<string>();
  const nextSteps: FormationNextStep[] = [];
  for (const value of values) {
    const key = JSON.stringify([value.kind, value.parameters]);
    if (seen.has(key)) continue;
    seen.add(key);
    nextSteps.push(value);
  }
  return nextSteps;
}
