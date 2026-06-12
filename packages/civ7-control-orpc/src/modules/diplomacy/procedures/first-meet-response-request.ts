import { firstMeetResponseProofPostcondition } from "@civ7/direct-control/proof/first-meet-response-proof-policy";
import { Effect } from "effect";

import type { Civ7ControlOrpcContext } from "../../../context";
import type { Civ7ControlOrpcFirstMeetResponseResult } from "../../../dependencies/direct-control";
import { civ7ControlOrpcMutationProcedure } from "../../../middleware/mutation-procedure";
import {
  civ7ControlOrpcErrorCorrelationData,
  civ7ControlOrpcFailureDetail,
} from "../../../model/correlation";
import {
  civ7CloseoutMutationProjection,
} from "../../../policy/mutation-result";
import { civ7ControlOrpcImplementer } from "../../../procedure";
import type {
  Civ7FirstMeetResponseInput,
  Civ7FirstMeetResponseResult,
} from "../contract";

type FirstMeetResponseRuntimeInput = Civ7FirstMeetResponseInput & Readonly<{
  playerId: number;
}>;

export const firstMeetResponseRequestProcedure =
  civ7ControlOrpcMutationProcedure(
    civ7ControlOrpcImplementer.diplomacy.firstMeet.response.request,
  ).effect(function* ({
    context,
    errors,
    input,
  }) {
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
          context.endpointDefaults,
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

async function readLocalPlayerId(
  context: Civ7ControlOrpcContext,
): Promise<number> {
  const view = await context.directControl.getCiv7PlayNotificationView(
    context.endpointDefaults,
  );
  return view.localPlayerId;
}

function firstMeetResponseResult(
  input: FirstMeetResponseRuntimeInput,
  result: Civ7ControlOrpcFirstMeetResponseResult,
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
    inspectLabel: "Inspect current attention and first-meet diplomacy state before attempting another first-meet response.",
    doNotRepeatLabel: "Do not repeat this first-meet response until fresh attention and first-meet evidence is read.",
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
