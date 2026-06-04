import {
  notificationDismissalProofPostcondition,
} from "@civ7/direct-control";
import { Effect } from "effect";

import type { Civ7ControlOrpcNotificationDismissalResult } from "../../../dependencies/direct-control";
import { civ7MutationApprovalMiddleware } from "../../../middleware/mutation-approval";
import { civ7ControlOrpcImplementer } from "../../../procedure";
import type { Civ7NotificationDismissalResult } from "../contract";

const notificationsDismissRequestWithApproval =
  civ7ControlOrpcImplementer.notifications.dismiss.request.use(
    civ7MutationApprovalMiddleware,
  );

export const notificationsDismissRequestProcedure =
  notificationsDismissRequestWithApproval.effect(function* ({
    context,
    errors,
    input,
  }) {
    return yield* Effect.tryPromise({
      try: async () => {
        const result =
          await context.directControl.requestCiv7NotificationDismissal(
            input,
            context.endpointDefaults,
            context.approval,
          );
        return notificationDismissalResult(result);
      },
      catch: () =>
        errors.NOTIFICATION_DISMISSAL_UNAVAILABLE({
          data: {
            procedureKey: "notifications.dismiss.request",
            source: "direct-control-facade",
          },
        }),
    });
  });

function notificationDismissalResult(
  result: Civ7ControlOrpcNotificationDismissalResult,
): Civ7NotificationDismissalResult {
  const postcondition = notificationDismissalPostconditionSummary(result);
  const status = notificationDismissalStatus(result, postcondition);

  return {
    notificationId: result.notificationId,
    sent: result.sent,
    status,
    validation: {
      beforeExists: result.before.exists,
      canDismiss: result.canDismiss,
      afterExists: result.after?.exists ?? null,
    },
    postcondition,
    nextSteps: notificationDismissalNextSteps(status, postcondition),
  };
}

function notificationDismissalPostconditionSummary(
  result: Civ7ControlOrpcNotificationDismissalResult,
): Civ7NotificationDismissalResult["postcondition"] {
  const postcondition = notificationDismissalProofPostcondition(
    result,
    undefined,
  );
  if (postcondition == null) {
    return {
      classification: "missing-postcondition",
      reason: "The notification dismissal result did not include explicit postcondition evidence.",
      outcome: result.sent ? "unknown" : "not-sent",
      confidence: "unverified",
      confirmed: false,
      noRepeatAfterUnverified: true,
    };
  }

  return {
    classification: postcondition.classification as
      Civ7NotificationDismissalResult["postcondition"]["classification"],
    reason: postcondition.reason,
    outcome: postcondition.outcome,
    confidence: postcondition.confidence,
    confirmed: postcondition.confidence === "confirmed"
      && !postcondition.noRepeatAfterUnverified,
    noRepeatAfterUnverified: postcondition.noRepeatAfterUnverified,
  };
}

function notificationDismissalStatus(
  result: Civ7ControlOrpcNotificationDismissalResult,
  postcondition: Civ7NotificationDismissalResult["postcondition"],
): Civ7NotificationDismissalResult["status"] {
  if (!result.sent) return "not-sent";
  return postcondition.confirmed ? "sent-confirmed" : "sent-unverified";
}

function notificationDismissalNextSteps(
  status: Civ7NotificationDismissalResult["status"],
  postcondition: Civ7NotificationDismissalResult["postcondition"],
): Civ7NotificationDismissalResult["nextSteps"] {
  if (status === "not-sent") {
    return [{
      kind: "inspect-notification",
      source: "notifications.dismiss.request",
      label: "Inspect notification state before attempting another dismissal request.",
    }];
  }
  if (postcondition.noRepeatAfterUnverified) {
    return [{
      kind: "do-not-repeat",
      source: "notifications.dismiss.request",
      label: "Do not repeat this dismissal request until fresh attention and notification evidence is read.",
    }];
  }
  return [{
    kind: "refresh-attention",
    source: "notifications.dismiss.request",
    label: "Refresh current attention before choosing the next player action.",
  }];
}
