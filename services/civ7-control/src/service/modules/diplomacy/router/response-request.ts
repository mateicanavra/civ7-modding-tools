import { diplomacyResponseProofPostcondition } from "@civ7/direct-control/proof/diplomacy-response-proof-policy";
import { Effect } from "effect";
import { civ7ControlOrpcMutationProcedure } from "#civ7-control-service/middleware/mutation-procedure";
import {
  civ7ControlOrpcErrorCorrelationData,
  civ7ControlOrpcFailureDetail,
} from "#civ7-control-service/model/dto/correlation";
import { civ7CloseoutMutationProjection } from "#civ7-control-service/model/policy/mutation-result";
import type { Civ7ControlOrpcContext } from "#civ7-control-service/model/ports/context";
import type { Civ7ControlOrpcDiplomacyResponseResult } from "#civ7-control-service/model/ports/direct-control";
import type { Civ7DiplomacyResponseInput, Civ7DiplomacyResponseResult } from "../contract";
import { module } from "../module";

type DiplomacyResponseRuntimeInput = Civ7DiplomacyResponseInput &
  Readonly<{
    playerId: number;
  }>;
export const responseRequest = civ7ControlOrpcMutationProcedure(module.response.request).effect(
  function* ({ context, errors, input }) {
    return yield* Effect.tryPromise({
      try: async () => {
        const localPlayerId = await readLocalPlayerId(context);
        const requestInput = {
          playerId: localPlayerId,
          actionId: input.actionId,
          responseType: input.responseType,
          ...(input.notificationId === undefined ? {} : { notificationId: input.notificationId }),
        };
        const result = await context.directControl.requestCiv7DiplomacyResponse(
          requestInput,
          context.endpointDefaults
        );
        return diplomacyResponseResult(requestInput, result);
      },
      catch: (cause) =>
        errors.DIPLOMACY_RESPONSE_UNAVAILABLE({
          data: {
            detail: civ7ControlOrpcFailureDetail(cause),
            procedureKey: "diplomacy.response.request",
            source: "direct-control-facade",
            ...civ7ControlOrpcErrorCorrelationData(context),
          },
        }),
    });
  }
);
async function readLocalPlayerId(context: Civ7ControlOrpcContext): Promise<number> {
  const view = await context.directControl.getCiv7PlayNotificationView(context.endpointDefaults);
  return view.localPlayerId;
}
function diplomacyResponseResult(
  input: DiplomacyResponseRuntimeInput,
  result: Civ7ControlOrpcDiplomacyResponseResult
): Civ7DiplomacyResponseResult {
  const projection = civ7CloseoutMutationProjection({
    sent: result.sent,
    postcondition: diplomacyResponseProofPostcondition(result, undefined),
    missing: {
      classification: "missing-postcondition",
      reason: "The diplomacy response result did not include explicit postcondition evidence.",
      outcome: result.sent ? "unknown" : "not-sent",
    },
    source: "diplomacy.response.request",
    inspectKind: "inspect-diplomacy-response",
    inspectLabel:
      "Inspect current attention and diplomacy response state before attempting another diplomacy request.",
    doNotRepeatLabel:
      "Do not repeat this diplomacy response request until fresh attention and diplomacy evidence is read.",
  });
  return {
    playerId: result.playerId,
    actionId: input.actionId,
    responseType: input.responseType,
    ...(input.notificationId === undefined ? {} : { notificationId: input.notificationId }),
    sent: result.sent,
    status: projection.status,
    validation: {
      beforeValid: result.beforeValidation.valid,
      afterValid: result.afterValidation.valid,
    },
    postcondition: projection.postcondition as Civ7DiplomacyResponseResult["postcondition"],
    nextSteps: projection.nextSteps,
  };
}
