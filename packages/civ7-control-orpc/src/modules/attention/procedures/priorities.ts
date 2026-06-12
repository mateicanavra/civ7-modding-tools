import type {
  Civ7ComponentId,
  Civ7ReadyCityViewInput,
  Civ7ReadyUnitViewInput,
} from "@civ7/direct-control";
import { Effect } from "effect";

import type { Civ7ControlOrpcContext } from "../../../context";
import type {
  Civ7ControlOrpcBattlefieldScanResult,
  Civ7ControlOrpcPlayableStatusResult,
  Civ7ControlOrpcPlayNotificationViewResult,
  Civ7ControlOrpcReadyCityViewResult,
  Civ7ControlOrpcReadyUnitViewResult,
  Civ7ControlOrpcTurnCompletionStatusResult,
} from "../../../dependencies/direct-control";
import {
  civ7ControlOrpcErrorCorrelationData,
  civ7ControlOrpcFailureDetail,
} from "../../../model/correlation";
import type { Civ7ControlOrpcMapLocation } from "../../../model/primitives";
import { civ7ControlOrpcImplementer } from "../../../procedure";
import type {
  Civ7AttentionPrioritiesInput,
  Civ7AttentionPrioritiesResult,
} from "../contract";

type PriorityItem = Civ7AttentionPrioritiesResult["priorities"][number];
type PriorityNextStep = NonNullable<PriorityItem["nextStep"]>;

export const attentionPrioritiesProcedure =
  civ7ControlOrpcImplementer.attention.priorities.effect(function* ({
    context,
    errors,
    input,
  }) {
    return yield* Effect.tryPromise({
      try: async () => {
        const endpointDefaults = context.endpointDefaults;
        const playableStatus = await context.directControl.getCiv7PlayableStatus(
          endpointDefaults,
        );
        const canRead = canReadAttentionPriorities(playableStatus, context);

        if (!canRead) {
          return buildPrioritiesResult({
            input,
            playableStatus,
            notifications: null,
            turnCompletion: null,
            readyUnit: null,
            readyCity: null,
            battlefield: null,
            sourceStatus: skippedSourceStatus(playableStatus),
          });
        }

        const [notifications, turnCompletion] = await Promise.all([
          context.directControl.getCiv7PlayNotificationView({
            ...endpointDefaults,
            maxNotifications: input.maxNotifications,
          }),
          context.directControl.getCiv7TurnCompletionStatus(endpointDefaults),
        ]);
        const [readyUnit, readyCity] = await Promise.all([
          context.directControl.getCiv7ReadyUnitView(
            readyUnitInputFromSources(input, notifications, turnCompletion),
            endpointDefaults,
          ),
          context.directControl.getCiv7ReadyCityView(
            readyCityInputFromNotifications(notifications),
            endpointDefaults,
          ),
        ]);
        const battlefieldOrigin = readyUnitLocation(readyUnit);
        const shouldReadBattlefield = input.includeBattlefield === true;
        const battlefield = shouldReadBattlefield && battlefieldOrigin != null
          ? await context.directControl.getCiv7BattlefieldScan({
            origins: [battlefieldOrigin],
            radius: input.battlefieldRadius ?? 6,
            maxUnits: input.maxBattlefieldUnits ?? 80,
          }, endpointDefaults)
          : null;

        return buildPrioritiesResult({
          input,
          playableStatus,
          notifications,
          turnCompletion,
          readyUnit,
          readyCity,
          battlefield,
          sourceStatus: {
            playableStatus: "read",
            notifications: "read",
            turnCompletion: "read",
            readyUnit: sourceReadStatus(true, readyUnit),
            readyCity: sourceReadStatus(true, readyCity),
            battlefield: shouldReadBattlefield
              ? battlefield == null ? "skipped-no-origin" : "read"
              : "skipped-disabled",
          },
        });
      },
      catch: (cause) =>
        errors.ATTENTION_PRIORITIES_UNAVAILABLE({
          data: {
            detail: civ7ControlOrpcFailureDetail(cause),
            procedureKey: "attention.priorities",
            source: "direct-control-facade",
            ...civ7ControlOrpcErrorCorrelationData(context),
          },
        }),
    });
  });

type BuildInput = Readonly<{
  input: Civ7AttentionPrioritiesInput;
  playableStatus: Civ7ControlOrpcPlayableStatusResult;
  notifications: Civ7ControlOrpcPlayNotificationViewResult | null;
  turnCompletion: Civ7ControlOrpcTurnCompletionStatusResult | null;
  readyUnit: Civ7ControlOrpcReadyUnitViewResult | null;
  readyCity: Civ7ControlOrpcReadyCityViewResult | null;
  battlefield: Civ7ControlOrpcBattlefieldScanResult | null;
  sourceStatus: Civ7AttentionPrioritiesResult["sourceStatus"];
}>;

function buildPrioritiesResult({
  playableStatus,
  notifications,
  turnCompletion,
  readyUnit,
  readyCity,
  battlefield,
  sourceStatus,
}: BuildInput): Civ7AttentionPrioritiesResult {
  const priorities = priorityItems({
    playableStatus,
    notifications,
    turnCompletion,
    readyUnit,
    readyCity,
    battlefield,
  }).sort((a, b) => b.priority - a.priority);
  const nextSteps = priorities
    .map((item) => item.nextStep)
    .filter((item): item is PriorityNextStep => item != null);

  return {
    playable: playableStatus.playable,
    readiness: playableStatus.readiness,
    localPlayerId: numericValue(notifications?.localPlayerId)
      ?? numericValue(readyUnit?.localPlayerId)
      ?? numericValue(readyCity?.localPlayerId)
      ?? numericValue(battlefield?.localPlayerId),
    turn: probeValue<number>(turnCompletion?.turn)
      ?? probeValue<number>(notifications?.turn),
    turnDate: probeValue<string>(turnCompletion?.turnDate)
      ?? probeValue<string>(notifications?.turnDate),
    canEndTurn: turnCompletion == null
      ? probeValue<boolean>(notifications?.canEndTurn)
      : probeValue<boolean>(turnCompletion.canEndTurn),
    sourceStatus,
    turnCompletion: turnCompletionSummary(turnCompletion),
    readyUnit: readyUnitSummary(readyUnit),
    readyCity: readyCitySummary(readyCity),
    battlefield: battlefieldSummary(battlefield),
    summary: {
      priorityCount: priorities.length,
      blockingPriorityCount: priorities.filter((item) => item.blocking).length,
      decisionCount: notifications?.hud.decisionQueue.length ?? 0,
      nextStepCount: nextSteps.length,
    },
    priorities,
    nextSteps,
    notes: [
      "Read-only attention priority dashboard. It does not send operations or choose strategy.",
      "Next steps are semantic service descriptors; CLI command rendering is an adapter concern.",
      "Battlefield evidence is planning context only and must not be treated as relationship status or action authority.",
    ],
  };
}

function priorityItems(input: Readonly<{
  playableStatus: Civ7ControlOrpcPlayableStatusResult;
  notifications: Civ7ControlOrpcPlayNotificationViewResult | null;
  turnCompletion: Civ7ControlOrpcTurnCompletionStatusResult | null;
  readyUnit: Civ7ControlOrpcReadyUnitViewResult | null;
  readyCity: Civ7ControlOrpcReadyCityViewResult | null;
  battlefield: Civ7ControlOrpcBattlefieldScanResult | null;
}>): PriorityItem[] {
  const items: PriorityItem[] = [];

  if (!input.playableStatus.playable && input.notifications == null) {
    items.push({
      priority: 100,
      kind: "readiness-unavailable",
      summary: "playable Tuner/App UI readiness is not available",
      reason: "Priority reads require current playable status before blockers can be trusted.",
      blocking: true,
      nextStep: {
        kind: "restore-readiness",
        source: "readiness",
        label: "Restore playable readiness before reading priorities.",
        parameters: {},
      },
      evidenceLabels: ["playable-status"],
    });
    return items;
  }

  const runtimeErrors = hudProbeErrors(input.notifications);
  if (runtimeErrors.length > 0) {
    items.push({
      priority: 95,
      kind: "runtime-state-error",
      summary: "core HUD probes failed; live blocker state is not proven clean",
      reason: "A missing turn, blocker, or blocking-notification probe means the attention read is partial.",
      blocking: true,
      nextStep: {
        kind: "observe",
        source: "attention.priorities",
        label: "Refresh runtime attention evidence before treating the turn as clean.",
        parameters: {},
      },
      evidenceLabels: runtimeErrors.map((item) => `probe-error:${item.field}`),
    });
  }

  const nextDecision = input.notifications?.hud.nextDecision;
  if (nextDecision != null) {
    const stale = staleUnitCommandPriority(nextDecision);
    items.push({
      priority: nextDecision.isEndTurnBlocking === true ? 100 : 70,
      kind: stale?.kind ?? `hud:${String(nextDecision.category)}`,
      summary: stale?.summary ?? stringValue(
        nextDecision.summary ?? nextDecision.message ?? nextDecision.typeName,
        "current HUD decision",
      ),
      reason: stale?.reason ?? decisionReason(nextDecision),
      blocking: nextDecision.isEndTurnBlocking === true,
      nextStep: stale?.nextStep ?? decisionNextStep(nextDecision, input.readyUnit),
      evidenceLabels: ["hud-next-decision"],
    });
  }

  if (input.readyUnit?.unitId != null) {
    const unit = probeValue<{ typeName?: string; location?: Civ7ControlOrpcMapLocation }>(
      input.readyUnit.unit,
    );
    const location = unit?.location
      ? ` at (${unit.location.x},${unit.location.y})`
      : "";
    items.push({
      priority: 85,
      kind: "ready-unit",
      summary: `${unit?.typeName ?? "ready unit"}${location}`,
      reason: "A ready unit blocks turn flow and any target action still needs validator-backed confirmation.",
      blocking: true,
      nextStep: {
        kind: "inspect-ready-unit",
        source: "ready-unit",
        label: "Inspect ready unit orders.",
        parameters: {
          unitId: input.readyUnit.unitId,
        },
      },
      evidenceLabels: readyUnitEvidence(input.readyUnit),
    });
  }

  if (input.readyCity?.cityId != null) {
    const city = probeValue<{ name?: string }>(input.readyCity.city);
    items.push({
      priority: 80,
      kind: "ready-city",
      summary: city?.name ?? "ready city",
      reason: "City blockers branch between production, town focus, population placement, and expansion.",
      blocking: true,
      nextStep: {
        kind: "inspect-ready-city",
        source: "ready-city",
        label: "Inspect ready city decision.",
        parameters: {
          componentId: input.readyCity.cityId,
        },
      },
      evidenceLabels: readyCityEvidence(input.readyCity),
    });
  }

  for (const point of input.battlefield?.pointsOfInterest ?? []) {
    items.push({
      priority: severityPriority(point.severity),
      kind: `battlefield:${point.kind}`,
      summary: point.summary,
      reason: "Battlefield points identify inspection needs around the ready-unit origin; they are not mutation authority.",
      blocking: false,
      nextStep: {
        kind: "inspect-battlefield-point",
        source: "battlefield",
        label: `Inspect ${point.kind} battlefield point.`,
        parameters: {
          ...(point.location == null ? {} : { location: point.location }),
        },
      },
      evidenceLabels: ["battlefield-point-of-interest"],
    });
  }

  if (items.length === 0) {
    items.push({
      priority: 10,
      kind: "clean-read",
      summary: "no HUD, ready-unit, ready-city, or battlefield priority surfaced",
      reason: "Fresh clean reads can use the guarded end-turn path; it rechecks blockers before mutation.",
      blocking: false,
      nextStep: {
        kind: "end-turn",
        source: "attention.priorities",
        label: "No blockers found; guarded end-turn is available.",
        parameters: {},
      },
      evidenceLabels: ["clean-attention-read"],
    });
  }

  return items;
}

function decisionReason(nextDecision: Record<string, unknown>): string {
  const category = String(nextDecision.category ?? "decision");
  if (category === "unit-command") {
    return "A ready unit decision exists; inspect ready-unit and target surfaces before treating command-units as stale.";
  }
  if (
    category === "production-choice" || category === "population-placement"
  ) {
    return "A ready city decision exists; inspect the city decision surface before broad strategy.";
  }
  if (category === "informational-notification") {
    return "HUD details include a live ComponentID; inspect notification postcondition evidence before any closeout send.";
  }
  const family = stringValue(nextDecision.operationFamily, null);
  const operation = stringValue(nextDecision.operationType, null);
  if (family != null || operation != null) {
    return `HUD decision exposes validator-backed ${family ?? "operation"}${operation == null ? "" : `/${operation}`} evidence.`;
  }
  return "HUD decisions are short-lived attention authority and should be resolved or consciously deferred before broad strategy.";
}

function decisionNextStep(
  nextDecision: Record<string, unknown>,
  readyUnit: Civ7ControlOrpcReadyUnitViewResult | null,
): PriorityNextStep | null {
  const category = String(nextDecision.category ?? "decision");
  const componentId = componentIdFromUnknown(nextDecision.notificationId);
  const operationFamily = stringValue(nextDecision.operationFamily, undefined);
  const operationType = stringValue(nextDecision.operationType, undefined);

  if (category === "production-choice" || category === "population-placement") {
    return {
      kind: "inspect-ready-city",
      source: "ready-city",
      label: "Inspect ready city decision before choosing a city action.",
      parameters: {
        category,
        operationFamily,
        operationType,
        ...(componentId == null ? {} : { componentId }),
      },
    };
  }

  if (
    category === "technology-choice" || category === "culture-choice" ||
    category === "tradition-review"
  ) {
    return {
      kind: "inspect-progression",
      source: "notification",
      label: "Inspect progression options before choosing a progression action.",
      parameters: {
        category,
        operationFamily,
        operationType,
        ...(componentId == null ? {} : { componentId }),
      },
    };
  }

  if (
    category === "celebration-choice" || category === "government-choice" ||
    category === "narrative-choice" || category === "first-meet-diplomacy"
  ) {
    if (category === "narrative-choice" && narrativeChoiceOptionsEmpty(nextDecision)) {
      return {
        kind: "inspect-notification",
        source: "notification",
        label: "Inspect narrative notification closeout evidence.",
        parameters: {
          category,
          operationFamily,
          operationType,
          ...(componentId == null ? {} : { componentId }),
        },
      };
    }
    return {
      kind: "inspect-decision",
      source: "notification",
      label: "Inspect decision options before choosing an action.",
      parameters: {
        category,
        operationFamily,
        operationType,
        ...(componentId == null ? {} : { componentId }),
      },
    };
  }

  if (category === "unit-command" && readyUnit != null) {
    return {
      kind: "validate-unit-target",
      source: "ready-unit",
      label: "Inspect ready unit and validate a unit action.",
      parameters: {
        category,
        operationFamily,
        operationType,
        ...(componentId == null ? {} : { componentId }),
        ...(readyUnit.unitId == null ? {} : { unitId: readyUnit.unitId }),
      },
    };
  }

  if (category === "informational-notification") {
    return {
      kind: "inspect-notification",
      source: "notification",
      label: "Inspect notification closeout evidence.",
      parameters: {
        category,
        operationFamily,
        operationType,
        ...(componentId == null ? {} : { componentId }),
      },
    };
  }

  return {
    kind: "inspect-decision",
    source: "notification",
    label: "Inspect current decision evidence.",
    parameters: {
      category,
      operationFamily,
      operationType,
      ...(componentId == null ? {} : { componentId }),
    },
  };
}

function narrativeChoiceOptionsEmpty(nextDecision: Record<string, unknown>): boolean {
  const details = asRecord(nextDecision.details);
  return details?.kind === "narrative-choice-options" &&
    Array.isArray(details.enabledOptions) &&
    details.enabledOptions.length === 0;
}

function staleUnitCommandPriority(
  nextDecision: { details?: unknown },
): Pick<PriorityItem, "kind" | "summary" | "reason" | "nextStep"> | null {
  const details = asRecord(nextDecision.details);
  if (details?.kind !== "unit-command-reconciliation") return null;
  if (
    details.staleExpiredWithoutEnabledCloseout !== true &&
    details.classification !== "unit-command-stale-expired" &&
    details.staleReadyPointerSuspected !== true
  ) {
    return null;
  }

  const enabledCandidate = asArray(details.enabledCloseoutCandidates)
    .find((item) => typeof item.operationType === "string");
  if (enabledCandidate != null) {
    const unitId = componentIdFromUnknown(enabledCandidate.unitId);
    return {
      kind: "hud:unit-command",
      summary: "COMMAND_UNITS closeout candidate needs validator-backed review",
      reason: "Official command-units evidence exposes an enabled unit command candidate; validate it before mutation.",
      nextStep: {
        kind: "validate-unit-command",
        source: "notification",
        label: "Validate the unit command candidate.",
        parameters: {
          operationType: String(enabledCandidate.operationType),
          ...(unitId == null ? {} : { unitId }),
        },
      },
    };
  }

  const hasSent = probeValue<boolean>(details.hasSentTurnComplete) === true;
  return {
    kind: "hud:unit-command-stale-expired",
    summary: hasSent
      ? "expired COMMAND_UNITS has no ready unit or enabled closeout after turn-complete was sent"
      : "expired COMMAND_UNITS has no ready unit or enabled unit closeout",
    reason: hasSent
      ? "Official command-units activation has no selected/first-ready unit and every scanned unit closeout is disabled; turn-complete is already sent, so wait/watch for turn advance or a new blocker instead of repeating unit operations."
      : "Official command-units activation has no selected/first-ready unit and every scanned unit closeout is disabled; use the normal end-turn path once, then verify the turn advances or a new blocker appears.",
    nextStep: {
      kind: hasSent ? "observe-turn-advance" : "send-turn-complete",
      source: "attention.priorities",
      label: hasSent
        ? "Watch for turn advance or a new blocker."
        : "Use guarded turn completion once.",
      parameters: {
        hasSentTurnComplete: hasSent,
      },
    },
  };
}

function turnCompletionSummary(
  turnCompletion: Civ7ControlOrpcTurnCompletionStatusResult | null,
): Civ7AttentionPrioritiesResult["turnCompletion"] {
  return {
    hasSentTurnComplete: probeValue<boolean>(
      turnCompletion?.hasSentTurnComplete,
    ),
    canEndTurn: probeValue<boolean>(turnCompletion?.canEndTurn),
    firstReadyUnitId: probeValue<Civ7ComponentId>(
      turnCompletion?.firstReadyUnitId,
    ),
    blockerStatus: turnCompletionBlockerStatus(turnCompletion),
  };
}

function turnCompletionBlockerStatus(
  turnCompletion: Civ7ControlOrpcTurnCompletionStatusResult | null,
): Civ7AttentionPrioritiesResult["turnCompletion"]["blockerStatus"] {
  const blocker = turnCompletion?.blocker;
  if (blocker == null || typeof blocker !== "object") return "unknown";
  if (!("ok" in blocker) || blocker.ok !== true) return "unknown";
  if (!("value" in blocker)) return "unknown";
  const value = blocker.value;
  if (value === 0 || value === null || value === "NONE") return "none";
  return "blocked";
}

function readyUnitSummary(
  readyUnit: Civ7ControlOrpcReadyUnitViewResult | null,
): Civ7AttentionPrioritiesResult["readyUnit"] {
  if (readyUnit == null) return null;
  const unit = probeValue<{ typeName?: string }>(readyUnit.unit);
  return {
    unitId: readyUnit.unitId,
    legalOperationCount: readyUnit.legalOperations.length,
    promotionReadinessAvailable: probeValue<unknown>(
      readyUnit.promotionReadiness,
    ) != null,
    summary: unit?.typeName ?? "ready unit",
  };
}

function readyCitySummary(
  readyCity: Civ7ControlOrpcReadyCityViewResult | null,
): Civ7AttentionPrioritiesResult["readyCity"] {
  if (readyCity == null) return null;
  const city = probeValue<{ name?: string }>(readyCity.city);
  return {
    cityId: readyCity.cityId,
    legalOperationCount: readyCity.legalOperations.length,
    productionCandidateCount: probeArrayLength(readyCity.productionCandidates),
    townFocusOptionCount: probeArrayLength(readyCity.townFocusOptions),
    populationPlacementAvailable: probeValue<unknown>(
      readyCity.populationPlacement,
    ) != null,
    summary: city?.name ?? "ready city",
  };
}

function battlefieldSummary(
  battlefield: Civ7ControlOrpcBattlefieldScanResult | null,
): Civ7AttentionPrioritiesResult["battlefield"] {
  if (battlefield == null) return null;
  return {
    origins: battlefield.origins,
    radius: battlefield.radius,
    hiddenInfoPolicy: String(battlefield.hiddenInfoPolicy),
    pointOfInterestCount: battlefield.pointsOfInterest.length,
    observedOwnerCount: battlefield.owners.length,
    pointsOfInterest: battlefield.pointsOfInterest.map((point) => ({
      kind: point.kind,
      severity: point.severity,
      summary: point.summary,
      location: point.location,
    })),
  };
}

function readyUnitInputFromSources(
  input: Civ7AttentionPrioritiesInput,
  notifications: Civ7ControlOrpcPlayNotificationViewResult,
  turnCompletion: Civ7ControlOrpcTurnCompletionStatusResult,
): Civ7ReadyUnitViewInput {
  const unitId = probeValue<Civ7ComponentId>(notifications.selectedUnitId)
    ?? probeValue<Civ7ComponentId>(notifications.firstReadyUnitId)
    ?? probeValue<Civ7ComponentId>(turnCompletion.firstReadyUnitId);
  return {
    ...(unitId == null ? {} : { unitId }),
    ...(input.readyUnitRadius == null ? {} : { radius: input.readyUnitRadius }),
    ...(input.maxReadyUnitOperations == null
      ? {}
      : { maxOperations: input.maxReadyUnitOperations }),
  };
}

function readyCityInputFromNotifications(
  notifications: Civ7ControlOrpcPlayNotificationViewResult,
): Civ7ReadyCityViewInput {
  const cityId = probeValue<Civ7ComponentId>(notifications.selectedCityId)
    ?? componentIdFromUnknown(notifications.hud.nextDecision?.target)
    ?? notifications.hud.decisionQueue
      .map((item) => componentIdFromUnknown(item.target))
      .find((id): id is Civ7ComponentId => id != null)
    ?? null;
  return cityId == null ? {} : { cityId };
}

function readyUnitLocation(
  readyUnit: Civ7ControlOrpcReadyUnitViewResult,
): Civ7ControlOrpcMapLocation | null {
  const unit = probeValue<{ location?: { x?: unknown; y?: unknown } }>(
    readyUnit.unit,
  );
  const x = unit?.location?.x;
  const y = unit?.location?.y;
  return typeof x === "number" && typeof y === "number" ? { x, y } : null;
}

function sourceReadStatus(
  attempted: boolean,
  result:
    | Civ7ControlOrpcReadyUnitViewResult
    | Civ7ControlOrpcReadyCityViewResult
    | null,
): Civ7AttentionPrioritiesResult["sourceStatus"]["readyUnit"] {
  if (!attempted || result == null) return "skipped-unsupported";
  if (result.host !== "game-ui") return "read";
  if ("unitId" in result) {
    return result.firstReadyUnitId.ok === true
      ? "read"
      : "skipped-unsupported";
  }
  const readyCityId = result.cityId
    ?? probeValue<Civ7ComponentId>(result.blockingCityId);
  return readyCityId == null ? "skipped-unsupported" : "read";
}

function skippedSourceStatus(
  playableStatus: Civ7ControlOrpcPlayableStatusResult,
): Civ7AttentionPrioritiesResult["sourceStatus"] {
  const skipped = playableStatus.playable
    ? "skipped-unsupported"
    : "skipped-not-playable";
  return {
    playableStatus: "read",
    notifications: skipped,
    turnCompletion: skipped,
    readyUnit: skipped,
    readyCity: skipped,
    battlefield: playableStatus.playable
      ? "skipped-unsupported"
      : "skipped-not-playable",
  };
}

function canReadAttentionPriorities(
  playableStatus: Civ7ControlOrpcPlayableStatusResult,
  context: Civ7ControlOrpcContext,
): boolean {
  return playableStatus.playable
    || context.controller?.supportedReadProcedures?.includes(
      "attention.priorities",
    ) === true;
}

function hudProbeErrors(
  notifications: Civ7ControlOrpcPlayNotificationViewResult | null,
): Array<{ field: string; error: string }> {
  if (notifications == null) return [];
  return [
    ["turn", notifications.turn],
    ["turnDate", notifications.turnDate],
    ["blocker", notifications.blocker],
    ["blockingNotificationId", notifications.blockingNotificationId],
  ].flatMap(([field, probe]) =>
    isProbeError(probe)
      ? [{ field: String(field), error: probe.error }]
      : []
  );
}

function readyUnitEvidence(
  readyUnit: Civ7ControlOrpcReadyUnitViewResult,
): string[] {
  return readyUnit.host === "game-ui"
    ? ["game-ui-ready-unit-source"]
    : ["ready-unit-view"];
}

function readyCityEvidence(
  readyCity: Civ7ControlOrpcReadyCityViewResult,
): string[] {
  return readyCity.host === "game-ui"
    ? ["game-ui-ready-city-source"]
    : ["ready-city-view"];
}

function severityPriority(severity: string): number {
  if (severity === "high") return 75;
  if (severity === "medium") return 55;
  if (severity === "low") return 35;
  return 45;
}

function isProbeError(probe: unknown): probe is { ok: false; error: string } {
  return Boolean(
    probe && typeof probe === "object" && "ok" in probe &&
      (probe as { ok?: unknown }).ok === false,
  );
}

function probeValue<T>(probe: unknown): T | null {
  if (probe == null || typeof probe !== "object") return null;
  if (!("ok" in probe) || probe.ok !== true) return null;
  if (!("value" in probe)) return null;
  return probe.value as T;
}

function probeArrayLength(probe: unknown): number {
  const value = probeValue<unknown>(probe);
  return Array.isArray(value) ? value.length : 0;
}

function numericValue(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function stringValue<T extends string | null | undefined>(
  value: unknown,
  fallback: T,
): string | T {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value != null && typeof value === "object"
    ? value as Record<string, unknown>
    : null;
}

function asArray(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value)
    ? value.filter((item): item is Record<string, unknown> =>
      item != null && typeof item === "object"
    )
    : [];
}

function componentIdFromUnknown(value: unknown): Civ7ComponentId | null {
  if (value == null || typeof value !== "object") return null;
  const candidate = "cityId" in value ? value.cityId : value;
  if (candidate == null || typeof candidate !== "object") return null;
  if (!("owner" in candidate) || typeof candidate.owner !== "number") {
    return null;
  }
  if (!("id" in candidate) || typeof candidate.id !== "number") return null;
  const out: Civ7ComponentId = { owner: candidate.owner, id: candidate.id };
  if ("type" in candidate && typeof candidate.type === "number") {
    out.type = candidate.type;
  }
  return out;
}
