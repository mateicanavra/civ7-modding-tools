import { Effect } from "effect";
import { civ7ControlOrpcMutationProcedure } from "#civ7-control-service/middleware/mutation-procedure";
import {
  civ7ControlOrpcErrorCorrelationData,
  civ7ControlOrpcFailureDetail,
} from "#civ7-control-service/model/dto/correlation";
import { notificationDismissalResult } from "../model/policy/dismissal-result";
import { module } from "../module";
export const dismissRequest = civ7ControlOrpcMutationProcedure(module.dismiss.request).effect(
  function* ({ context, errors, input }) {
    return yield* Effect.tryPromise({
      try: async () => {
        const result = await context.directControl.requestCiv7NotificationDismissal(
          input,
          context.endpointDefaults
        );
        return notificationDismissalResult(result);
      },
      catch: (cause) =>
        errors.NOTIFICATION_DISMISSAL_UNAVAILABLE({
          data: {
            detail: civ7ControlOrpcFailureDetail(cause),
            procedureKey: "notifications.dismiss.request",
            source: "direct-control-facade",
            ...civ7ControlOrpcErrorCorrelationData(context),
          },
        }),
    });
  }
);
