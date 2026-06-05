import {
  notificationDismissalProofPostcondition,
} from "@civ7/direct-control";
import { Effect } from "effect";

import type { Civ7ControlOrpcNotificationDismissalResult } from "../../../dependencies/direct-control";
import { civ7MutationApprovalMiddleware } from "../../../middleware/mutation-approval";
import { civ7MutationReadinessMiddleware } from "../../../middleware/mutation-readiness";
import { civ7ControlOrpcErrorCorrelationData } from "../../../model/correlation";
import {
  civ7CloseoutMutationProjection,
} from "../../../policy/mutation-result";
import { civ7ControlOrpcImplementer } from "../../../procedure";
import type { Civ7NotificationDismissalResult } from "../contract";

const notificationsDismissRequestWithApproval =
  civ7ControlOrpcImplementer.notifications.dismiss.request.use(
    civ7MutationApprovalMiddleware,
  );
const notificationsDismissRequestReady =
  notificationsDismissRequestWithApproval.use(civ7MutationReadinessMiddleware);

export const notificationsDismissRequestProcedure =
  notificationsDismissRequestReady.effect(function* ({
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
    doNotRepeatLabel: "Do not repeat this dismissal request until fresh attention and notification evidence is read.",
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
