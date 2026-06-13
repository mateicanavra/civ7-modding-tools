import type {
  Civ7ComponentId,
  Civ7ReadyCityViewInput,
  Civ7ReadyUnitViewInput,
} from "@civ7/direct-control";
import { Effect } from "effect";

import type { Civ7ControlOrpcContext } from "../../../context";
import type {
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
import { civ7ControlOrpcImplementer } from "../../../procedure";
import type { Civ7AttentionCurrentInput, Civ7AttentionCurrentResult } from "../contract";

export const attentionCurrentProcedure = civ7ControlOrpcImplementer.attention.current.effect(
  function* ({ context, errors, input }) {
    return yield* Effect.tryPromise({
      try: async () => {
        const endpointDefaults = context.endpointDefaults;
        const playableStatus = await context.directControl.getCiv7PlayableStatus(endpointDefaults);
        const canReadAttention = canReadAttentionCurrent(playableStatus, context);

        if (!canReadAttention) {
          return buildAttentionCurrentResult({
            input,
            playableStatus,
            notifications: null,
            turnCompletion: null,
            readyUnit: null,
            readyCity: null,
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
        const canReadReadyActors = canReadAttention;
        const [readyUnit, readyCity] = canReadReadyActors
          ? await Promise.all([
              context.directControl.getCiv7ReadyUnitView(
                readyUnitInputFromSources(notifications, turnCompletion),
                endpointDefaults
              ),
              context.directControl.getCiv7ReadyCityView(
                readyCityInputFromNotifications(notifications),
                endpointDefaults
              ),
            ])
          : [null, null];

        return buildAttentionCurrentResult({
          input,
          playableStatus,
          notifications,
          turnCompletion,
          readyUnit,
          readyCity,
          sourceStatus: {
            playableStatus: "read",
            notifications: "read",
            turnCompletion: "read",
            readyUnit: sourceReadStatus(canReadReadyActors, readyUnit),
            readyCity: sourceReadStatus(canReadReadyActors, readyCity),
          },
        });
      },
      catch: (cause) =>
        errors.ATTENTION_CURRENT_UNAVAILABLE({
          data: {
            detail: civ7ControlOrpcFailureDetail(cause),
            procedureKey: "attention.current",
            source: "direct-control-facade",
            ...civ7ControlOrpcErrorCorrelationData(context),
          },
        }),
    });
  }
);

type AttentionBuildInput = Readonly<{
  input: Civ7AttentionCurrentInput;
  playableStatus: Civ7ControlOrpcPlayableStatusResult;
  notifications: Civ7ControlOrpcPlayNotificationViewResult | null;
  turnCompletion: Civ7ControlOrpcTurnCompletionStatusResult | null;
  readyUnit: Civ7ControlOrpcReadyUnitViewResult | null;
  readyCity: Civ7ControlOrpcReadyCityViewResult | null;
  sourceStatus: Civ7AttentionCurrentResult["sourceStatus"];
}>;

function buildAttentionCurrentResult({
  playableStatus,
  notifications,
  turnCompletion,
  readyUnit,
  readyCity,
  sourceStatus,
}: AttentionBuildInput): Civ7AttentionCurrentResult {
  const blockers = [
    ...notificationBlockers(notifications),
    ...readyUnitBlockers(readyUnit),
    ...readyCityBlockers(readyCity),
  ];
  const decisions = notificationDecisions(notifications);
  const readyActors = [...readyUnitActors(readyUnit), ...readyCityActors(readyCity)];
  const nextSteps = attentionNextSteps({
    playableStatus,
    sourceStatus,
    turnCompletion,
    notificationCoverageComplete: notifications?.limits.truncated !== true,
    blockers,
    readyActors,
    readyActorsCovered: sourceStatus.readyUnit === "read" && sourceStatus.readyCity === "read",
  });

  return {
    playable: playableStatus.playable,
    readiness: playableStatus.readiness,
    turn: probeValue<number>(turnCompletion?.turn) ?? probeValue<number>(notifications?.turn),
    turnDate:
      probeValue<string>(turnCompletion?.turnDate) ?? probeValue<string>(notifications?.turnDate),
    canEndTurn:
      turnCompletion == null
        ? probeValue<boolean>(notifications?.canEndTurn)
        : probeValue<boolean>(turnCompletion.canEndTurn),
    sourceStatus: {
      ...sourceStatus,
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
  turnCompletion: Civ7ControlOrpcTurnCompletionStatusResult | null
): Civ7AttentionCurrentResult["turnCompletion"] {
  return {
    hasSentTurnComplete: probeValue<boolean>(turnCompletion?.hasSentTurnComplete),
    canEndTurn: probeValue<boolean>(turnCompletion?.canEndTurn),
    firstReadyUnitId: probeValue<Civ7ComponentId>(turnCompletion?.firstReadyUnitId),
    blockerStatus: turnCompletionBlockerStatus(turnCompletion),
  };
}

function turnCompletionBlockerStatus(
  turnCompletion: Civ7ControlOrpcTurnCompletionStatusResult | null
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
  notifications: Civ7ControlOrpcPlayNotificationViewResult | null
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

  const blockingNotificationId = probeValue<Civ7ComponentId>(notifications.blockingNotificationId);
  if (blockingNotificationId == null) return [];

  return [
    {
      source: "notification",
      kind: "blocking-notification",
      label: "Blocking notification",
      summary: null,
      componentId: blockingNotificationId,
      evidence: ["blockingNotificationId"],
    },
  ];
}

function notificationDecisions(
  notifications: Civ7ControlOrpcPlayNotificationViewResult | null
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
  turnCompletion: Civ7ControlOrpcTurnCompletionStatusResult
): Civ7ReadyUnitViewInput {
  const unitId =
    probeValue<Civ7ComponentId>(notifications.selectedUnitId) ??
    probeValue<Civ7ComponentId>(notifications.firstReadyUnitId) ??
    probeValue<Civ7ComponentId>(turnCompletion.firstReadyUnitId);
  return unitId == null ? {} : { unitId };
}

function readyCityInputFromNotifications(
  notifications: Civ7ControlOrpcPlayNotificationViewResult
): Civ7ReadyCityViewInput {
  const cityId =
    probeValue<Civ7ComponentId>(notifications.selectedCityId) ??
    componentIdFromUnknown(notifications.hud.nextDecision?.target) ??
    notifications.hud.decisionQueue
      .map((item) => componentIdFromUnknown(item.target))
      .find((id): id is Civ7ComponentId => id != null) ??
    null;
  return cityId == null ? {} : { cityId };
}

function readyUnitBlockers(
  readyUnit: Civ7ControlOrpcReadyUnitViewResult | null
): Civ7AttentionCurrentResult["blockers"] {
  if (readyUnit == null || readyUnit.unitId == null) return [];
  return [
    {
      source: "ready-unit",
      kind: "ready-unit",
      label: "Ready unit needs orders",
      summary: `${readyUnit.legalOperations.length} legal operations available`,
      componentId: readyUnit.unitId,
      evidence: readyUnitEvidence(readyUnit),
    },
  ];
}

function readyCityBlockers(
  readyCity: Civ7ControlOrpcReadyCityViewResult | null
): Civ7AttentionCurrentResult["blockers"] {
  const cityId = readyCity?.cityId ?? probeValue<Civ7ComponentId>(readyCity?.blockingCityId);
  if (cityId == null) return [];
  return [
    {
      source: "ready-city",
      kind: "ready-city",
      label: "Ready city needs a decision",
      summary: `${readyCity?.legalOperations.length ?? 0} legal operations available`,
      componentId: cityId,
      evidence: readyCity == null ? ["ready-city-view"] : readyCityEvidence(readyCity),
    },
  ];
}

function readyUnitActors(
  readyUnit: Civ7ControlOrpcReadyUnitViewResult | null
): Civ7AttentionCurrentResult["readyActors"] {
  if (readyUnit?.unitId == null) return [];
  return [
    {
      kind: "unit",
      componentId: readyUnit.unitId,
      operationCount: readyUnit.legalOperations.length,
      summary: "Ready unit",
      evidence: readyUnitEvidence(readyUnit),
    },
  ];
}

function readyCityActors(
  readyCity: Civ7ControlOrpcReadyCityViewResult | null
): Civ7AttentionCurrentResult["readyActors"] {
  if (readyCity == null || readyCity.cityId == null) return [];
  return [
    {
      kind: "city",
      componentId: readyCity.cityId,
      operationCount: readyCity.legalOperations.length,
      summary: "Ready city",
      evidence: readyCityEvidence(readyCity),
    },
  ];
}

function readyUnitEvidence(readyUnit: Civ7ControlOrpcReadyUnitViewResult): string[] {
  return readyUnit.host === "game-ui" ? ["game-ui-ready-unit-source"] : ["ready-unit-view"];
}

function readyCityEvidence(readyCity: Civ7ControlOrpcReadyCityViewResult): string[] {
  return readyCity.host === "game-ui" ? ["game-ui-ready-city-source"] : ["ready-city-view"];
}

function attentionNextSteps({
  playableStatus,
  sourceStatus,
  turnCompletion,
  notificationCoverageComplete,
  blockers,
  readyActors,
  readyActorsCovered,
}: Readonly<{
  playableStatus: Civ7ControlOrpcPlayableStatusResult;
  sourceStatus: Civ7AttentionCurrentResult["sourceStatus"];
  turnCompletion: Civ7ControlOrpcTurnCompletionStatusResult | null;
  notificationCoverageComplete: boolean;
  blockers: Civ7AttentionCurrentResult["blockers"];
  readyActors: Civ7AttentionCurrentResult["readyActors"];
  readyActorsCovered: boolean;
}>): Civ7AttentionCurrentResult["nextSteps"] {
  if (!playableStatus.playable && sourceStatus.notifications !== "read") {
    return [
      {
        kind: "restore-readiness",
        source: "readiness",
        label: "Restore playable Tuner/App UI readiness before reading attention.",
      },
    ];
  }

  const actorSteps = readyActors.map((actor) => ({
    kind: actor.kind === "unit" ? ("act-ready-unit" as const) : ("act-ready-city" as const),
    source: actor.kind === "unit" ? ("ready-unit" as const) : ("ready-city" as const),
    label: actor.kind === "unit" ? "Review ready unit orders." : "Review ready city decision.",
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

  if (readyActorsCovered && canRecommendEndTurn(turnCompletion)) {
    return [
      {
        kind: "end-turn",
        source: "attention",
        label: "No blockers found; end turn is available.",
      },
    ];
  }

  if (!notificationCoverageComplete) {
    return [
      {
        kind: "observe",
        source: "attention",
        label:
          "Notification coverage is truncated; inspect more attention evidence before concluding there are no blockers.",
      },
    ];
  }

  if (!readyActorsCovered) {
    return [
      {
        kind: "observe",
        source: "attention",
        label:
          "Ready actor coverage is incomplete; inspect ready unit and city evidence before concluding there are no blockers.",
      },
    ];
  }

  return [
    {
      kind: "observe",
      source: "attention",
      label: "No current blockers found.",
    },
  ];
}

function sourceReadStatus(
  attempted: boolean,
  result: Civ7ControlOrpcReadyUnitViewResult | Civ7ControlOrpcReadyCityViewResult | null
): Civ7AttentionCurrentResult["sourceStatus"]["readyUnit"] {
  if (!attempted || result == null) return "skipped-unsupported";
  if (result.host !== "game-ui") return "read";
  if ("unitId" in result) {
    return result.firstReadyUnitId.ok === true ? "read" : "skipped-unsupported";
  }
  const readyCityId = result.cityId ?? probeValue<Civ7ComponentId>(result.blockingCityId);
  return readyCityId == null ? "skipped-unsupported" : "read";
}

function canRecommendEndTurn(
  turnCompletion: Civ7ControlOrpcTurnCompletionStatusResult | null
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

function canReadAttentionCurrent(
  playableStatus: Civ7ControlOrpcPlayableStatusResult,
  context: Civ7ControlOrpcContext
): boolean {
  return (
    playableStatus.playable ||
    context.controller?.supportedReadProcedures?.includes("attention.current") === true
  );
}

function skippedSourceStatus(
  playableStatus: Civ7ControlOrpcPlayableStatusResult
): Civ7AttentionCurrentResult["sourceStatus"] {
  const skipped = playableStatus.playable ? "skipped-unsupported" : "skipped-not-playable";
  return {
    playableStatus: "read",
    notifications: skipped,
    turnCompletion: skipped,
    readyUnit: skipped,
    readyCity: skipped,
  };
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
