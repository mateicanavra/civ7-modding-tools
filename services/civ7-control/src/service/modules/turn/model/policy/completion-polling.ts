import { Clock, Effect, Option } from "effect";

import type {
  Civ7ControlOrpcTurnCompletionCheckResult,
  Civ7ControlOrpcTurnCompletionSendResult,
} from "#civ7-control-service/model/ports/direct-control";
import {
  type Civ7TurnCompletionPostconditionEvidence,
  civ7TurnCompletionPostcondition,
} from "./completion-postcondition";

const TURN_COMPLETION_POLL_MS = 250;

type ObservedTurnCompletionEvidence = Extract<
  Civ7TurnCompletionPostconditionEvidence,
  { kind: "observed" }
>;
type TurnCompletionPollEvidence =
  | ObservedTurnCompletionEvidence
  | Readonly<{ kind: "postcheck-unavailable" }>;

/** Polls one bounded Effect deadline until turn advance or acknowledgement is confirmed. */
export function pollTurnCompletionPostcondition(
  options: Readonly<{
    send: Extract<Civ7ControlOrpcTurnCompletionSendResult, { sent: true }>;
    check: (timeoutMs: number) => Promise<Civ7ControlOrpcTurnCompletionCheckResult>;
    waitMs: number;
  }>
): Effect.Effect<TurnCompletionPollEvidence> {
  const initial: ObservedTurnCompletionEvidence = {
    kind: "observed",
    before: options.send.before,
    after: options.send.after,
  };
  if (isConfirmed(initial)) return Effect.succeed(initial);

  return Effect.gen(function* () {
    const startedAt = yield* Clock.currentTimeMillis;
    const deadline = startedAt + options.waitMs;
    let latest = initial;
    let attempts = 0;
    let completed = 0;
    let failed = false;

    while (true) {
      const beforeDelay = yield* Clock.currentTimeMillis;
      const remainingBeforeDelay = deadline - beforeDelay;
      if (remainingBeforeDelay <= 0) break;

      const delayMs = attempts === 0 ? 0 : Math.min(TURN_COMPLETION_POLL_MS, remainingBeforeDelay);
      if (delayMs > 0) yield* Effect.sleep(delayMs);

      const beforeRead = yield* Clock.currentTimeMillis;
      if (beforeRead >= deadline) break;
      const timeoutMs = Math.max(1, deadline - beforeRead);
      const attempted = yield* Effect.tryPromise(() => options.check(timeoutMs)).pipe(
        Effect.option,
        Effect.timeoutOption(timeoutMs)
      );
      attempts += 1;
      if (Option.isNone(attempted) || Option.isNone(attempted.value)) {
        failed = true;
        continue;
      }

      completed += 1;
      latest = {
        kind: "observed",
        before: options.send.before,
        after: attempted.value.value.snapshot,
      };
      if (isConfirmed(latest)) return latest;
    }

    return completed === 0 && failed ? { kind: "postcheck-unavailable" } : latest;
  });
}

function isConfirmed(evidence: ObservedTurnCompletionEvidence): boolean {
  return civ7TurnCompletionPostcondition(evidence).confidence === "confirmed";
}
