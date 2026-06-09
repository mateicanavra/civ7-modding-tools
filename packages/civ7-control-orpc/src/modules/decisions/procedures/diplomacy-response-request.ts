import { diplomacyResponseProofPostcondition } from "@civ7/direct-control";
import { Effect } from "effect";

import type { Civ7ControlOrpcDiplomacyResponseResult } from "../../../dependencies/direct-control";
import { civ7MutationApprovalMiddleware } from "../../../middleware/mutation-approval";
import { civ7MutationReadinessMiddleware } from "../../../middleware/mutation-readiness";
import { civ7ControlOrpcErrorCorrelationData } from "../../../model/correlation";
import {
  civ7MutationNextSteps,
  civ7MutationPostconditionSummary,
  civ7MutationRequestStatusWithoutGuarded,
} from "../../../policy/mutation-result";
import { civ7ControlOrpcImplementer } from "../../../procedure";
import type {
  Civ7DecisionsDiplomacyResponseInput,
  Civ7DecisionsDiplomacyResponseResult,
} from "../contract";

const decisionsDiplomacyResponseRequestWithApproval =
  civ7ControlOrpcImplementer.decisions.diplomacy.response.request.use(
    civ7MutationApprovalMiddleware,
  );
const decisionsDiplomacyResponseRequestReady =
  decisionsDiplomacyResponseRequestWithApproval.use(
    civ7MutationReadinessMiddleware,
  );

export const decisionsDiplomacyResponseRequestProcedure =
  decisionsDiplomacyResponseRequestReady.effect(function* ({
    context,
    errors,
    input,
  }) {
    return yield* Effect.tryPromise({
      try: async () => {
        const result = await context.directControl.requestCiv7DiplomacyResponse(
          input,
          context.endpointDefaults,
          context.approval,
        );
        return diplomacyResponseResult(input, result);
      },
      catch: () =>
        errors.DIPLOMACY_RESPONSE_UNAVAILABLE({
          data: {
            procedureKey: "decisions.diplomacy.response.request",
            source: "direct-control-facade",
            ...civ7ControlOrpcErrorCorrelationData(context),
          },
        }),
    });
  });

function diplomacyResponseResult(
  input: Civ7DecisionsDiplomacyResponseInput,
  result: Civ7ControlOrpcDiplomacyResponseResult,
): Civ7DecisionsDiplomacyResponseResult {
  const postcondition = diplomacyResponsePostconditionSummary(result);
  const status = civ7MutationRequestStatusWithoutGuarded({
    sent: result.sent,
    postcondition,
  });

  return {
    playerId: input.playerId,
    actionId: input.actionId,
    responseType: input.responseType,
    ...(input.notificationId === undefined ? {} : { notificationId: input.notificationId }),
    sent: result.sent,
    status,
    validation: {
      beforeValid: result.beforeValidation.valid,
      afterValid: result.afterValidation.valid,
    },
    postcondition,
    nextSteps: civ7MutationNextSteps({
      status,
      postcondition,
      source: "decisions.diplomacy.response.request",
      inspectKind: "inspect-diplomacy-response",
      inspectLabel: "Inspect current attention and diplomacy response state before attempting another diplomacy request.",
      doNotRepeatLabel: "Do not repeat this diplomacy response request until fresh attention and diplomacy evidence is read.",
    }),
  };
}

function diplomacyResponsePostconditionSummary(
  result: Civ7ControlOrpcDiplomacyResponseResult,
): Civ7DecisionsDiplomacyResponseResult["postcondition"] {
  const postcondition = diplomacyResponseProofPostcondition(result, undefined);
  return civ7MutationPostconditionSummary({
    postcondition,
    missing: {
      classification: "missing-postcondition",
      reason: "The diplomacy response result did not include explicit postcondition evidence.",
      outcome: result.sent ? "unknown" : "not-sent",
    },
  }) as Civ7DecisionsDiplomacyResponseResult["postcondition"];
}
