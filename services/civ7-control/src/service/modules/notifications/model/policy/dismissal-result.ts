import { notificationDismissalProofPostcondition } from "@civ7/direct-control/proof/notification-dismissal-proof-policy";
import { civ7CloseoutMutationProjection } from "#civ7-control-service/model/policy/mutation-result";
import type { Civ7ControlOrpcNotificationDismissalResult } from "#civ7-control-service/model/ports/direct-control";
import type { Civ7NotificationDismissalResult } from "#civ7-control-service/modules/notifications/contract/index";

export function notificationDismissalResult(
  result: Civ7ControlOrpcNotificationDismissalResult
): Civ7NotificationDismissalResult {
  const projection = civ7CloseoutMutationProjection({
    sent: result.sent,
    postcondition: notificationDismissalProofPostcondition(result, undefined),
    missing: {
      classification: "missing-postcondition",
      reason: "The notification dismissal result did not include explicit postcondition evidence.",
      outcome: result.sent ? "unknown" : "not-sent",
    },
    source: "notifications.dismiss.request",
    inspectKind: "inspect-notification",
    inspectLabel: "Inspect notification state before attempting another dismissal request.",
    doNotRepeatLabel:
      "Do not repeat this dismissal request until fresh attention and notification evidence is read.",
  });

  return {
    notificationId: result.notificationId,
    sent: result.sent,
    status: projection.status,
    validation: {
      beforeExists: result.before.exists,
      canDismiss: result.canDismiss,
      afterExists: result.after?.exists ?? null,
    },
    postcondition: projection.postcondition as Civ7NotificationDismissalResult["postcondition"],
    nextSteps: projection.nextSteps,
  };
}
