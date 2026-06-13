import { turnCompletionProofPostcondition } from "@civ7/direct-control/proof/turn-completion-proof-policy";
import type { Civ7RuntimeProbe } from "@civ7/direct-control";
import { Effect } from "effect";

import type { Civ7ControlOrpcTurnCompletionRequestResult } from "../../../dependencies/direct-control";
import { civ7ControlOrpcMutationProcedure } from "../../../middleware/mutation-procedure";
import {
  civ7ControlOrpcErrorCorrelationData,
  civ7ControlOrpcFailureDetail,
} from "../../../model/correlation";
import { civ7MutationNextSteps, civ7MutationRequestStatus } from "../../../policy/mutation-result";
import { civ7ControlOrpcImplementer } from "../../../procedure";
import type { Civ7TurnCompletionResult } from "../contract";

export const turnCompleteRequestProcedure = civ7ControlOrpcMutationProcedure(
  civ7ControlOrpcImplementer.turn.complete.request
).effect(function* ({ context, errors }) {
  return yield* Effect.tryPromise({
    try: async () => {
      const result = await context.directControl.requestCiv7TurnComplete(context.endpointDefaults);
      return turnCompletionResult(result);
    },
    catch: (cause) =>
      errors.TURN_COMPLETION_UNAVAILABLE({
        data: {
          detail: civ7ControlOrpcFailureDetail(cause),
          procedureKey: "turn.complete.request",
          source: "direct-control-facade",
          ...civ7ControlOrpcErrorCorrelationData(context),
        },
      }),
  });
});

function turnCompletionResult(
  result: Civ7ControlOrpcTurnCompletionRequestResult
): Civ7TurnCompletionResult {
  if (!result.sent) return blockedTurnCompletionResult(result);

  const postcondition = turnCompletionPostconditionSummary(result);
  const status = turnCompletionRequestStatus(postcondition);

  return {
    sent: true,
    status,
    before: turnCompletionProbeSummary(result.before),
    after: turnCompletionProbeSummary(result.after),
    postcondition,
    nextSteps: civ7MutationNextSteps({
      status,
      postcondition,
      source: "turn.complete.request",
      inspectKind: "inspect-turn-completion",
      inspectLabel:
        "Inspect current turn completion state before attempting another turn completion request.",
      doNotRepeatLabel:
        "Do not repeat turn completion until fresh turn and attention evidence is read.",
    }),
  };
}

function blockedTurnCompletionResult(
  result: Extract<Civ7ControlOrpcTurnCompletionRequestResult, { sent: false }>
): Civ7TurnCompletionResult {
  const postcondition: Civ7TurnCompletionResult["postcondition"] = {
    classification: "turn-completion-blocked",
    reason: "Direct-control turn-completion guards blocked the request before command execution.",
    outcome: "not-sent",
    confidence: "unverified",
    confirmed: false,
    noRepeatAfterUnverified: true,
  };
  const status = civ7MutationRequestStatus({
    sent: false,
    postcondition,
  });

  return {
    sent: false,
    status,
    before: turnCompletionProbeSummary(result.before),
    after: null,
    postcondition,
    nextSteps: [
      {
        kind: "inspect-turn-completion",
        source: "turn.complete.request",
        label:
          "Inspect current turn completion blockers before attempting another turn completion request.",
      },
      {
        kind: "do-not-repeat",
        source: "turn.complete.request",
        label: "Do not repeat turn completion until fresh turn and attention evidence is read.",
      },
    ],
  };
}

function turnCompletionRequestStatus(
  postcondition: Civ7TurnCompletionResult["postcondition"]
): Civ7TurnCompletionResult["status"] {
  const status = civ7MutationRequestStatus({
    sent: true,
    postcondition,
  });
  if (status === "not-sent") {
    throw new Error("turn.complete.request unexpectedly produced not-sent status");
  }
  return status;
}

function turnCompletionPostconditionSummary(
  result: Extract<Civ7ControlOrpcTurnCompletionRequestResult, { sent: true }>
): Civ7TurnCompletionResult["postcondition"] {
  const postcondition = turnCompletionProofPostcondition(result, undefined);
  const confirmed = postcondition.confidence === "confirmed";

  return {
    classification:
      postcondition.classification as Civ7TurnCompletionResult["postcondition"]["classification"],
    reason: postcondition.reason,
    outcome: postcondition.outcome as Civ7TurnCompletionResult["postcondition"]["outcome"],
    confidence: postcondition.confidence,
    confirmed,
    noRepeatAfterUnverified: postcondition.noRepeatAfterUnverified,
  };
}

function turnCompletionProbeSummary(
  status: Civ7ControlOrpcTurnCompletionRequestResult["before"]
): Civ7TurnCompletionResult["before"] {
  return {
    turn: probeValue(status.turn),
    turnDate: probeValue(status.turnDate),
    hasSentTurnComplete: probeValue(status.hasSentTurnComplete),
    canEndTurn: probeValue(status.canEndTurn),
    blocker: blockerValue(status.blocker),
    firstReadyUnitId: probeValue(status.firstReadyUnitId),
  };
}

function blockerValue(probe: Civ7RuntimeProbe<unknown>): number | string | null {
  const value = probeValue(probe);
  if (typeof value === "number" || typeof value === "string") return value;
  return null;
}

function probeValue<T>(probe: Civ7RuntimeProbe<T>): T | null {
  return probe.ok ? probe.value : null;
}
