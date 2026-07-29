import { Clock, Effect, Option } from "effect";

import type {
  Civ7ControlOrpcNotificationDismissalCheckResult,
  Civ7ControlOrpcNotificationDismissalSnapshot,
} from "#civ7-control-service/model/ports/direct-control";
import {
  type Civ7NotificationDismissalPostconditionEvidence,
  civ7NotificationDismissalPostcondition,
} from "./dismissal-result";

const NOTIFICATION_DISMISSAL_POLL_MS = 250;

type ObservedNotificationDismissalEvidence = Extract<
  Civ7NotificationDismissalPostconditionEvidence,
  { kind: "observed" }
>;
type NotificationDismissalPollEvidence =
  | ObservedNotificationDismissalEvidence
  | Readonly<{ kind: "postcheck-unavailable" }>;

/** Polls one bounded Effect deadline until exact notification clearance is confirmed. */
export function pollNotificationDismissalPostcondition(
  options: Readonly<{
    before: Civ7ControlOrpcNotificationDismissalSnapshot;
    initialAfter?: Civ7ControlOrpcNotificationDismissalSnapshot;
    check: (timeoutMs: number) => Promise<Civ7ControlOrpcNotificationDismissalCheckResult>;
    waitMs: number;
  }>
): Effect.Effect<NotificationDismissalPollEvidence> {
  const initial: ObservedNotificationDismissalEvidence | null =
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

      const delayMs =
        attempts === 0 ? 0 : Math.min(NOTIFICATION_DISMISSAL_POLL_MS, remainingBeforeDelay);
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

function isConfirmed(evidence: ObservedNotificationDismissalEvidence): boolean {
  return civ7NotificationDismissalPostcondition(evidence).confidence === "confirmed";
}
