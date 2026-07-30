import { Clock, Effect, Option } from "effect";

import type {
  Civ7ControlOrpcAdvisorWarningViewedCheckResult,
  Civ7ControlOrpcAdvisorWarningViewedSnapshot,
} from "#civ7-control-service/model/ports/direct-control";
import {
  type Civ7AdvisorWarningViewedPostconditionEvidence,
  civ7AdvisorWarningViewedPostcondition,
} from "./advisor-warning-result";

const ADVISOR_WARNING_POLL_MS = 250;

type ObservedAdvisorWarningEvidence = Extract<
  Civ7AdvisorWarningViewedPostconditionEvidence,
  { kind: "observed" }
>;
type AdvisorWarningPollEvidence =
  | ObservedAdvisorWarningEvidence
  | Readonly<{ kind: "postcheck-unavailable" }>;

/** Polls one bounded Effect deadline until exact advisor-warning clearance is confirmed. */
export function pollAdvisorWarningViewedPostcondition(
  options: Readonly<{
    before: Civ7ControlOrpcAdvisorWarningViewedSnapshot;
    initialAfter?: Civ7ControlOrpcAdvisorWarningViewedSnapshot;
    check: (timeoutMs: number) => Promise<Civ7ControlOrpcAdvisorWarningViewedCheckResult>;
    waitMs: number;
  }>
): Effect.Effect<AdvisorWarningPollEvidence> {
  const initial: ObservedAdvisorWarningEvidence | null =
    options.initialAfter === undefined
      ? null
      : {
          kind: "observed",
          before: options.before,
          after: options.initialAfter,
        };
  if (initial !== null && isConfirmed(initial)) return Effect.succeed(initial);

  return Effect.gen(function* () {
    const startedAt = yield* Clock.currentTimeMillis;
    const deadline = startedAt + options.waitMs;
    let latest = initial;
    let attempts = 0;

    while (true) {
      const beforeDelay = yield* Clock.currentTimeMillis;
      const remainingBeforeDelay = deadline - beforeDelay;
      if (remainingBeforeDelay <= 0) break;

      const delayMs = attempts === 0 ? 0 : Math.min(ADVISOR_WARNING_POLL_MS, remainingBeforeDelay);
      if (delayMs > 0) yield* Effect.sleep(delayMs);

      const beforeRead = yield* Clock.currentTimeMillis;
      if (beforeRead >= deadline) break;
      const timeoutMs = Math.max(1, deadline - beforeRead);
      const attempted = yield* Effect.tryPromise(() => options.check(timeoutMs)).pipe(
        Effect.option,
        Effect.timeoutOption(timeoutMs)
      );
      attempts += 1;
      if (Option.isNone(attempted) || Option.isNone(attempted.value)) continue;

      latest = {
        kind: "observed",
        before: options.before,
        after: attempted.value.value.snapshot,
      };
      if (isConfirmed(latest)) return latest;
    }

    return latest ?? { kind: "postcheck-unavailable" };
  });
}

function isConfirmed(evidence: ObservedAdvisorWarningEvidence): boolean {
  return civ7AdvisorWarningViewedPostcondition(evidence).confidence === "confirmed";
}
