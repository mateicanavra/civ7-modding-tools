import { Effect } from "effect";

import { civ7ControlOrpcMutationProcedure } from "#civ7-control-service/middleware/mutation-procedure";
import {
  civ7ControlOrpcErrorCorrelationData,
  civ7ControlOrpcFailureDetail,
} from "#civ7-control-service/model/dto/correlation";
import { civ7DirectControlDispatchStatus } from "#civ7-control-service/model/policy/direct-control-failure";
import type { Civ7ControlOrpcContext } from "#civ7-control-service/model/ports/context";
import type {
  Civ7ControlOrpcCommandDispatchStatus,
  Civ7ControlOrpcTurnCompletionSendResult,
} from "#civ7-control-service/model/ports/direct-control";
import type { Civ7TurnCompletionCheckResult, Civ7TurnCompletionResult } from "../contract";
import { pollTurnCompletionPostcondition } from "../model/policy/completion-polling";
import {
  type Civ7TurnCompletionPostconditionEvidence,
  civ7TurnCompletionPostcondition,
  turnCompletionAvailable,
} from "../model/policy/completion-postcondition";
import { module } from "../module";

const DEFAULT_TURN_COMPLETION_WAIT_MS = 3_000;
const MIN_TURN_COMPLETION_WAIT_MS = 1_000;
const MAX_TURN_COMPLETION_WAIT_MS = 6_000;

/** Service-owned turn availability, guarded dispatch, and bounded acknowledgement observation. */
export const complete = {
  check: module.complete.check.effect(function* ({ context, errors }) {
    const check = yield* Effect.tryPromise({
      try: () => context.directControl.checkCiv7TurnCompletion({}, context.endpointDefaults),
      catch: (cause) =>
        errors.TURN_COMPLETION_UNAVAILABLE({
          data: turnCompletionUnavailableData("turn.complete.check", cause, context),
        }),
    });
    return {
      available: turnCompletionAvailable(check),
    } satisfies Civ7TurnCompletionCheckResult;
  }),
  request: civ7ControlOrpcMutationProcedure(module.complete.request).effect(function* ({
    context,
    errors,
  }) {
    const check = (timeoutMs?: number) =>
      context.directControl.checkCiv7TurnCompletion({}, directControlOptions(context, timeoutMs));
    const precheck = yield* Effect.tryPromise({
      try: () => check(),
      catch: (cause) =>
        errors.TURN_COMPLETION_UNAVAILABLE({
          data: turnCompletionUnavailableData("turn.complete.request", cause, context),
        }),
    });
    if (!turnCompletionAvailable(precheck)) {
      return turnCompletionResult("not-sent", { kind: "not-sent" });
    }

    const sendAttempt = yield* attemptTurnCompletionSend(() =>
      context.directControl.sendCiv7TurnCompletion(
        { expected: precheck.snapshot },
        context.endpointDefaults
      )
    ).pipe(Effect.uninterruptible);
    if (!sendAttempt.ok) {
      const dispatchState = turnCompletionDispatchState(sendAttempt.dispatchStatus);
      return turnCompletionResult(
        dispatchState,
        dispatchState === "not-sent" ? { kind: "not-sent" } : { kind: "send-result-unavailable" }
      );
    }
    const evidence = yield* pollTurnCompletionPostcondition({
      send: sendAttempt.value,
      check: (timeoutMs) => check(timeoutMs),
      waitMs: turnCompletionWaitMs(context.endpointDefaults?.timeoutMs),
    });
    return turnCompletionResult("sent", evidence);
  }),
};

type TurnCompletionDispatchState = "not-sent" | "sent" | "unknown";

function turnCompletionResult(
  dispatchState: TurnCompletionDispatchState,
  evidence: Civ7TurnCompletionPostconditionEvidence
): Civ7TurnCompletionResult {
  const postcondition = civ7TurnCompletionPostcondition(evidence);
  if (dispatchState === "not-sent") {
    if (postcondition.classification !== "not-sent") {
      throw new Error("Turn completion that was not sent must report not-sent.");
    }
    return {
      status: "not-sent",
      postcondition,
      nextSteps: [
        {
          kind: "inspect-turn-completion",
          source: "turn.complete.request",
          label: "Read fresh native turn-completion availability before another request.",
        },
      ],
    };
  }
  if (dispatchState === "unknown") {
    if (postcondition.classification !== "missing-postcondition") {
      throw new Error("Unknown turn-completion dispatch must report missing evidence.");
    }
    return {
      status: "dispatch-unknown",
      postcondition,
      nextSteps: noRepeatNextSteps(),
    };
  }
  if (postcondition.classification === "not-sent") {
    throw new Error("Sent turn completion cannot report not-sent.");
  }
  if (postcondition.classification === "turn-advanced") {
    return {
      status: "sent-confirmed",
      postcondition,
      nextSteps: [
        {
          kind: "refresh-attention",
          source: "turn.complete.request",
          label: "Refresh current attention before choosing the next player action.",
        },
      ],
    };
  }
  if (postcondition.classification === "turn-complete-sent") {
    return {
      status: "sent-guarded",
      postcondition,
      nextSteps: noRepeatNextSteps(),
    };
  }
  return {
    status: "sent-unverified",
    postcondition,
    nextSteps: noRepeatNextSteps(),
  };
}

function noRepeatNextSteps(): Extract<
  Civ7TurnCompletionResult,
  { status: "dispatch-unknown" | "sent-guarded" | "sent-unverified" }
>["nextSteps"] {
  return [
    {
      kind: "do-not-repeat",
      source: "turn.complete.request",
      label:
        "Do not repeat turn completion until fresh native evidence shows a different turn or new availability.",
    },
  ];
}

type TurnCompletionSendAttempt =
  | Readonly<{ ok: true; value: Civ7ControlOrpcTurnCompletionSendResult }>
  | Readonly<{ ok: false; dispatchStatus: Civ7ControlOrpcCommandDispatchStatus }>;

function attemptTurnCompletionSend(
  send: () => Promise<Civ7ControlOrpcTurnCompletionSendResult>
): Effect.Effect<TurnCompletionSendAttempt> {
  return Effect.promise(async () => {
    try {
      return { ok: true, value: await send() };
    } catch (cause) {
      return { ok: false, dispatchStatus: civ7DirectControlDispatchStatus(cause) };
    }
  });
}

function turnCompletionDispatchState(
  status: Civ7ControlOrpcCommandDispatchStatus
): Exclude<TurnCompletionDispatchState, "sent"> {
  return status === "not-dispatched" ? "not-sent" : "unknown";
}

function turnCompletionWaitMs(timeoutMs: number | undefined): number {
  return Math.min(
    MAX_TURN_COMPLETION_WAIT_MS,
    Math.max(MIN_TURN_COMPLETION_WAIT_MS, timeoutMs ?? DEFAULT_TURN_COMPLETION_WAIT_MS)
  );
}

function directControlOptions(context: Civ7ControlOrpcContext, timeoutMs: number | undefined) {
  return timeoutMs === undefined
    ? context.endpointDefaults
    : {
        ...context.endpointDefaults,
        timeoutMs,
      };
}

function turnCompletionUnavailableData(
  procedureKey: "turn.complete.check" | "turn.complete.request",
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
