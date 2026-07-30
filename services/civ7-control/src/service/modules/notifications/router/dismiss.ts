import { Effect } from "effect";

import { civ7ControlOrpcMutationProcedure } from "#civ7-control-service/middleware/mutation-procedure";
import {
  civ7ControlOrpcErrorCorrelationData,
  civ7ControlOrpcFailureDetail,
} from "#civ7-control-service/model/dto/correlation";
import type { Civ7ControlOrpcContext } from "#civ7-control-service/model/ports/context";
import type { Civ7NotificationDismissalCheckResult } from "../contract";
import { dismissCiv7Notification } from "../model/policy/dismissal-execution";
import { notificationDismissalAvailable } from "../model/policy/dismissal-result";
import { module } from "../module";

/** Service-owned availability, guarded dispatch, and bounded clearance observation. */
export const dismiss = {
  check: module.dismiss.check.effect(function* ({ context, errors, input }) {
    const check = yield* Effect.tryPromise({
      try: () =>
        context.directControl.checkCiv7NotificationDismissal(input, context.endpointDefaults),
      catch: (cause) =>
        errors.NOTIFICATION_DISMISSAL_UNAVAILABLE({
          data: notificationDismissalUnavailableData("notifications.dismiss.check", cause, context),
        }),
    });
    return {
      notificationId: input.notificationId,
      available: notificationDismissalAvailable(check),
    } satisfies Civ7NotificationDismissalCheckResult;
  }),
  request: civ7ControlOrpcMutationProcedure(module.dismiss.request).effect(function* ({
    context,
    errors,
    input,
  }) {
    return yield* dismissCiv7Notification(input, context).pipe(
      Effect.mapError((cause) =>
        errors.NOTIFICATION_DISMISSAL_UNAVAILABLE({
          data: notificationDismissalUnavailableData(
            "notifications.dismiss.request",
            cause,
            context
          ),
        })
      )
    );
  }),
};

function notificationDismissalUnavailableData(
  procedureKey: "notifications.dismiss.check" | "notifications.dismiss.request",
  cause: unknown,
  context: Civ7ControlOrpcContext
) {
  const source: "direct-control-facade" = "direct-control-facade";
  return {
    detail: civ7ControlOrpcFailureDetail(cause),
    procedureKey,
    source,
    ...civ7ControlOrpcErrorCorrelationData(context),
  };
}
