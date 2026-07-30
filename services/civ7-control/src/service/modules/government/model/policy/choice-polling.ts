import { Clock, Effect, Option } from "effect";

import type {
  Civ7ControlOrpcCelebrationChoiceCheckResult,
  Civ7ControlOrpcCelebrationChoiceSendResult,
  Civ7ControlOrpcGovernmentChoiceCheckResult,
  Civ7ControlOrpcGovernmentChoiceSendResult,
} from "#civ7-control-service/model/ports/direct-control";
import type {
  Civ7GovernmentCelebrationChoiceInput,
  Civ7GovernmentChoiceInput,
} from "../../contract";
import {
  type Civ7CelebrationChoicePostconditionEvidence,
  type Civ7GovernmentChoicePostconditionEvidence,
  civ7CelebrationChoicePostcondition,
  civ7GovernmentChoicePostcondition,
} from "./choice-postcondition";

const GOVERNMENT_CHOICE_POLL_MS = 250;

type GovernmentObservedEvidence = Extract<
  Civ7GovernmentChoicePostconditionEvidence,
  { kind: "observed" }
>;
type GovernmentPollEvidence =
  | GovernmentObservedEvidence
  | Readonly<{ kind: "postcheck-unavailable" }>;
type CelebrationObservedEvidence = Extract<
  Civ7CelebrationChoicePostconditionEvidence,
  { kind: "observed" }
>;
type CelebrationPollEvidence =
  | CelebrationObservedEvidence
  | Readonly<{ kind: "postcheck-unavailable" }>;

/** Polls bounded government state reads until the exact target transition is confirmed. */
export function pollGovernmentChoicePostcondition(
  options: Readonly<{
    input: Civ7GovernmentChoiceInput;
    send: Extract<Civ7ControlOrpcGovernmentChoiceSendResult, { sent: true }>;
    check: (timeoutMs: number) => Promise<Civ7ControlOrpcGovernmentChoiceCheckResult>;
    waitMs: number;
  }>
): Effect.Effect<GovernmentPollEvidence> {
  const initial: GovernmentObservedEvidence = {
    kind: "observed",
    input: options.input,
    before: options.send.before,
    after: options.send.after,
  };
  return pollChoicePostcondition<
    Civ7ControlOrpcGovernmentChoiceCheckResult,
    GovernmentPollEvidence
  >({
    initial,
    unavailable: { kind: "postcheck-unavailable" },
    waitMs: options.waitMs,
    check: options.check,
    observe: (check): GovernmentObservedEvidence => ({
      kind: "observed",
      input: options.input,
      before: options.send.before,
      after: check.snapshot,
    }),
    confirmed: (evidence) => civ7GovernmentChoicePostcondition(evidence).confidence === "confirmed",
  });
}

/** Polls bounded celebration state reads until the exact target transition is confirmed. */
export function pollCelebrationChoicePostcondition(
  options: Readonly<{
    input: Civ7GovernmentCelebrationChoiceInput;
    send: Extract<Civ7ControlOrpcCelebrationChoiceSendResult, { sent: true }>;
    check: (timeoutMs: number) => Promise<Civ7ControlOrpcCelebrationChoiceCheckResult>;
    waitMs: number;
  }>
): Effect.Effect<CelebrationPollEvidence> {
  const initial: CelebrationObservedEvidence = {
    kind: "observed",
    input: options.input,
    before: options.send.before,
    after: options.send.after,
  };
  return pollChoicePostcondition<
    Civ7ControlOrpcCelebrationChoiceCheckResult,
    CelebrationPollEvidence
  >({
    initial,
    unavailable: { kind: "postcheck-unavailable" },
    waitMs: options.waitMs,
    check: options.check,
    observe: (check): CelebrationObservedEvidence => ({
      kind: "observed",
      input: options.input,
      before: options.send.before,
      after: check.snapshot,
    }),
    confirmed: (evidence) =>
      civ7CelebrationChoicePostcondition(evidence).confidence === "confirmed",
  });
}

function pollChoicePostcondition<Check, Evidence>(
  options: Readonly<{
    initial: Evidence;
    unavailable: Evidence;
    waitMs: number;
    check: (timeoutMs: number) => Promise<Check>;
    observe: (check: Check) => Evidence;
    confirmed: (evidence: Evidence) => boolean;
  }>
): Effect.Effect<Evidence> {
  if (options.confirmed(options.initial)) return Effect.succeed(options.initial);

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
        attempts === 0 ? 0 : Math.min(GOVERNMENT_CHOICE_POLL_MS, remainingBeforeDelay);
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
      latest = options.observe(attempted.value.value);
      if (options.confirmed(latest)) return latest;
    }

    return completed === 0 && failed ? options.unavailable : latest;
  });
}
