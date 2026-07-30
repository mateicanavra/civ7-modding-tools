import { Cause, Effect } from "effect";

import { civ7DirectControlDispatchStatus } from "#civ7-control-service/model/policy/direct-control-failure";
import type { Civ7ControlOrpcContext } from "#civ7-control-service/model/ports/context";
import type {
  Civ7ControlOrpcCommandDispatchStatus,
  Civ7ControlOrpcDiplomacyResponseSendResult,
} from "#civ7-control-service/model/ports/direct-control";
import type { Civ7DiplomacyResponseInput, Civ7DiplomacyResponseResult } from "../../contract";
import { diplomacyResponseAdmission } from "./diplomacy-response-admission";
import { pollDiplomacyResponsePostcondition } from "./diplomacy-response-polling";
import { diplomacyResponseResult } from "./diplomacy-response-result";

const DEFAULT_DIPLOMACY_RESPONSE_WAIT_MS = 3_000;
const MIN_DIPLOMACY_RESPONSE_WAIT_MS = 1_000;
const MAX_DIPLOMACY_RESPONSE_WAIT_MS = 6_000;

type DiplomacyResponseRuntime = Pick<Civ7ControlOrpcContext, "directControl" | "endpointDefaults">;

/** Executes exact admission, guarded dispatch, and bounded diplomacy-blocker polling. */
export function executeCiv7DiplomacyResponse(
  input: Civ7DiplomacyResponseInput,
  context: DiplomacyResponseRuntime
): Effect.Effect<Civ7DiplomacyResponseResult, unknown> {
  const check = (timeoutMs?: number) =>
    context.directControl.checkCiv7DiplomacyResponse(
      input,
      directControlOptions(context, timeoutMs)
    );

  return Effect.gen(function* () {
    const precheck = yield* Effect.tryPromise({
      try: () => check(),
      catch: (cause) => new Cause.UnknownException(cause),
    });
    const admission = diplomacyResponseAdmission(input, precheck);
    if (admission.kind === "dedicated-war-workflow-required") {
      return diplomacyResponseResult(input, "not-sent", {
        kind: "dedicated-war-workflow-required",
      });
    }
    if (admission.kind !== "admitted") {
      return diplomacyResponseResult(input, "not-sent", {
        kind: "not-admitted",
      });
    }

    const sendAttempt = yield* attemptDiplomacyResponseSend(() =>
      context.directControl.sendCiv7DiplomacyResponse(
        { ...input, expected: precheck.snapshot },
        context.endpointDefaults
      )
    ).pipe(Effect.uninterruptible);
    if (!sendAttempt.ok) {
      if (sendAttempt.dispatchStatus === "not-dispatched") {
        return diplomacyResponseResult(input, "not-sent", {
          kind: "not-dispatched",
        });
      }
      const evidence = yield* pollDiplomacyResponsePostcondition({
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
        waitMs: diplomacyResponseWaitMs(context.endpointDefaults?.timeoutMs),
      });
      return diplomacyResponseResult(
        input,
        sendAttempt.dispatchStatus === "dispatched" ? "sent" : "unknown",
        evidence
      );
    }
    if (!sendAttempt.value.sent) {
      return diplomacyResponseResult(input, "not-sent", {
        kind: "validation-rejected",
      });
    }

    const evidence = yield* pollDiplomacyResponsePostcondition({
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
      waitMs: diplomacyResponseWaitMs(context.endpointDefaults?.timeoutMs),
    });
    return diplomacyResponseResult(input, "sent", evidence);
  });
}

type DiplomacyResponseSendAttempt =
  | Readonly<{ ok: true; value: Civ7ControlOrpcDiplomacyResponseSendResult }>
  | Readonly<{ ok: false; dispatchStatus: Civ7ControlOrpcCommandDispatchStatus }>;

function attemptDiplomacyResponseSend(
  send: () => Promise<Civ7ControlOrpcDiplomacyResponseSendResult>
): Effect.Effect<DiplomacyResponseSendAttempt> {
  return Effect.promise(async () => {
    try {
      return { ok: true, value: await send() };
    } catch (cause) {
      return { ok: false, dispatchStatus: civ7DirectControlDispatchStatus(cause) };
    }
  });
}

function diplomacyResponseWaitMs(timeoutMs: number | undefined): number {
  return Math.min(
    MAX_DIPLOMACY_RESPONSE_WAIT_MS,
    Math.max(MIN_DIPLOMACY_RESPONSE_WAIT_MS, timeoutMs ?? DEFAULT_DIPLOMACY_RESPONSE_WAIT_MS)
  );
}

function directControlOptions(context: DiplomacyResponseRuntime, timeoutMs: number | undefined) {
  return timeoutMs === undefined
    ? context.endpointDefaults
    : {
        ...context.endpointDefaults,
        timeoutMs,
      };
}
