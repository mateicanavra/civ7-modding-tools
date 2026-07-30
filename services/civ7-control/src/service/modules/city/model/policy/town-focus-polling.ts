import { Clock, Effect, Option } from "effect";

import type {
  Civ7ControlOrpcTownFocusChangeCheckResult,
  Civ7ControlOrpcTownFocusChangeSendResult,
  Civ7ControlOrpcTownFocusReviewCheckResult,
  Civ7ControlOrpcTownFocusReviewSendResult,
} from "#civ7-control-service/model/ports/direct-control";
import type { Civ7CityTownFocusChangeInput, Civ7CityTownFocusReviewInput } from "../../contract";
import {
  type Civ7TownFocusChangePostconditionEvidence,
  type Civ7TownFocusReviewPostconditionEvidence,
  civ7TownFocusChangePostcondition,
  civ7TownFocusReviewPostcondition,
} from "./town-focus-postcondition";

const TOWN_FOCUS_POLL_MS = 250;
type TownFocusChangePollEvidence = Extract<
  Civ7TownFocusChangePostconditionEvidence,
  { kind: "observed" | "postcheck-unavailable" }
>;
type TownFocusReviewPollEvidence = Extract<
  Civ7TownFocusReviewPostconditionEvidence,
  { kind: "observed" | "postcheck-unavailable" }
>;

export function pollTownFocusChangePostcondition(
  options: Readonly<{
    input: Civ7CityTownFocusChangeInput;
    send: Extract<Civ7ControlOrpcTownFocusChangeSendResult, { sent: true }>;
    check: (timeoutMs: number) => Promise<Civ7ControlOrpcTownFocusChangeCheckResult>;
    waitMs: number;
  }>
): Effect.Effect<TownFocusChangePollEvidence> {
  const initial: TownFocusChangePollEvidence = {
    kind: "observed",
    input: options.input,
    before: options.send.before,
    after: options.send.after,
  };
  return pollTownFocusPostcondition<
    Civ7ControlOrpcTownFocusChangeCheckResult,
    TownFocusChangePollEvidence
  >({
    initial,
    unavailable: { kind: "postcheck-unavailable" },
    waitMs: options.waitMs,
    confirmed: (evidence) => civ7TownFocusChangePostcondition(evidence).confidence === "confirmed",
    check: options.check,
    observe: (check): TownFocusChangePollEvidence => ({
      kind: "observed",
      input: options.input,
      before: options.send.before,
      after: check.snapshot,
    }),
  });
}

export function pollTownFocusReviewPostcondition(
  options: Readonly<{
    input: Civ7CityTownFocusReviewInput;
    send: Civ7ControlOrpcTownFocusReviewSendResult;
    check: (timeoutMs: number) => Promise<Civ7ControlOrpcTownFocusReviewCheckResult>;
    waitMs: number;
  }>
): Effect.Effect<TownFocusReviewPollEvidence> {
  const initial: TownFocusReviewPollEvidence = {
    kind: "observed",
    input: options.input,
    before: options.send.before,
    after: options.send.after,
  };
  return pollTownFocusPostcondition<
    Civ7ControlOrpcTownFocusReviewCheckResult,
    TownFocusReviewPollEvidence
  >({
    initial,
    unavailable: { kind: "postcheck-unavailable" },
    waitMs: options.waitMs,
    confirmed: (evidence) => civ7TownFocusReviewPostcondition(evidence).confidence === "confirmed",
    check: options.check,
    observe: (check): TownFocusReviewPollEvidence => ({
      kind: "observed",
      input: options.input,
      before: options.send.before,
      after: check.snapshot,
    }),
  });
}

function pollTownFocusPostcondition<Check, Evidence>(
  options: Readonly<{
    initial: Evidence;
    unavailable: Evidence;
    waitMs: number;
    confirmed: (evidence: Evidence) => boolean;
    check: (timeoutMs: number) => Promise<Check>;
    observe: (check: Check) => Evidence;
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

      const delayMs = attempts === 0 ? 0 : Math.min(TOWN_FOCUS_POLL_MS, remainingBeforeDelay);
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
