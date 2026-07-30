import { Clock, Effect, Option } from "effect";

import type { Civ7ControlOrpcFirstMeetResponseCheckResult } from "#civ7-control-service/model/ports/direct-control";
import type { Civ7FirstMeetResponseInput } from "../../contract";
import {
  type Civ7FirstMeetResponsePostconditionEvidence,
  civ7FirstMeetResponsePostcondition,
} from "./first-meet-result";

const FIRST_MEET_RESPONSE_POLL_MS = 250;

type ObservedFirstMeetResponseEvidence = Extract<
  Civ7FirstMeetResponsePostconditionEvidence,
  { kind: "observed" }
>;
type FirstMeetResponsePollEvidence =
  | ObservedFirstMeetResponseEvidence
  | Readonly<{ kind: "postcheck-unavailable" }>;

/** Polls one bounded Effect deadline until the exact pre-send blocker clears. */
export function pollFirstMeetResponsePostcondition(
  options: Readonly<{
    input: Civ7FirstMeetResponseInput;
    initial: ObservedFirstMeetResponseEvidence;
    check: (timeoutMs: number) => Promise<Civ7ControlOrpcFirstMeetResponseCheckResult>;
    waitMs: number;
  }>
): Effect.Effect<FirstMeetResponsePollEvidence> {
  const initial = options.initial;
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

      const delayMs =
        attempts === 0 ? 0 : Math.min(FIRST_MEET_RESPONSE_POLL_MS, remainingBeforeDelay);
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

      const check = attempted.value.value;
      completed += 1;
      latest = {
        kind: "observed",
        input: options.input,
        beforeValidation: initial.beforeValidation,
        afterValidation: {
          valid: check.valid,
          result: check.result,
        },
        before: initial.before,
        after: check.snapshot,
      };
      if (isConfirmed(latest)) return latest;
    }

    return completed === 0 && failed ? { kind: "postcheck-unavailable" } : latest;
  });
}

function isConfirmed(evidence: ObservedFirstMeetResponseEvidence): boolean {
  return civ7FirstMeetResponsePostcondition(evidence).confidence === "confirmed";
}
