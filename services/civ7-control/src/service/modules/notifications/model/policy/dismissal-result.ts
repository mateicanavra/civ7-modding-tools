import type { Civ7ControlOrpcComponentId } from "#civ7-control-service/model/dto/primitives";
import type {
  Civ7ControlOrpcNotificationDismissalCheckResult,
  Civ7ControlOrpcNotificationDismissalSnapshot,
} from "#civ7-control-service/model/ports/direct-control";
import type { Civ7NotificationDismissalResult } from "../../contract";

const advisorWarningTypeNames = [
  "NOTIFICATION_ADVISOR_WARNING_SCIENCE",
  "NOTIFICATION_ADVISOR_WARNING_CULTURE",
  "NOTIFICATION_ADVISOR_WARNING_ECONOMIC",
  "NOTIFICATION_ADVISOR_WARNING_MILITARY",
] as const;

type AdvisorWarningTypeName = (typeof advisorWarningTypeNames)[number];
type NotificationDismissalPostcondition = Civ7NotificationDismissalResult["postcondition"];

export type Civ7NotificationDismissalPostconditionEvidence =
  | Readonly<{ kind: "not-admitted" }>
  | Readonly<{ kind: "not-dispatched" }>
  | Readonly<{ kind: "postcheck-unavailable" }>
  | Readonly<{
      kind: "observed";
      before: Civ7ControlOrpcNotificationDismissalSnapshot;
      after: Civ7ControlOrpcNotificationDismissalSnapshot;
    }>;

export type Civ7NotificationDismissalDispatchState = "not-sent" | "sent" | "unknown";

/**
 * Generic dismissal follows the native close guard and excludes the four
 * AdvisorWarning overrides, which require the dedicated viewed request.
 */
export function notificationDismissalAvailable(
  check: Civ7ControlOrpcNotificationDismissalCheckResult
): boolean {
  const snapshot = check.snapshot;
  return (
    validLocalPlayerId(snapshot.localPlayerId) &&
    snapshot.notificationId.owner === snapshot.localPlayerId &&
    snapshot.exists &&
    snapshot.activeQueue.ok &&
    snapshot.activeQueue.value &&
    snapshot.canUserDismiss.ok &&
    snapshot.canUserDismiss.value &&
    snapshot.typeName !== null &&
    snapshot.typeName.length > 0 &&
    !isAdvisorWarningNotificationType(snapshot.typeName)
  );
}

export function isAdvisorWarningNotificationType(
  typeName: string | null
): typeName is AdvisorWarningTypeName {
  return advisorWarningTypeNames.some((excluded) => excluded === typeName);
}

export function civ7NotificationDismissalPostcondition(
  evidence: Civ7NotificationDismissalPostconditionEvidence
): NotificationDismissalPostcondition {
  if (evidence.kind === "not-admitted") {
    return notSentPostcondition(
      "Fresh native notification evidence did not admit generic dismissal, so no close request was attempted."
    );
  }
  if (evidence.kind === "not-dispatched") {
    return notSentPostcondition(
      "The guarded send failed before the native notification dismissal call was invoked."
    );
  }
  if (evidence.kind === "postcheck-unavailable") {
    return missingPostcondition(
      "No readable notification evidence was available before the dismissal polling deadline."
    );
  }
  if (!coherentSnapshots(evidence.before, evidence.after)) {
    return missingPostcondition(
      "The notification dismissal observations did not provide one coherent target and local-player identity."
    );
  }
  if (!evidence.after.exists) {
    return confirmedPostcondition(
      "notification-disappeared",
      "The exact notification no longer exists in the engine notification registry."
    );
  }
  if (evidence.after.activeQueue.ok && !evidence.after.activeQueue.value) {
    return confirmedPostcondition(
      "active-queue-removed",
      "The exact notification no longer appears in the active engine notification queue."
    );
  }
  if (
    evidence.after.dismissed.ok &&
    evidence.after.dismissed.value &&
    !(evidence.after.activeQueue.ok && evidence.after.activeQueue.value)
  ) {
    return confirmedPostcondition(
      "notification-dismissed",
      "The exact notification reports dismissed without evidence that it remains active."
    );
  }
  if (evidence.after.activeQueue.ok && evidence.after.activeQueue.value) {
    return {
      classification: "notification-still-active",
      reason: "The exact notification remains in the active engine notification queue.",
      outcome: "still-active",
      confidence: "unverified",
      confirmed: false,
      noRepeatAfterUnverified: true,
    };
  }
  return missingPostcondition(
    "The notification still exists, but active-queue and dismissed evidence did not prove target-specific clearance."
  );
}

export function notificationDismissalResult(
  notificationId: Civ7ControlOrpcComponentId,
  dispatchState: Civ7NotificationDismissalDispatchState,
  evidence: Civ7NotificationDismissalPostconditionEvidence
): Civ7NotificationDismissalResult {
  const postcondition = civ7NotificationDismissalPostcondition(evidence);

  if (dispatchState === "not-sent") {
    if (postcondition.classification !== "not-sent") {
      throw new Error("Notification dismissal that was not sent must report not-sent.");
    }
    return {
      notificationId,
      status: "not-sent",
      postcondition,
      nextSteps: [
        {
          kind: "inspect-notification",
          source: "notifications.dismiss.request",
          label: `Read fresh native dismissal availability for notification ${formatComponentId(notificationId)} before another request.`,
        },
      ],
    };
  }

  if (postcondition.confidence === "confirmed") {
    return {
      notificationId,
      status: "sent-confirmed",
      postcondition,
      nextSteps: [
        {
          kind: "refresh-attention",
          source: "notifications.dismiss.request",
          label: "Refresh current attention before choosing the next player action.",
        },
      ],
    };
  }
  if (postcondition.classification === "not-sent") {
    throw new Error("A possible notification dismissal dispatch cannot report not-sent.");
  }

  return {
    notificationId,
    status: dispatchState === "unknown" ? "dispatch-unknown" : "sent-unverified",
    postcondition,
    nextSteps: [
      {
        kind: "do-not-repeat",
        source: "notifications.dismiss.request",
        label: `Do not repeat dismissal of notification ${formatComponentId(notificationId)} until fresh native evidence proves it is still actionable.`,
      },
    ],
  };
}

function coherentSnapshots(
  before: Civ7ControlOrpcNotificationDismissalSnapshot,
  after: Civ7ControlOrpcNotificationDismissalSnapshot
): boolean {
  return (
    validLocalPlayerId(before.localPlayerId) &&
    before.localPlayerId === after.localPlayerId &&
    componentIdsEqual(before.notificationId, after.notificationId)
  );
}

function componentIdsEqual(
  left: Civ7ControlOrpcComponentId,
  right: Civ7ControlOrpcComponentId
): boolean {
  return (
    left.owner === right.owner &&
    left.id === right.id &&
    (left.type === right.type || (left.type === undefined && right.type === undefined))
  );
}

function validLocalPlayerId(playerId: number): boolean {
  return Number.isInteger(playerId) && playerId >= 0;
}

function notSentPostcondition(
  reason: string
): Extract<NotificationDismissalPostcondition, { classification: "not-sent" }> {
  return {
    classification: "not-sent",
    reason,
    outcome: "not-sent",
    confidence: "unverified",
    confirmed: false,
    noRepeatAfterUnverified: true,
  };
}

function missingPostcondition(
  reason: string
): Extract<NotificationDismissalPostcondition, { classification: "missing-postcondition" }> {
  return {
    classification: "missing-postcondition",
    reason,
    outcome: "unknown",
    confidence: "unverified",
    confirmed: false,
    noRepeatAfterUnverified: true,
  };
}

function confirmedPostcondition(
  classification: Extract<
    NotificationDismissalPostcondition,
    { confidence: "confirmed" }
  >["classification"],
  reason: string
): Extract<NotificationDismissalPostcondition, { confidence: "confirmed" }> {
  return {
    classification,
    reason,
    outcome: "cleared",
    confidence: "confirmed",
    confirmed: true,
    noRepeatAfterUnverified: false,
  };
}

function formatComponentId(id: Civ7ControlOrpcComponentId): string {
  return `${id.owner}:${id.id}:${id.type ?? "?"}`;
}
