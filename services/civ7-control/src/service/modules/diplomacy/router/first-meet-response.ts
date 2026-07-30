import { Effect } from "effect";

import { civ7ControlOrpcMutationProcedure } from "#civ7-control-service/middleware/mutation-procedure";
import {
  civ7ControlOrpcErrorCorrelationData,
  civ7ControlOrpcFailureDetail,
} from "#civ7-control-service/model/dto/correlation";
import type { Civ7ControlOrpcContext } from "#civ7-control-service/model/ports/context";
import type { Civ7FirstMeetResponseCheckResult } from "../contract";
import { firstMeetResponseAvailable } from "../model/policy/first-meet-admission";
import { executeCiv7FirstMeetResponse } from "../model/policy/first-meet-execution";
import { module } from "../module";

/** Service-owned availability, guarded dispatch, and exact blocker-clearance proof. */
export const firstMeetResponse = {
  check: module.firstMeet.response.check.effect(function* ({ context, errors, input }) {
    const check = yield* Effect.tryPromise({
      try: () => context.directControl.checkCiv7FirstMeetResponse(input, context.endpointDefaults),
      catch: (cause) =>
        errors.FIRST_MEET_RESPONSE_UNAVAILABLE({
          data: firstMeetResponseUnavailableData(
            "diplomacy.firstMeet.response.check",
            cause,
            context
          ),
        }),
    });
    return {
      metPlayerId: input.metPlayerId,
      response: input.response,
      available: firstMeetResponseAvailable(input, check),
    } satisfies Civ7FirstMeetResponseCheckResult;
  }),
  request: civ7ControlOrpcMutationProcedure(module.firstMeet.response.request).effect(function* ({
    context,
    errors,
    input,
  }) {
    return yield* executeCiv7FirstMeetResponse(input, context).pipe(
      Effect.mapError((cause) =>
        errors.FIRST_MEET_RESPONSE_UNAVAILABLE({
          data: firstMeetResponseUnavailableData(
            "diplomacy.firstMeet.response.request",
            cause,
            context
          ),
        })
      )
    );
  }),
};

function firstMeetResponseUnavailableData(
  procedureKey: "diplomacy.firstMeet.response.check" | "diplomacy.firstMeet.response.request",
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
