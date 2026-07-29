import { firstMeetResponseProofPostcondition } from "@civ7/direct-control/proof/first-meet-response-proof-policy";
import { Effect } from "effect";
import { civ7ControlOrpcMutationProcedure } from "#civ7-control-service/middleware/mutation-procedure";
import {
  civ7ControlOrpcErrorCorrelationData,
  civ7ControlOrpcFailureDetail,
} from "#civ7-control-service/model/dto/correlation";
import { civ7CloseoutMutationProjection } from "#civ7-control-service/model/policy/mutation-result";
import type { Civ7ControlOrpcContext } from "#civ7-control-service/model/ports/context";
import type { Civ7ControlOrpcFirstMeetResponseResult } from "#civ7-control-service/model/ports/direct-control";
import type { Civ7FirstMeetResponseInput, Civ7FirstMeetResponseResult } from "../contract";
import { module } from "../module";

type FirstMeetResponseRuntimeInput = Civ7FirstMeetResponseInput &
  Readonly<{
    playerId: number;
  }>;
export const firstMeetResponseRequest = civ7ControlOrpcMutationProcedure(
  module.firstMeet.response.request
).effect(function* ({ context, errors, input }) {
  return yield* Effect.tryPromise({
    try: async () => {
      const localPlayerId = await readLocalPlayerId(context);
      const requestInput = {
        playerId: localPlayerId,
        metPlayerId: input.metPlayerId,
        responseType: input.responseType,
      };
      const result = await context.directControl.requestCiv7FirstMeetResponse(
        requestInput,
        context.endpointDefaults
      );
      return firstMeetResponseResult(requestInput, result);
    },
    catch: (cause) =>
      errors.FIRST_MEET_RESPONSE_UNAVAILABLE({
        data: {
          detail: civ7ControlOrpcFailureDetail(cause),
          procedureKey: "diplomacy.firstMeet.response.request",
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
function firstMeetResponseResult(
  input: FirstMeetResponseRuntimeInput,
  result: Civ7ControlOrpcFirstMeetResponseResult
): Civ7FirstMeetResponseResult {
  const projection = civ7CloseoutMutationProjection({
    sent: result.sent,
    postcondition: firstMeetResponseProofPostcondition(result),
    missing: {
      classification: "missing-postcondition",
      reason: "The first-meet response result did not include explicit postcondition evidence.",
      outcome: result.sent ? "unknown" : "not-sent",
    },
    source: "diplomacy.firstMeet.response.request",
    inspectKind: "inspect-first-meet-response",
    inspectLabel:
      "Inspect current attention and first-meet diplomacy state before attempting another first-meet response.",
    doNotRepeatLabel:
      "Do not repeat this first-meet response until fresh attention and first-meet evidence is read.",
  });
  return {
    playerId: result.playerId,
    metPlayerId: result.metPlayerId,
    responseType: input.responseType,
    sent: result.sent,
    status: projection.status,
    validation: {
      beforeValid: result.beforeValidation.valid,
      afterValid: result.afterValidation.valid,
    },
    postcondition: projection.postcondition as Civ7FirstMeetResponseResult["postcondition"],
    nextSteps: projection.nextSteps,
  };
}
