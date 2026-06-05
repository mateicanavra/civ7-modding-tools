import {
  notificationDismissalProofPostcondition,
} from "@civ7/direct-control";
import { Effect } from "effect";

import type { Civ7ControlOrpcNotificationDismissalResult } from "../../../dependencies/direct-control";
import { civ7MutationApprovalMiddleware } from "../../../middleware/mutation-approval";
import { civ7ControlOrpcErrorCorrelationData } from "../../../model/correlation";
import {
  civ7MutationNextSteps,
  civ7MutationRequestStatusWithoutGuarded,
} from "../../../policy/mutation-result";
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
            ...civ7ControlOrpcErrorCorrelationData(context),
          },
        }),
    });
  });

function notificationDismissalResult(
  result: Civ7ControlOrpcNotificationDismissalResult,
): Civ7NotificationDismissalResult {
  const postcondition = notificationDismissalPostconditionSummary(result);
  const status = civ7MutationRequestStatusWithoutGuarded({
    sent: result.sent,
    postcondition,
  });

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
    nextSteps: civ7MutationNextSteps({
      status,
      postcondition,
      source: "notifications.dismiss.request",
      inspectKind: "inspect-notification",
      inspectLabel: "Inspect notification state before attempting another dismissal request.",
      doNotRepeatLabel: "Do not repeat this dismissal request until fresh attention and notification evidence is read.",
    }),
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
