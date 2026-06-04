import type {
  Civ7ComponentId,
  Civ7ReadyCityViewInput,
  Civ7ReadyUnitViewInput,
} from "@civ7/direct-control";
import { Effect } from "effect";

import type {
  Civ7ControlOrpcPlayableStatusResult,
  Civ7ControlOrpcPlayNotificationViewResult,
  Civ7ControlOrpcReadyCityViewResult,
  Civ7ControlOrpcReadyUnitViewResult,
  Civ7ControlOrpcTurnCompletionStatusResult,
} from "../../../dependencies/direct-control";
import { civ7ControlOrpcImplementer } from "../../../procedure";
import type {
  Civ7AttentionCurrentInput,
  Civ7AttentionCurrentResult,
} from "../contract";

export const attentionCurrentProcedure =
  civ7ControlOrpcImplementer.attention.current.effect(function* ({
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

        if (!playableStatus.playable) {
          return buildAttentionCurrentResult({
            input,
            playableStatus,
            notifications: null,
            turnCompletion: null,
            readyUnit: null,
            readyCity: null,
          });
        }

        const [notifications, turnCompletion] = await Promise.all([
          context.directControl.getCiv7PlayNotificationView({
            ...endpointDefaults,
            maxNotifications: input.maxNotifications,
          }),
          context.directControl.getCiv7TurnCompletionStatus(endpointDefaults),
        ]);
        const readyUnitInput = readyUnitInputFromSources(
          notifications,
          turnCompletion,
        );
        const readyCityInput = readyCityInputFromNotifications(notifications);
        const [readyUnit, readyCity] = await Promise.all([
          context.directControl.getCiv7ReadyUnitView(
            readyUnitInput,
            endpointDefaults,
          ),
          context.directControl.getCiv7ReadyCityView(
            readyCityInput,
            endpointDefaults,
          ),
        ]);

        return buildAttentionCurrentResult({
          input,
          playableStatus,
          notifications,
          turnCompletion,
          readyUnit,
          readyCity,
        });
      },
      catch: () =>
        errors.ATTENTION_CURRENT_UNAVAILABLE({
          data: {
            procedureKey: "attention.current",
            source: "direct-control-facade",
          },
        }),
    });
  });

type AttentionBuildInput = Readonly<{
  input: Civ7AttentionCurrentInput;
  playableStatus: Civ7ControlOrpcPlayableStatusResult;
  notifications: Civ7ControlOrpcPlayNotificationViewResult | null;
  turnCompletion: Civ7ControlOrpcTurnCompletionStatusResult | null;
  readyUnit: Civ7ControlOrpcReadyUnitViewResult | null;
  readyCity: Civ7ControlOrpcReadyCityViewResult | null;
}>;

function buildAttentionCurrentResult({
  playableStatus,
  notifications,
  turnCompletion,
  readyUnit,
  readyCity,
}: AttentionBuildInput): Civ7AttentionCurrentResult {
  const blockers = [
    ...notificationBlockers(notifications),
    ...readyUnitBlockers(readyUnit),
    ...readyCityBlockers(readyCity),
  ];
  const decisions = notificationDecisions(notifications);
  const readyActors = [
    ...readyUnitActors(readyUnit),
    ...readyCityActors(readyCity),
  ];
  const nextSteps = attentionNextSteps({
    playableStatus,
    turnCompletion,
    blockers,
    readyActors,
  });

  return {
    playable: playableStatus.playable,
    readiness: playableStatus.readiness,
    turn: probeValue<number>(turnCompletion?.turn)
      ?? probeValue<number>(notifications?.turn),
    turnDate: probeValue<string>(turnCompletion?.turnDate)
      ?? probeValue<string>(notifications?.turnDate),
    canEndTurn: turnCompletion == null
      ? probeValue<boolean>(notifications?.canEndTurn)
      : probeValue<boolean>(turnCompletion.canEndTurn),
    sourceStatus: {
      playableStatus: "read",
      notifications: notifications == null ? "skipped-not-playable" : "read",
      turnCompletion: sourceReadStatus(playableStatus),
      readyUnit: sourceReadStatus(playableStatus),
      readyCity: sourceReadStatus(playableStatus),
    },
    turnCompletion: turnCompletionSummary(turnCompletion),
    summary: {
      blockerCount: blockers.length,
      decisionCount: decisions.length,
      readyActorCount: readyActors.length,
      nextStepCount: nextSteps.length,
    },
    blockers,
    decisions,
    readyActors,
    nextSteps,
  };
}

function turnCompletionSummary(
  turnCompletion: Civ7ControlOrpcTurnCompletionStatusResult | null,
): Civ7AttentionCurrentResult["turnCompletion"] {
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
): Civ7AttentionCurrentResult["turnCompletion"]["blockerStatus"] {
  const blocker = turnCompletion?.blocker;
  if (blocker == null || typeof blocker !== "object") return "unknown";
  if (!("ok" in blocker) || blocker.ok !== true) return "unknown";
  if (!("value" in blocker)) return "unknown";
  const value = blocker.value;
  if (value === 0 || value === null || value === "NONE") return "none";
  return "blocked";
}

function notificationBlockers(
  notifications: Civ7ControlOrpcPlayNotificationViewResult | null,
): Civ7AttentionCurrentResult["blockers"] {
  if (notifications == null) return [];
  const queueBlockers = notifications.hud.decisionQueue
    .filter((item) => item.isEndTurnBlocking)
    .map((item) => ({
      source: "notification" as const,
      kind: item.category,
      label: item.summary ?? item.category,
      summary: item.message ?? item.summary,
      componentId: item.notificationId,
      evidence: ["end-turn-blocking-notification"],
    }));

  if (queueBlockers.length > 0) return queueBlockers;

  const blockingNotificationId = probeValue<Civ7ComponentId>(
    notifications.blockingNotificationId,
  );
  if (blockingNotificationId == null) return [];

  return [{
    source: "notification",
    kind: "blocking-notification",
    label: "Blocking notification",
    summary: null,
    componentId: blockingNotificationId,
    evidence: ["blockingNotificationId"],
  }];
}

function notificationDecisions(
  notifications: Civ7ControlOrpcPlayNotificationViewResult | null,
): Civ7AttentionCurrentResult["decisions"] {
  if (notifications == null) return [];
  return notifications.hud.decisionQueue.map((item) => {
    const decision: Civ7AttentionCurrentResult["decisions"][number] = {
      source: "notification",
      category: item.category,
      summary: item.summary,
      isEndTurnBlocking: item.isEndTurnBlocking,
      requiredInputs: item.requiredInputs
        .filter((input) => input.required)
        .map((input) => input.name),
    };
    if (item.operationFamily != null) {
      decision.operationFamily = item.operationFamily;
    }
    if (item.operationType != null) {
      decision.operationType = item.operationType;
    }
    return decision;
  });
}

function readyUnitInputFromSources(
  notifications: Civ7ControlOrpcPlayNotificationViewResult,
  turnCompletion: Civ7ControlOrpcTurnCompletionStatusResult,
): Civ7ReadyUnitViewInput {
  const unitId = probeValue<Civ7ComponentId>(notifications.selectedUnitId)
    ?? probeValue<Civ7ComponentId>(notifications.firstReadyUnitId)
    ?? probeValue<Civ7ComponentId>(turnCompletion.firstReadyUnitId);
  return unitId == null ? {} : { unitId };
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

function readyUnitBlockers(
  readyUnit: Civ7ControlOrpcReadyUnitViewResult | null,
): Civ7AttentionCurrentResult["blockers"] {
  if (readyUnit == null || readyUnit.unitId == null) return [];
  return [{
    source: "ready-unit",
    kind: "ready-unit",
    label: "Ready unit needs orders",
    summary: `${readyUnit.legalOperations.length} legal operations available`,
    componentId: readyUnit.unitId,
    evidence: ["ready-unit-view"],
  }];
}

function readyCityBlockers(
  readyCity: Civ7ControlOrpcReadyCityViewResult | null,
): Civ7AttentionCurrentResult["blockers"] {
  const cityId = readyCity?.cityId ?? probeValue<Civ7ComponentId>(
    readyCity?.blockingCityId,
  );
  if (cityId == null) return [];
  return [{
    source: "ready-city",
    kind: "ready-city",
    label: "Ready city needs a decision",
    summary: `${readyCity?.legalOperations.length ?? 0} legal operations available`,
    componentId: cityId,
    evidence: ["ready-city-view"],
  }];
}

function readyUnitActors(
  readyUnit: Civ7ControlOrpcReadyUnitViewResult | null,
): Civ7AttentionCurrentResult["readyActors"] {
  if (readyUnit?.unitId == null) return [];
  return [{
    kind: "unit",
    componentId: readyUnit.unitId,
    operationCount: readyUnit.legalOperations.length,
    summary: "Ready unit",
    evidence: ["ready-unit-view"],
  }];
}

function readyCityActors(
  readyCity: Civ7ControlOrpcReadyCityViewResult | null,
): Civ7AttentionCurrentResult["readyActors"] {
  if (readyCity == null || readyCity.cityId == null) return [];
  return [{
    kind: "city",
    componentId: readyCity.cityId,
    operationCount: readyCity.legalOperations.length,
    summary: "Ready city",
    evidence: ["ready-city-view"],
  }];
}

function attentionNextSteps({
  playableStatus,
  turnCompletion,
  blockers,
  readyActors,
}: Readonly<{
  playableStatus: Civ7ControlOrpcPlayableStatusResult;
  turnCompletion: Civ7ControlOrpcTurnCompletionStatusResult | null;
  blockers: Civ7AttentionCurrentResult["blockers"];
  readyActors: Civ7AttentionCurrentResult["readyActors"];
}>): Civ7AttentionCurrentResult["nextSteps"] {
  if (!playableStatus.playable) {
    return [{
      kind: "restore-readiness",
      source: "readiness",
      label: "Restore playable Tuner/App UI readiness before reading attention.",
    }];
  }

  const actorSteps = readyActors.map((actor) => ({
    kind: actor.kind === "unit"
      ? "act-ready-unit" as const
      : "act-ready-city" as const,
    source: actor.kind === "unit" ? "ready-unit" as const : "ready-city" as const,
    label: actor.kind === "unit"
      ? "Review ready unit orders."
      : "Review ready city decision.",
  }));

  const blockerSteps = blockers
    .filter((blocker) => blocker.source === "notification")
    .map((blocker) => ({
      kind: "resolve-blocker" as const,
      source: "notification" as const,
      label: `Resolve ${blocker.label}.`,
    }));

  if (blockerSteps.length > 0 || actorSteps.length > 0) {
    return [...blockerSteps, ...actorSteps];
  }

  if (canRecommendEndTurn(turnCompletion)) {
    return [{
      kind: "end-turn",
      source: "attention",
      label: "No blockers found; end turn is available.",
    }];
  }

  return [{
    kind: "observe",
    source: "attention",
    label: "No current blockers found.",
  }];
}

function canRecommendEndTurn(
  turnCompletion: Civ7ControlOrpcTurnCompletionStatusResult | null,
): boolean {
  if (probeValue<boolean>(turnCompletion?.canEndTurn) !== true) return false;
  if (probeValue<boolean>(turnCompletion?.hasSentTurnComplete) === true) {
    return false;
  }
  if (probeValue<Civ7ComponentId>(turnCompletion?.firstReadyUnitId) != null) {
    return false;
  }
  return turnCompletionBlockerStatus(turnCompletion) !== "blocked";
}

function sourceReadStatus(
  playableStatus: Civ7ControlOrpcPlayableStatusResult,
): "read" | "skipped-not-playable" {
  if (!playableStatus.playable) return "skipped-not-playable";
  return "read";
}

function probeValue<T>(probe: unknown): T | null {
  if (probe == null || typeof probe !== "object") return null;
  if (!("ok" in probe) || probe.ok !== true) return null;
  if (!("value" in probe)) return null;
  return probe.value as T;
}

function componentIdFromUnknown(value: unknown): Civ7ComponentId | null {
  if (value == null || typeof value !== "object") return null;
  const candidate = "cityId" in value ? value.cityId : value;
  if (candidate == null || typeof candidate !== "object") return null;
  if (!("owner" in candidate) || typeof candidate.owner !== "number") return null;
  if (!("id" in candidate) || typeof candidate.id !== "number") return null;
  const out: Civ7ComponentId = { owner: candidate.owner, id: candidate.id };
  if ("type" in candidate && typeof candidate.type === "number") {
    out.type = candidate.type;
  }
  return out;
}
