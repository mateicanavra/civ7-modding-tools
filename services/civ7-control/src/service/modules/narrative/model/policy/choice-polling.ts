import { Clock, Effect, Option } from "effect";

import type {
  Civ7ControlOrpcNarrativeChoiceCheckResult,
  Civ7ControlOrpcNarrativeChoiceSendResult,
} from "#civ7-control-service/model/ports/direct-control";
import type { Civ7NarrativeChoiceInput } from "../../contract";
import {
  type Civ7NarrativeChoicePostconditionEvidence,
  civ7NarrativeChoicePostcondition,
} from "./choice-postcondition";

const NARRATIVE_CHOICE_POLL_MS = 250;

type ObservedNarrativeChoiceEvidence = Extract<
  Civ7NarrativeChoicePostconditionEvidence,
  { kind: "observed" }
>;
type NarrativeChoicePollEvidence =
  | ObservedNarrativeChoiceEvidence
  | Readonly<{ kind: "postcheck-unavailable" }>;

/** Polls one bounded Effect deadline until exact narrative blocker clearance is confirmed. */
export function pollNarrativeChoicePostcondition(
  options: Readonly<{
    input: Civ7NarrativeChoiceInput;
    send: Extract<Civ7ControlOrpcNarrativeChoiceSendResult, { sent: true }>;
    check: (timeoutMs: number) => Promise<Civ7ControlOrpcNarrativeChoiceCheckResult>;
    waitMs: number;
  }>
): Effect.Effect<NarrativeChoicePollEvidence> {
  const initial: ObservedNarrativeChoiceEvidence = {
    kind: "observed",
    input: options.input,
    beforeValidation: options.send.validation,
    afterValidation: options.send.validation,
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

      const delayMs = attempts === 0 ? 0 : Math.min(NARRATIVE_CHOICE_POLL_MS, remainingBeforeDelay);
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
        beforeValidation: options.send.validation,
        afterValidation: {
          valid: check.valid,
          result: check.result,
        },
        before: options.send.before,
        after: check.snapshot,
      };
      if (isConfirmed(latest)) return latest;
    }

    return completed === 0 && failed ? { kind: "postcheck-unavailable" } : latest;
  });
}

function isConfirmed(evidence: ObservedNarrativeChoiceEvidence): boolean {
  return civ7NarrativeChoicePostcondition(evidence).confidence === "confirmed";
}
