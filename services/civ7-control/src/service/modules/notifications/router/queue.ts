import { Cause, Effect, Either } from "effect";
import { civ7ControlOrpcMutationProcedure } from "#civ7-control-service/middleware/mutation-procedure";
import {
  civ7ControlOrpcErrorCorrelationData,
  civ7ControlOrpcFailureDetail,
} from "#civ7-control-service/model/dto/correlation";
import type { Civ7ControlOrpcPlayNotificationViewResult } from "#civ7-control-service/model/ports/direct-control";
import type {
  Civ7NotificationDismissalResult,
  Civ7NotificationQueueDismissResult,
  Civ7NotificationQueueResult,
} from "../contract";
import { dismissCiv7Notification } from "../model/policy/dismissal-execution";
import { isAdvisorWarningNotificationType } from "../model/policy/dismissal-result";
import { module } from "../module";

type QueueItem = Civ7ControlOrpcPlayNotificationViewResult["hud"]["decisionQueue"][number];
type QueueStep = Civ7NotificationQueueResult["schedule"][number];
type QueueNextStep = NonNullable<QueueStep["nextStep"]>;
type ExcludedNotification = Civ7NotificationQueueDismissResult["excluded"][number];
type QueueStopReason = Civ7NotificationQueueDismissResult["stopReason"];
type Probe<T = unknown> =
  | {
      ok: true;
      value: T;
    }
  | {
      ok: false;
      error: string;
    };

export const queue = {
  notificationsQueueCurrentProcedure: module.queue.current.effect(function* ({
    context,
    errors,
    input,
  }) {
    return yield* Effect.tryPromise({
      try: async () => {
        const view = await context.directControl.getCiv7PlayNotificationView({
          ...context.endpointDefaults,
          maxNotifications: input.maxNotifications ?? 50,
        });
        return notificationQueueResult(view);
      },
      catch: (cause) =>
        errors.NOTIFICATION_QUEUE_UNAVAILABLE({
          data: {
            detail: civ7ControlOrpcFailureDetail(cause),
            procedureKey: "notifications.queue.current",
            source: "direct-control-facade",
            ...civ7ControlOrpcErrorCorrelationData(context),
          },
        }),
    });
  }),
  notificationsQueueDismissRequestProcedure: civ7ControlOrpcMutationProcedure(
    module.queue.dismiss.request
  ).effect(function* ({ context, errors, input }) {
    return yield* Effect.gen(function* () {
      const view = yield* Effect.tryPromise({
        try: () =>
          context.directControl.getCiv7PlayNotificationView({
            ...context.endpointDefaults,
            maxNotifications: input.maxNotifications ?? 50,
          }),
        catch: (cause) => new Cause.UnknownException(cause),
      });
      const { candidates, excluded } = classifyQueue(view.hud.decisionQueue);
      const maxDismissals = input.maxDismissals ?? 10;
      const selected = candidates.slice(0, maxDismissals);
      const results: Civ7NotificationDismissalResult[] = [];
      const send = input.send === true;
      let stopReason: QueueStopReason = null;
      if (send) {
        for (const candidate of selected) {
          if (candidate.notificationId == null) continue;
          const attempt = yield* dismissCiv7Notification(
            { notificationId: candidate.notificationId },
            context
          ).pipe(Effect.either);
          if (Either.isLeft(attempt)) {
            if (!results.some(notificationDismissalPossiblyDispatched)) {
              return yield* Effect.fail(attempt.left);
            }
            stopReason = "source-unavailable";
            break;
          }
          const result = attempt.right;
          results.push(result);
          if (result.status === "dispatch-unknown" || result.status === "sent-unverified") {
            stopReason = "uncertain-result";
            break;
          }
        }
      }
      return notificationQueueDismissResult({
        view,
        candidates,
        excluded,
        selected,
        results,
        send,
        maxDismissals,
        stopReason,
      });
    }).pipe(
      Effect.mapError((cause) =>
        errors.NOTIFICATION_QUEUE_UNAVAILABLE({
          data: {
            detail: civ7ControlOrpcFailureDetail(cause),
            procedureKey: "notifications.queue.dismiss.request",
            source: "direct-control-facade",
            ...civ7ControlOrpcErrorCorrelationData(context),
          },
        })
      )
    );
  }),
};
function notificationQueueResult(
  view: Civ7ControlOrpcPlayNotificationViewResult
): Civ7NotificationQueueResult {
  const schedule = buildNotificationSchedule(view.hud.decisionQueue);
  return {
    localPlayerId: view.localPlayerId,
    turn: view.turn,
    turnDate: view.turnDate,
    blocker: view.blocker,
    blockingNotificationId: probeValue(view.blockingNotificationId),
    canEndTurn: view.canEndTurn,
    limits: view.limits,
    queueLength: view.hud.decisionQueue.length,
    schedule,
    nextSteps: schedule
      .map((item) => item.nextStep)
      .filter((item): item is QueueNextStep => item != null),
    notes: [
      "Read-only notification queue scheduler; it does not dismiss notifications or send player/unit/city operations.",
      "Informational dismissal candidates require summary and context review plus item-scoped validator-backed dismissal.",
      "Operation steps are templates. Re-read live inputs and validate against the current surface before mutating.",
    ],
  };
}
function notificationQueueDismissResult(
  input: Readonly<{
    view: Civ7ControlOrpcPlayNotificationViewResult;
    candidates: QueueStep[];
    excluded: ExcludedNotification[];
    selected: QueueStep[];
    results: Civ7NotificationDismissalResult[];
    send: boolean;
    maxDismissals: number;
    stopReason: QueueStopReason;
  }>
): Civ7NotificationQueueDismissResult {
  const allConfirmed =
    input.send &&
    input.selected.length > 0 &&
    input.results.length === input.selected.length &&
    input.results.every((result) => result.status === "sent-confirmed");
  const partiallyConfirmed =
    input.send &&
    input.results.length === input.selected.length &&
    input.results.some((result) => result.status === "sent-confirmed") &&
    input.results.some((result) => result.status === "not-sent") &&
    input.results.every(
      (result) => result.status === "sent-confirmed" || result.status === "not-sent"
    );
  const status = notificationQueueDismissStatus(input, allConfirmed, partiallyConfirmed);
  const postcondition =
    status === "not-sent"
      ? {
          classification: "not-sent" as const,
          reason: input.send
            ? "No selected notification produced a possible or confirmed runtime dispatch."
            : "Dry run only; no notification dismissal was sent.",
          outcome: "not-sent" as const,
          confidence: "unverified" as const,
          confirmed: false,
          noRepeatAfterUnverified: true,
        }
      : status === "sent-confirmed"
        ? {
            classification: "all-selected-confirmed" as const,
            reason: "Every selected notification dismissal had confirmed postcondition evidence.",
            outcome: "cleared" as const,
            confidence: "confirmed" as const,
            confirmed: true,
            noRepeatAfterUnverified: false,
          }
        : status === "partially-confirmed"
          ? {
              classification: "selection-partially-confirmed" as const,
              reason:
                "Every planned notification was processed; some dismissals were confirmed and the remainder were definitively not dispatched.",
              outcome: "partially-cleared" as const,
              confidence: "confirmed" as const,
              confirmed: true,
              noRepeatAfterUnverified: false,
            }
          : {
              classification: "selection-unverified" as const,
              reason: notificationQueueUnverifiedReason(input.stopReason),
              outcome: "unknown" as const,
              confidence: "unverified" as const,
              confirmed: false,
              noRepeatAfterUnverified: true,
            };
  return {
    localPlayerId: input.view.localPlayerId,
    turn: input.view.turn,
    turnDate: input.view.turnDate,
    blocker: input.view.blocker,
    blockingNotificationId: probeValue(input.view.blockingNotificationId),
    canEndTurn: input.view.canEndTurn,
    queueLength: input.view.hud.decisionQueue.length,
    status,
    postcondition,
    maxDismissals: input.maxDismissals,
    eligibleCount: input.candidates.length,
    plannedCount: input.selected.length,
    processedCount: input.results.length,
    remainingCount: Math.max(0, input.selected.length - input.results.length),
    stopReason: input.stopReason,
    omittedEligibleCount: Math.max(0, input.candidates.length - input.selected.length),
    candidates: input.selected,
    excluded: input.excluded,
    results: input.results,
    noRepeatAfterUnverified: postcondition.noRepeatAfterUnverified,
    nextSteps:
      status === "sent-confirmed" || status === "partially-confirmed"
        ? [
            {
              kind: "refresh-attention",
              source: "notifications.queue.dismiss.request",
              label:
                "Re-read notification queue and attention state before making further decisions.",
            },
          ]
        : status === "not-sent"
          ? [
              {
                kind: "inspect-notification",
                source: "notifications.queue.dismiss.request",
                label: input.send
                  ? "Inspect fresh notification evidence before another reviewed queue request."
                  : "Dry run only; inspect the selected notification evidence before sending.",
              },
            ]
          : [
              {
                kind: "do-not-repeat",
                source: "notifications.queue.dismiss.request",
                label: "Do not repeat bulk dismissal until fresh notification evidence is read.",
              },
              {
                kind: "inspect-notification",
                source: "notifications.queue.dismiss.request",
                label: "Inspect selected notification evidence before any repeat attempt.",
              },
            ],
    notes: [
      notificationQueueDismissDispatchNote(input.send, status, input.stopReason),
      "Operation-bearing, unit-command, production, diplomacy, narrative, progression, population, and unclassified notifications are excluded.",
      "The aggregate distinguishes complete confirmation, fully known partial completion, and uncertain processing.",
      "Re-read the queue after this procedure before making further decisions.",
    ],
  };
}

function notificationQueueDismissStatus(
  input: Readonly<{
    results: Civ7NotificationDismissalResult[];
    send: boolean;
    selected: QueueStep[];
    stopReason: QueueStopReason;
  }>,
  allConfirmed: boolean,
  partiallyConfirmed: boolean
): Civ7NotificationQueueDismissResult["status"] {
  if (!input.send || input.results.length === 0) return "not-sent";
  if (input.results.some((result) => result.status === "dispatch-unknown")) {
    return "dispatch-unknown";
  }
  if (allConfirmed) return "sent-confirmed";
  if (partiallyConfirmed) return "partially-confirmed";
  if (
    input.stopReason !== null ||
    input.results.length < input.selected.length ||
    input.results.some(
      (result) => result.status === "sent-confirmed" || result.status === "sent-unverified"
    )
  ) {
    return "sent-unverified";
  }
  return "not-sent";
}

function notificationQueueDismissDispatchNote(
  send: boolean,
  status: Civ7NotificationQueueDismissResult["status"],
  stopReason: QueueStopReason
): string {
  if (!send) {
    return "Dry run only. Set send=true to dismiss eligible informational closeout candidates.";
  }
  if (status === "not-sent") {
    return "No selected notification dismissal was dispatched.";
  }
  if (status === "dispatch-unknown") {
    return "At least one selected notification dismissal has an unknown dispatch outcome.";
  }
  if (stopReason === "source-unavailable") {
    return "Processing stopped when native notification evidence became unavailable; completed item results are preserved.";
  }
  if (stopReason === "uncertain-result") {
    return "Processing stopped after the first uncertain item result; completed item results are preserved.";
  }
  if (status === "partially-confirmed") {
    return "Some planned dismissals were confirmed while the remaining processed items were definitively not dispatched.";
  }
  return "Dismissal was dispatched only for eligible informational closeout candidates selected from a fresh HUD queue read.";
}

function notificationQueueUnverifiedReason(stopReason: QueueStopReason): string {
  if (stopReason === "source-unavailable") {
    return "Native notification evidence became unavailable before every planned item was processed.";
  }
  if (stopReason === "uncertain-result") {
    return "Processing stopped after an item lacked confirmed postcondition evidence.";
  }
  return "At least one planned notification dismissal lacked confirmed postcondition evidence.";
}

function notificationDismissalPossiblyDispatched(result: Civ7NotificationDismissalResult): boolean {
  return result.status !== "not-sent";
}

function buildNotificationSchedule(queue: ReadonlyArray<QueueItem>): QueueStep[] {
  return queue
    .map((item, index) => buildQueueStep(item, index + 1))
    .sort((left, right) => right.priority - left.priority || left.step - right.step)
    .map((item, index) => ({ ...item, step: index + 1 }));
}
function classifyQueue(queue: ReadonlyArray<QueueItem>): {
  candidates: QueueStep[];
  excluded: ExcludedNotification[];
} {
  const candidates: QueueStep[] = [];
  const excluded: ExcludedNotification[] = [];
  for (const item of buildNotificationSchedule(queue)) {
    if (item.disposition === "reviewed-dismissal-candidate" && item.safeToBatch) {
      candidates.push(item);
      continue;
    }
    excluded.push({
      notificationId: item.notificationId,
      category: item.category,
      typeName: item.typeName,
      summary: item.summary,
      isEndTurnBlocking: item.isEndTurnBlocking,
      reason: exclusionReason(item),
    });
  }
  return { candidates, excluded };
}
function buildQueueStep(item: QueueItem, originalStep: number): QueueStep {
  const disposition = dispositionFor(item);
  const requiredInputs = item.requiredInputs
    .filter((input) => input.required)
    .map((input) => input.name);
  const isDismissalCandidate = disposition === "reviewed-dismissal-candidate";
  const safeToBatch = isDismissalCandidate && isBatchSafeDismissalCandidate(item);
  const guardrails = guardrailsFor(item, disposition, requiredInputs);
  const operationFamily = stringValueOrUndefined(item.operationFamily);
  const operationType = stringValueOrUndefined(item.operationType);
  return {
    step: originalStep,
    priority: priorityFor(item, disposition),
    disposition,
    notificationId: item.notificationId,
    isEndTurnBlocking: item.isEndTurnBlocking,
    category: item.category,
    typeName: item.typeName,
    summary: item.summary,
    message: item.message,
    ...(operationFamily == null ? {} : { operationFamily }),
    ...(operationType == null ? {} : { operationType }),
    requiredInputs,
    nextStep: nextStepFor(item, disposition, operationFamily, operationType),
    safeToBatch,
    reason: reasonFor(item, disposition),
    guardrails: isDismissalCandidate
      ? [
          "Review the message and context first; this schedule only identifies an eligible dismissal candidate.",
          ...guardrails,
        ]
      : guardrails,
  };
}
function dispositionFor(item: QueueItem): QueueStep["disposition"] {
  if (isAdvisorWarningNotificationType(item.typeName)) return "inspect-handler";
  if (item.category === "informational-notification" && item.operationFamily === "app-ui-action") {
    return "reviewed-dismissal-candidate";
  }
  if (item.category === "unit-command") return "inspect-ready-unit";
  if (item.operationFamily) return "operate-with-live-inputs";
  if (item.category === "notification" || item.category === "blocking-notification") {
    return "inspect-handler";
  }
  return "review-only";
}
function isBatchSafeDismissalCandidate(item: QueueItem): boolean {
  if (item.notificationId == null) return false;
  if (item.operationType !== "Game.Notifications.dismiss") return false;
  if (isAdvisorWarningNotificationType(item.typeName)) return false;
  if (!item.isEndTurnBlocking) return true;
  return item.typeName !== "NOTIFICATION_UNIT_LOST";
}
function priorityFor(item: QueueItem, disposition: QueueStep["disposition"]): number {
  if (item.isEndTurnBlocking) return 100;
  if (disposition === "operate-with-live-inputs") return 70;
  if (disposition === "inspect-ready-unit") return 65;
  if (disposition === "inspect-handler") return 50;
  if (disposition === "reviewed-dismissal-candidate") return 35;
  return 20;
}
function reasonFor(item: QueueItem, disposition: QueueStep["disposition"]): string {
  if (item.isEndTurnBlocking) {
    return "End-turn blocker; resolve or consciously defer before broad tactical planning.";
  }
  if (disposition === "reviewed-dismissal-candidate") {
    return "Default-handler informational notification; useful for context, but closeout must stay item-scoped and postcondition-checked.";
  }
  if (disposition === "inspect-ready-unit") {
    return "Unit command notification needs the current ready unit and target-specific validators.";
  }
  if (disposition === "operate-with-live-inputs") {
    return "Known operation family; required live inputs must be read from the current surface before send.";
  }
  if (disposition === "inspect-handler") {
    return "Unclassified notification; inspect official handler or live UI before choosing any operation.";
  }
  return "Queue context item; keep for strategy or tactics but do not mutate from this schedule alone.";
}
function exclusionReason(item: QueueStep): string {
  if (item.notificationId == null) return "missing notification id";
  if (isAdvisorWarningNotificationType(item.typeName)) {
    return "advisor warnings require the dedicated viewed acknowledgement, not generic dismissal";
  }
  if (item.isEndTurnBlocking && item.typeName === "NOTIFICATION_UNIT_LOST") {
    return "front unit-loss reports require exact reviewed dismissal proof, not bulk dismissal";
  }
  if (item.category === "unit-command") return "unit command requires ready-unit inspection";
  if (item.operationFamily != null && item.operationFamily !== "app-ui-action") {
    return "gameplay operation requires live inputs and validator-backed command";
  }
  if (item.category === "notification" || item.category === "blocking-notification") {
    return "unclassified notification needs handler evidence first";
  }
  if (item.category === "informational-notification") {
    return "informational item is not exposed as App UI dismissal by the live HUD";
  }
  return "not an informational closeout candidate";
}
function guardrailsFor(
  item: QueueItem,
  disposition: QueueStep["disposition"],
  requiredInputs: ReadonlyArray<string>
): string[] {
  const guardrails: string[] = [];
  if (requiredInputs.length > 0 && disposition !== "reviewed-dismissal-candidate") {
    guardrails.push(`Read required live inputs first: ${requiredInputs.join(", ")}.`);
  }
  if (item.location && typeof item.location === "object") {
    guardrails.push(
      "Use the reported location as tactical context, not as proof of a valid operation target."
    );
  }
  if (disposition === "operate-with-live-inputs") {
    guardrails.push(
      "Validate against the current domain surface; this schedule does not prove the args."
    );
  }
  if (disposition === "inspect-handler") {
    guardrails.push("Do not dismiss unclassified notifications in bulk.");
  }
  return guardrails;
}
function nextStepFor(
  item: QueueItem,
  disposition: QueueStep["disposition"],
  operationFamily: string | undefined,
  operationType: string | undefined
): QueueNextStep | null {
  const baseParameters = {
    ...(item.notificationId == null ? {} : { notificationId: item.notificationId }),
    category: item.category,
    ...(operationFamily == null ? {} : { operationFamily }),
    ...(operationType == null ? {} : { operationType }),
  };
  if (disposition === "reviewed-dismissal-candidate") {
    return {
      kind: "dismiss-notification",
      source: "notifications.queue.current",
      label:
        "Review and dismiss this informational notification with the item-scoped dismissal request.",
      parameters: baseParameters,
    };
  }
  if (disposition === "inspect-ready-unit") {
    return {
      kind: "inspect-ready-unit",
      source: "notifications.queue.current",
      label: "Inspect current ready unit before choosing a unit operation.",
      parameters: baseParameters,
    };
  }
  if (disposition === "operate-with-live-inputs") {
    return {
      kind: operationFamily === "city-command" ? "inspect-ready-city" : "validate-operation",
      source: "notifications.queue.current",
      label: "Read current domain evidence and validation before mutating.",
      parameters: baseParameters,
    };
  }
  if (disposition === "inspect-handler") {
    return {
      kind: "inspect-notification",
      source: "notifications.queue.current",
      label: "Inspect handler evidence before acting on this notification.",
      parameters: baseParameters,
    };
  }
  return {
    kind: "observe",
    source: "notifications.queue.current",
    label: "Keep this queue item as read-only context.",
    parameters: baseParameters,
  };
}
function stringValueOrUndefined(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}
function probeValue<T>(probe: Probe<T> | null | undefined): T | null {
  return probe?.ok ? probe.value : null;
}
