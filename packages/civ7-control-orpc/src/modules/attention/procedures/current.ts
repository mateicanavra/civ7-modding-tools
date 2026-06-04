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
            readyUnit: null,
            readyCity: null,
          });
        }

        const notifications =
          await context.directControl.getCiv7PlayNotificationView({
            ...endpointDefaults,
            maxNotifications: input.maxNotifications,
          });
        const readyUnitInput = readyUnitInputFromNotifications(notifications);
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
  readyUnit: Civ7ControlOrpcReadyUnitViewResult | null;
  readyCity: Civ7ControlOrpcReadyCityViewResult | null;
}>;

function buildAttentionCurrentResult({
  playableStatus,
  notifications,
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
    notifications,
    blockers,
    readyActors,
  });

  return {
    playable: playableStatus.playable,
    readiness: playableStatus.readiness,
    turn: notifications == null ? null : probeValue<number>(notifications.turn),
    turnDate: notifications == null
      ? null
      : probeValue<string>(notifications.turnDate),
    canEndTurn: notifications == null
      ? null
      : probeValue<boolean>(notifications.canEndTurn),
    sourceStatus: {
      playableStatus: "read",
      notifications: notifications == null ? "skipped-not-playable" : "read",
      readyUnit: sourceReadStatus(playableStatus),
      readyCity: sourceReadStatus(playableStatus),
    },
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

function readyUnitInputFromNotifications(
  notifications: Civ7ControlOrpcPlayNotificationViewResult,
): Civ7ReadyUnitViewInput {
  const unitId = probeValue<Civ7ComponentId>(notifications.selectedUnitId)
    ?? probeValue<Civ7ComponentId>(notifications.firstReadyUnitId);
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
  notifications,
  blockers,
  readyActors,
}: Readonly<{
  playableStatus: Civ7ControlOrpcPlayableStatusResult;
  notifications: Civ7ControlOrpcPlayNotificationViewResult | null;
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

  if (probeValue<boolean>(notifications?.canEndTurn) === true) {
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
