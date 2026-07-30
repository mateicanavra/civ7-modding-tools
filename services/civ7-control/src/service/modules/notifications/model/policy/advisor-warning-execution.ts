import { Cause, Effect } from "effect";

import { civ7DirectControlDispatchStatus } from "#civ7-control-service/model/policy/direct-control-failure";
import type { Civ7ControlOrpcContext } from "#civ7-control-service/model/ports/context";
import type {
  Civ7ControlOrpcAdvisorWarningViewedSendResult,
  Civ7ControlOrpcCommandDispatchStatus,
} from "#civ7-control-service/model/ports/direct-control";
import type {
  Civ7NotificationAdvisorWarningViewedInput,
  Civ7NotificationAdvisorWarningViewedResult,
} from "../../contract";
import { pollAdvisorWarningViewedPostcondition } from "./advisor-warning-polling";
import {
  advisorWarningViewedAvailable,
  advisorWarningViewedResult,
  type Civ7AdvisorWarningViewedDispatchState,
} from "./advisor-warning-result";

const DEFAULT_ADVISOR_WARNING_WAIT_MS = 3_000;
const MIN_ADVISOR_WARNING_WAIT_MS = 1_000;
const MAX_ADVISOR_WARNING_WAIT_MS = 6_000;

type AdvisorWarningRuntime = Pick<Civ7ControlOrpcContext, "directControl" | "endpointDefaults">;

/** Executes service-owned admission, guarded send, and bounded clearance observation. */
export function acknowledgeCiv7AdvisorWarningViewed(
  input: Civ7NotificationAdvisorWarningViewedInput,
  context: AdvisorWarningRuntime
): Effect.Effect<Civ7NotificationAdvisorWarningViewedResult, unknown> {
  const check = (timeoutMs?: number) =>
    context.directControl.checkCiv7AdvisorWarningViewed(
      input,
      directControlOptions(context, timeoutMs)
    );

  return Effect.gen(function* () {
    const precheck = yield* Effect.tryPromise({
      try: () => check(),
      catch: (cause) => new Cause.UnknownException(cause),
    });
    if (!advisorWarningViewedAvailable(input.target, precheck)) {
      return advisorWarningViewedResult(input.target, "not-sent", {
        kind: "not-admitted",
      });
    }

    const sendAttempt = yield* attemptAdvisorWarningSend(() =>
      context.directControl.sendCiv7AdvisorWarningViewed(
        {
          target: input.target,
          expected: precheck.snapshot,
        },
        context.endpointDefaults
      )
    ).pipe(Effect.uninterruptible);

    if (!sendAttempt.ok && sendAttempt.dispatchStatus === "not-dispatched") {
      return advisorWarningViewedResult(input.target, "not-sent", {
        kind: "not-dispatched",
      });
    }
    if (sendAttempt.ok && !sendAttempt.value.sent) {
      return advisorWarningViewedResult(input.target, "not-sent", {
        kind: "validation-rejected",
      });
    }

    const dispatchState: Civ7AdvisorWarningViewedDispatchState =
      sendAttempt.ok || sendAttempt.dispatchStatus === "dispatched" ? "sent" : "unknown";
    const evidence = yield* pollAdvisorWarningViewedPostcondition({
      before: sendAttempt.ok ? sendAttempt.value.before : precheck.snapshot,
      ...(sendAttempt.ok ? { initialAfter: sendAttempt.value.after } : {}),
      check: (timeoutMs) => check(timeoutMs),
      waitMs: advisorWarningWaitMs(context.endpointDefaults?.timeoutMs),
    });
    return advisorWarningViewedResult(input.target, dispatchState, evidence);
  });
}

type AdvisorWarningSendAttempt =
  | Readonly<{ ok: true; value: Civ7ControlOrpcAdvisorWarningViewedSendResult }>
  | Readonly<{ ok: false; dispatchStatus: Civ7ControlOrpcCommandDispatchStatus }>;

function attemptAdvisorWarningSend(
  send: () => Promise<Civ7ControlOrpcAdvisorWarningViewedSendResult>
): Effect.Effect<AdvisorWarningSendAttempt> {
  return Effect.promise(async () => {
    try {
      return { ok: true, value: await send() };
    } catch (cause) {
      return { ok: false, dispatchStatus: civ7DirectControlDispatchStatus(cause) };
    }
  });
}

function advisorWarningWaitMs(timeoutMs: number | undefined): number {
  return Math.min(
    MAX_ADVISOR_WARNING_WAIT_MS,
    Math.max(MIN_ADVISOR_WARNING_WAIT_MS, timeoutMs ?? DEFAULT_ADVISOR_WARNING_WAIT_MS)
  );
}

function directControlOptions(context: AdvisorWarningRuntime, timeoutMs: number | undefined) {
  return timeoutMs === undefined
    ? context.endpointDefaults
    : {
        ...context.endpointDefaults,
        timeoutMs,
      };
}
