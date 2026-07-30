import { advisorWarningProofPostcondition } from "@civ7/direct-control/proof/advisor-warning-proof-policy";
import { Effect } from "effect";
import { civ7ControlOrpcMutationProcedure } from "#civ7-control-service/middleware/mutation-procedure";
import {
  civ7ControlOrpcErrorCorrelationData,
  civ7ControlOrpcFailureDetail,
} from "#civ7-control-service/model/dto/correlation";
import { civ7CloseoutMutationProjection } from "#civ7-control-service/model/policy/mutation-result";
import type { Civ7ControlOrpcContext } from "#civ7-control-service/model/ports/context";
import type { Civ7ControlOrpcAdvisorWarningViewedResult } from "#civ7-control-service/model/ports/direct-control";
import type {
  Civ7NotificationAdvisorWarningViewedInput,
  Civ7NotificationAdvisorWarningViewedResult,
} from "../contract";
import { module } from "../module";

const source = "notifications.advisorWarning.viewed.request";
export const advisorWarningRequest = civ7ControlOrpcMutationProcedure(
  module.advisorWarning.viewed.request
).effect(function* ({ context, errors, input }) {
  return yield* Effect.tryPromise({
    try: async () => {
      const localPlayerId = await readLocalPlayerId(context);
      const result = await context.directControl.requestCiv7AdvisorWarningViewed(
        {
          playerId: localPlayerId,
          target: input.target,
        },
        context.endpointDefaults
      );
      return advisorWarningViewedResult(input, result);
    },
    catch: (cause) =>
      errors.NOTIFICATION_ADVISOR_WARNING_UNAVAILABLE({
        data: {
          detail: civ7ControlOrpcFailureDetail(cause),
          procedureKey: source,
          source: "direct-control-facade",
          ...civ7ControlOrpcErrorCorrelationData(context),
        },
      }),
  });
});
async function readLocalPlayerId(context: Civ7ControlOrpcContext): Promise<number> {
  const view = await context.directControl.getCiv7PlayNotificationView(context.endpointDefaults);
  return view.localPlayerId;
}
function advisorWarningViewedResult(
  input: Civ7NotificationAdvisorWarningViewedInput,
  result: Civ7ControlOrpcAdvisorWarningViewedResult
): Civ7NotificationAdvisorWarningViewedResult {
  const projection = civ7CloseoutMutationProjection({
    sent: result.sent,
    postcondition: advisorWarningProofPostcondition(result),
    missing: {
      classification: "missing-postcondition",
      reason: "The advisor warning viewed result did not include explicit postcondition evidence.",
      outcome: result.sent ? "unknown" : "not-sent",
    },
    source,
    inspectKind: "inspect-notification",
    inspectLabel: "Inspect advisor-warning notification state before attempting another request.",
    doNotRepeatLabel:
      "Do not repeat this advisor-warning acknowledgement until fresh attention evidence is read.",
  });
  return {
    playerId: result.playerId,
    target: input.target,
    sent: result.sent,
    status: projection.status as Civ7NotificationAdvisorWarningViewedResult["status"],
    validation: {
      beforeValid: result.beforeValidation.valid,
      afterValid: result.afterValidation.valid,
    },
    postcondition:
      projection.postcondition as Civ7NotificationAdvisorWarningViewedResult["postcondition"],
    nextSteps: projection.nextSteps as Civ7NotificationAdvisorWarningViewedResult["nextSteps"],
  };
}
