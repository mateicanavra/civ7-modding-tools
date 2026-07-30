import { Clock, Effect, Option } from "effect";

import type { Civ7ControlOrpcUnitTargetSnapshot } from "#civ7-control-service/model/ports/direct-control";
import type { Civ7UnitTargetAction, Civ7UnitTargetActionInput } from "../../contract";
import {
  type Civ7UnitTargetPostconditionEvidence,
  civ7UnitTargetPostcondition,
} from "./target-action-result";

const UNIT_TARGET_POLL_MS = 250;

type ObservedUnitTargetEvidence = Extract<
  Civ7UnitTargetPostconditionEvidence,
  { kind: "observed" }
>;
type UnitTargetPollEvidence =
  | ObservedUnitTargetEvidence
  | Readonly<{ kind: "postcheck-unavailable" }>;

/** Polls focused unit observations until the selected action is proven or the deadline expires. */
export function pollUnitTargetPostcondition(
  options: Readonly<{
    input: Civ7UnitTargetActionInput;
    action: Civ7UnitTargetAction;
    initial: ObservedUnitTargetEvidence;
    observe: (timeoutMs: number) => Promise<Civ7ControlOrpcUnitTargetSnapshot>;
    waitMs: number;
  }>
): Effect.Effect<UnitTargetPollEvidence> {
  if (isTerminal(options.initial)) return Effect.succeed(options.initial);

  return Effect.gen(function* () {
    const startedAt = yield* Clock.currentTimeMillis;
    const deadline = startedAt + options.waitMs;
    let latest = options.initial;
    let attempts = 0;
    let completed = 0;
    let failedAfterLatest = false;

    while (true) {
      const beforeDelay = yield* Clock.currentTimeMillis;
      const remainingBeforeDelay = deadline - beforeDelay;
      if (remainingBeforeDelay <= 0) break;

      const delayMs = attempts === 0 ? 0 : Math.min(UNIT_TARGET_POLL_MS, remainingBeforeDelay);
      if (delayMs > 0) yield* Effect.sleep(delayMs);

      const beforeRead = yield* Clock.currentTimeMillis;
      if (beforeRead >= deadline) break;
      const timeoutMs = Math.max(1, deadline - beforeRead);
      const attempted = yield* Effect.tryPromise(() => options.observe(timeoutMs)).pipe(
        Effect.option,
        Effect.timeoutOption(timeoutMs)
      );
      attempts += 1;
      if (Option.isNone(attempted) || Option.isNone(attempted.value)) {
        failedAfterLatest = true;
        continue;
      }

      completed += 1;
      failedAfterLatest = false;
      latest = {
        kind: "observed",
        input: options.input,
        action: options.action,
        before: options.initial.before,
        after: attempted.value.value,
      };
      if (isTerminal(latest)) return latest;
    }

    if (completed === 0 || failedAfterLatest) {
      return { kind: "postcheck-unavailable" };
    }
    return { ...latest, final: true };
  });
}

function isTerminal(evidence: ObservedUnitTargetEvidence): boolean {
  const classification = civ7UnitTargetPostcondition(evidence).classification;
  return (
    classification === "target-reached" ||
    classification === "units-swapped" ||
    classification === "attack-state-changed"
  );
}
