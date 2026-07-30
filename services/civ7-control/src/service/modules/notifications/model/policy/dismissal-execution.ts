import { Cause, Effect } from "effect";

import { civ7DirectControlDispatchStatus } from "#civ7-control-service/model/policy/direct-control-failure";
import type { Civ7ControlOrpcContext } from "#civ7-control-service/model/ports/context";
import type {
  Civ7ControlOrpcCommandDispatchStatus,
  Civ7ControlOrpcNotificationDismissalSendResult,
} from "#civ7-control-service/model/ports/direct-control";
import type {
  Civ7NotificationDismissalInput,
  Civ7NotificationDismissalResult,
} from "../../contract";
import { pollNotificationDismissalPostcondition } from "./dismissal-polling";
import {
  type Civ7NotificationDismissalDispatchState,
  notificationDismissalAvailable,
  notificationDismissalResult,
} from "./dismissal-result";

const DEFAULT_NOTIFICATION_DISMISSAL_WAIT_MS = 3_000;
const MIN_NOTIFICATION_DISMISSAL_WAIT_MS = 1_000;
const MAX_NOTIFICATION_DISMISSAL_WAIT_MS = 6_000;

type NotificationDismissalRuntime = Pick<
  Civ7ControlOrpcContext,
  "directControl" | "endpointDefaults"
>;

/**
 * Executes the service-owned dismissal policy shared by item and reviewed-queue procedures.
 */
export function dismissCiv7Notification(
  input: Civ7NotificationDismissalInput,
  context: NotificationDismissalRuntime
): Effect.Effect<Civ7NotificationDismissalResult, unknown> {
  const check = (timeoutMs?: number) =>
    context.directControl.checkCiv7NotificationDismissal(
      input,
      directControlOptions(context, timeoutMs)
    );

  return Effect.gen(function* () {
    const precheck = yield* Effect.tryPromise({
      try: () => check(),
      catch: (cause) => new Cause.UnknownException(cause),
    });
    if (!notificationDismissalAvailable(precheck)) {
      return notificationDismissalResult(input.notificationId, "not-sent", {
        kind: "not-admitted",
      });
    }

    const sendAttempt = yield* attemptNotificationDismissalSend(() =>
      context.directControl.sendCiv7NotificationDismissal(
        { expected: precheck.snapshot },
        context.endpointDefaults
      )
    ).pipe(Effect.uninterruptible);
    if (!sendAttempt.ok && sendAttempt.dispatchStatus === "not-dispatched") {
      return notificationDismissalResult(input.notificationId, "not-sent", {
        kind: "not-dispatched",
      });
    }

    const dispatchState: Civ7NotificationDismissalDispatchState = sendAttempt.ok
      ? "sent"
      : "unknown";
    const evidence = yield* pollNotificationDismissalPostcondition({
      before: sendAttempt.ok ? sendAttempt.value.before : precheck.snapshot,
      ...(sendAttempt.ok ? { initialAfter: sendAttempt.value.after } : {}),
      check: (timeoutMs) => check(timeoutMs),
      waitMs: notificationDismissalWaitMs(context.endpointDefaults?.timeoutMs),
    });
    return notificationDismissalResult(input.notificationId, dispatchState, evidence);
  });
}

type NotificationDismissalSendAttempt =
  | Readonly<{ ok: true; value: Civ7ControlOrpcNotificationDismissalSendResult }>
  | Readonly<{ ok: false; dispatchStatus: Civ7ControlOrpcCommandDispatchStatus }>;

function attemptNotificationDismissalSend(
  send: () => Promise<Civ7ControlOrpcNotificationDismissalSendResult>
): Effect.Effect<NotificationDismissalSendAttempt> {
  return Effect.promise(async () => {
    try {
      return { ok: true, value: await send() };
    } catch (cause) {
      return { ok: false, dispatchStatus: civ7DirectControlDispatchStatus(cause) };
    }
  });
}

function notificationDismissalWaitMs(timeoutMs: number | undefined): number {
  return Math.min(
    MAX_NOTIFICATION_DISMISSAL_WAIT_MS,
    Math.max(
      MIN_NOTIFICATION_DISMISSAL_WAIT_MS,
      timeoutMs ?? DEFAULT_NOTIFICATION_DISMISSAL_WAIT_MS
    )
  );
}

function directControlOptions(
  context: NotificationDismissalRuntime,
  timeoutMs: number | undefined
) {
  return timeoutMs === undefined
    ? context.endpointDefaults
    : {
        ...context.endpointDefaults,
        timeoutMs,
      };
}
