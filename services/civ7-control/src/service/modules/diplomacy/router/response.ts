import { Effect } from "effect";

import { civ7ControlOrpcMutationProcedure } from "#civ7-control-service/middleware/mutation-procedure";
import {
  civ7ControlOrpcErrorCorrelationData,
  civ7ControlOrpcFailureDetail,
} from "#civ7-control-service/model/dto/correlation";
import type { Civ7ControlOrpcContext } from "#civ7-control-service/model/ports/context";
import type { Civ7DiplomacyResponseCheckResult } from "../contract";
import { diplomacyResponseAdmission } from "../model/policy/diplomacy-response-admission";
import { executeCiv7DiplomacyResponse } from "../model/policy/diplomacy-response-execution";
import { module } from "../module";

/** Service-owned availability, guarded dispatch, and exact blocker-clearance proof. */
export const response = {
  check: module.response.check.effect(function* ({ context, errors, input }) {
    const check = yield* Effect.tryPromise({
      try: () => context.directControl.checkCiv7DiplomacyResponse(input, context.endpointDefaults),
      catch: (cause) =>
        errors.DIPLOMACY_RESPONSE_UNAVAILABLE({
          data: diplomacyResponseUnavailableData("diplomacy.response.check", cause, context),
        }),
    });
    const admission = diplomacyResponseAdmission(input, check);
    const target = {
      actionId: input.actionId,
      responseType: input.responseType,
    };
    if (admission.kind === "admitted") {
      return {
        ...target,
        available: true,
        classification: "ordinary-response",
      } satisfies Civ7DiplomacyResponseCheckResult;
    }
    if (admission.kind === "dedicated-war-workflow-required") {
      return {
        ...target,
        available: false,
        classification: "dedicated-war-workflow-required",
      } satisfies Civ7DiplomacyResponseCheckResult;
    }
    return {
      ...target,
      available: false,
      classification: "not-admitted",
    } satisfies Civ7DiplomacyResponseCheckResult;
  }),
  request: civ7ControlOrpcMutationProcedure(module.response.request).effect(function* ({
    context,
    errors,
    input,
  }) {
    return yield* executeCiv7DiplomacyResponse(input, context).pipe(
      Effect.mapError((cause) =>
        errors.DIPLOMACY_RESPONSE_UNAVAILABLE({
          data: diplomacyResponseUnavailableData("diplomacy.response.request", cause, context),
        })
      )
    );
  }),
};

function diplomacyResponseUnavailableData(
  procedureKey: "diplomacy.response.check" | "diplomacy.response.request",
  cause: unknown,
  context: Civ7ControlOrpcContext
) {
  return {
    detail: civ7ControlOrpcFailureDetail(cause),
    procedureKey,
    source: "direct-control-facade" as const,
    ...civ7ControlOrpcErrorCorrelationData(context),
  };
}
