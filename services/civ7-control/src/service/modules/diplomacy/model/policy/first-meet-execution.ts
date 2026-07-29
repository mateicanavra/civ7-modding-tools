import { Cause, Effect } from "effect";

import { civ7DirectControlDispatchStatus } from "#civ7-control-service/model/policy/direct-control-failure";
import type { Civ7ControlOrpcContext } from "#civ7-control-service/model/ports/context";
import type {
  Civ7ControlOrpcCommandDispatchStatus,
  Civ7ControlOrpcFirstMeetResponseSendResult,
} from "#civ7-control-service/model/ports/direct-control";
import type { Civ7FirstMeetResponseInput, Civ7FirstMeetResponseResult } from "../../contract";
import { firstMeetResponseAvailable } from "./first-meet-admission";
import { pollFirstMeetResponsePostcondition } from "./first-meet-polling";
import { firstMeetResponseResult } from "./first-meet-result";

const DEFAULT_FIRST_MEET_RESPONSE_WAIT_MS = 3_000;
const MIN_FIRST_MEET_RESPONSE_WAIT_MS = 1_000;
const MAX_FIRST_MEET_RESPONSE_WAIT_MS = 6_000;

type FirstMeetResponseRuntime = Pick<Civ7ControlOrpcContext, "directControl" | "endpointDefaults">;

/** Executes exact admission, guarded first-meet dispatch, and bounded blocker polling. */
export function executeCiv7FirstMeetResponse(
  input: Civ7FirstMeetResponseInput,
  context: FirstMeetResponseRuntime
): Effect.Effect<Civ7FirstMeetResponseResult, unknown> {
  const check = (timeoutMs?: number) =>
    context.directControl.checkCiv7FirstMeetResponse(
      input,
      directControlOptions(context, timeoutMs)
    );

  return Effect.gen(function* () {
    const precheck = yield* Effect.tryPromise({
      try: () => check(),
      catch: (cause) => new Cause.UnknownException(cause),
    });
    if (!firstMeetResponseAvailable(input, precheck)) {
      return firstMeetResponseResult(input, "not-sent", {
        kind: "not-admitted",
      });
    }

    const sendAttempt = yield* attemptFirstMeetResponseSend(() =>
      context.directControl.sendCiv7FirstMeetResponse(
        { ...input, expected: precheck.snapshot },
        context.endpointDefaults
      )
    ).pipe(Effect.uninterruptible);
    if (!sendAttempt.ok) {
      if (sendAttempt.dispatchStatus === "not-dispatched") {
        return firstMeetResponseResult(input, "not-sent", {
          kind: "not-dispatched",
        });
      }
      const evidence = yield* pollFirstMeetResponsePostcondition({
        input,
        initial: {
          kind: "observed",
          input,
          beforeValidation: { valid: precheck.valid, result: precheck.result },
          afterValidation: { valid: precheck.valid, result: precheck.result },
          before: precheck.snapshot,
          after: precheck.snapshot,
        },
        check: (timeoutMs) => check(timeoutMs),
        waitMs: firstMeetResponseWaitMs(context.endpointDefaults?.timeoutMs),
      });
      return firstMeetResponseResult(
        input,
        sendAttempt.dispatchStatus === "dispatched" ? "sent" : "unknown",
        evidence
      );
    }
    if (!sendAttempt.value.sent) {
      return firstMeetResponseResult(input, "not-sent", {
        kind: "validation-rejected",
      });
    }

    const evidence = yield* pollFirstMeetResponsePostcondition({
      input,
      initial: {
        kind: "observed",
        input,
        beforeValidation: sendAttempt.value.validation,
        afterValidation: sendAttempt.value.validation,
        before: sendAttempt.value.before,
        after: sendAttempt.value.after,
      },
      check: (timeoutMs) => check(timeoutMs),
      waitMs: firstMeetResponseWaitMs(context.endpointDefaults?.timeoutMs),
    });
    return firstMeetResponseResult(input, "sent", evidence);
  });
}

type FirstMeetResponseSendAttempt =
  | Readonly<{ ok: true; value: Civ7ControlOrpcFirstMeetResponseSendResult }>
  | Readonly<{ ok: false; dispatchStatus: Civ7ControlOrpcCommandDispatchStatus }>;

function attemptFirstMeetResponseSend(
  send: () => Promise<Civ7ControlOrpcFirstMeetResponseSendResult>
): Effect.Effect<FirstMeetResponseSendAttempt> {
  return Effect.promise(async () => {
    try {
      return { ok: true, value: await send() };
    } catch (cause) {
      return { ok: false, dispatchStatus: civ7DirectControlDispatchStatus(cause) };
    }
  });
}

function firstMeetResponseWaitMs(timeoutMs: number | undefined): number {
  return Math.min(
    MAX_FIRST_MEET_RESPONSE_WAIT_MS,
    Math.max(MIN_FIRST_MEET_RESPONSE_WAIT_MS, timeoutMs ?? DEFAULT_FIRST_MEET_RESPONSE_WAIT_MS)
  );
}

function directControlOptions(context: FirstMeetResponseRuntime, timeoutMs: number | undefined) {
  return timeoutMs === undefined
    ? context.endpointDefaults
    : {
        ...context.endpointDefaults,
        timeoutMs,
      };
}
