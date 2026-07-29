import { Clock, Effect, Option } from "effect";

import type { Civ7ControlOrpcDiplomacyResponseCheckResult } from "#civ7-control-service/model/ports/direct-control";
import type { Civ7DiplomacyResponseInput } from "../../contract";
import {
  type Civ7DiplomacyResponsePostconditionEvidence,
  civ7DiplomacyResponsePostcondition,
} from "./diplomacy-response-result";

const DIPLOMACY_RESPONSE_POLL_MS = 250;

type ObservedDiplomacyResponseEvidence = Extract<
  Civ7DiplomacyResponsePostconditionEvidence,
  { kind: "observed" }
>;
type DiplomacyResponsePollEvidence =
  | ObservedDiplomacyResponseEvidence
  | Readonly<{ kind: "postcheck-unavailable" }>;

/** Polls one bounded Effect deadline until the exact pre-send diplomacy blocker clears. */
export function pollDiplomacyResponsePostcondition(
  options: Readonly<{
    input: Civ7DiplomacyResponseInput;
    initial: ObservedDiplomacyResponseEvidence;
    check: (timeoutMs: number) => Promise<Civ7ControlOrpcDiplomacyResponseCheckResult>;
    waitMs: number;
  }>
): Effect.Effect<DiplomacyResponsePollEvidence> {
  if (isConfirmed(options.initial)) return Effect.succeed(options.initial);

  return Effect.gen(function* () {
    const startedAt = yield* Clock.currentTimeMillis;
    const deadline = startedAt + options.waitMs;
    let latest = options.initial;
    let attempts = 0;
    let completed = 0;
    let failed = false;

    while (true) {
      const beforeDelay = yield* Clock.currentTimeMillis;
      const remainingBeforeDelay = deadline - beforeDelay;
      if (remainingBeforeDelay <= 0) break;

      const delayMs =
        attempts === 0 ? 0 : Math.min(DIPLOMACY_RESPONSE_POLL_MS, remainingBeforeDelay);
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
        beforeValidation: options.initial.beforeValidation,
        afterValidation: {
          valid: check.valid,
          result: check.result,
        },
        before: options.initial.before,
        after: check.snapshot,
      };
      if (isConfirmed(latest)) return latest;
    }

    return completed === 0 && failed ? { kind: "postcheck-unavailable" } : latest;
  });
}

function isConfirmed(evidence: ObservedDiplomacyResponseEvidence): boolean {
  return civ7DiplomacyResponsePostcondition(evidence).confidence === "confirmed";
}
