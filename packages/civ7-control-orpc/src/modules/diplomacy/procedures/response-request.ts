import { diplomacyResponseProofPostcondition } from "@civ7/direct-control/proof/diplomacy-response-proof-policy";
import { Effect } from "effect";

import type { Civ7ControlOrpcDiplomacyResponseResult } from "../../../dependencies/direct-control";
import { civ7ControlOrpcMutationProcedure } from "../../../middleware/mutation-procedure";
import { civ7ControlOrpcErrorCorrelationData } from "../../../model/correlation";
import {
  civ7CloseoutMutationProjection,
} from "../../../policy/mutation-result";
import { civ7ControlOrpcImplementer } from "../../../procedure";
import type {
  Civ7DiplomacyResponseInput,
  Civ7DiplomacyResponseResult,
} from "../contract";

export const diplomacyResponseRequestProcedure =
  civ7ControlOrpcMutationProcedure(
    civ7ControlOrpcImplementer.diplomacy.response.request,
  ).effect(function* ({
    context,
    errors,
    input,
  }) {
    return yield* Effect.tryPromise({
      try: async () => {
        const result = await context.directControl.requestCiv7DiplomacyResponse(
          input,
          context.endpointDefaults,
        );
        return diplomacyResponseResult(input, result);
      },
      catch: () =>
        errors.DIPLOMACY_RESPONSE_UNAVAILABLE({
          data: {
            procedureKey: "diplomacy.response.request",
            source: "direct-control-facade",
            ...civ7ControlOrpcErrorCorrelationData(context),
          },
        }),
    });
  });

function diplomacyResponseResult(
  input: Civ7DiplomacyResponseInput,
  result: Civ7ControlOrpcDiplomacyResponseResult,
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
    inspectLabel: "Inspect current attention and diplomacy response state before attempting another diplomacy request.",
    doNotRepeatLabel: "Do not repeat this diplomacy response request until fresh attention and diplomacy evidence is read.",
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
