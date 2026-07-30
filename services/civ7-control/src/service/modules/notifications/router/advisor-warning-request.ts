import { Effect } from "effect";

import { civ7ControlOrpcMutationProcedure } from "#civ7-control-service/middleware/mutation-procedure";
import {
  civ7ControlOrpcErrorCorrelationData,
  civ7ControlOrpcFailureDetail,
} from "#civ7-control-service/model/dto/correlation";
import type { Civ7ControlOrpcContext } from "#civ7-control-service/model/ports/context";
import type { Civ7NotificationAdvisorWarningViewedCheckResult } from "../contract";
import { acknowledgeCiv7AdvisorWarningViewed } from "../model/policy/advisor-warning-execution";
import { advisorWarningViewedAvailable } from "../model/policy/advisor-warning-result";
import { module } from "../module";

export const advisorWarningViewed = {
  check: module.advisorWarning.viewed.check.effect(function* ({ context, errors, input }) {
    const check = yield* Effect.tryPromise({
      try: () =>
        context.directControl.checkCiv7AdvisorWarningViewed(input, context.endpointDefaults),
      catch: (cause) =>
        errors.NOTIFICATION_ADVISOR_WARNING_UNAVAILABLE({
          data: advisorWarningUnavailableData(
            "notifications.advisorWarning.viewed.check",
            cause,
            context
          ),
        }),
    });
    return {
      target: input.target,
      available: advisorWarningViewedAvailable(input.target, check),
    } satisfies Civ7NotificationAdvisorWarningViewedCheckResult;
  }),
  request: civ7ControlOrpcMutationProcedure(module.advisorWarning.viewed.request).effect(
    function* ({ context, errors, input }) {
      return yield* acknowledgeCiv7AdvisorWarningViewed(input, context).pipe(
        Effect.mapError((cause) =>
          errors.NOTIFICATION_ADVISOR_WARNING_UNAVAILABLE({
            data: advisorWarningUnavailableData(
              "notifications.advisorWarning.viewed.request",
              cause,
              context
            ),
          })
        )
      );
    }
  ),
};

function advisorWarningUnavailableData(
  procedureKey:
    | "notifications.advisorWarning.viewed.check"
    | "notifications.advisorWarning.viewed.request",
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
