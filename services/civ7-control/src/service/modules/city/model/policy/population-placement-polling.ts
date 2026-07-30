import { Clock, Effect, Option } from "effect";

import type {
  Civ7ControlOrpcCityExpansionCheckResult,
  Civ7ControlOrpcCityExpansionSendResult,
  Civ7ControlOrpcWorkerAssignmentCheckResult,
  Civ7ControlOrpcWorkerAssignmentSendResult,
} from "#civ7-control-service/model/ports/direct-control";
import type { Civ7CityPopulationPlacementInput } from "../../contract";
import {
  type Civ7PopulationPlacementPostconditionEvidence,
  civ7PopulationPlacementPostcondition,
} from "./population-placement-postcondition";

const POPULATION_PLACEMENT_POLL_MS = 250;
type ObservedEvidence = Extract<
  Civ7PopulationPlacementPostconditionEvidence,
  { kind: "worker-observed" | "expansion-observed" }
>;
type PollEvidence = ObservedEvidence | Readonly<{ kind: "postcheck-unavailable" }>;

export function pollWorkerAssignmentPostcondition(
  options: Readonly<{
    input: Extract<Civ7CityPopulationPlacementInput, { mode: "assign-worker" }>;
    send: Extract<Civ7ControlOrpcWorkerAssignmentSendResult, { sent: true }>;
    check: (timeoutMs: number) => Promise<Civ7ControlOrpcWorkerAssignmentCheckResult>;
    waitMs: number;
  }>
): Effect.Effect<PollEvidence> {
  const initial: ObservedEvidence = {
    kind: "worker-observed",
    input: options.input,
    before: options.send.before,
    after: options.send.after,
  };
  return pollPopulationPlacementPostcondition({
    initial,
    waitMs: options.waitMs,
    check: options.check,
    observe: (check): ObservedEvidence => ({
      kind: "worker-observed",
      input: options.input,
      before: options.send.before,
      after: check.snapshot,
    }),
  });
}

export function pollCityExpansionPostcondition(
  options: Readonly<{
    input: Extract<Civ7CityPopulationPlacementInput, { mode: "expand-city" }>;
    send: Extract<Civ7ControlOrpcCityExpansionSendResult, { sent: true }>;
    check: (timeoutMs: number) => Promise<Civ7ControlOrpcCityExpansionCheckResult>;
    waitMs: number;
  }>
): Effect.Effect<PollEvidence> {
  const initial: ObservedEvidence = {
    kind: "expansion-observed",
    input: options.input,
    before: options.send.before,
    after: options.send.after,
  };
  return pollPopulationPlacementPostcondition({
    initial,
    waitMs: options.waitMs,
    check: options.check,
    observe: (check): ObservedEvidence => ({
      kind: "expansion-observed",
      input: options.input,
      before: options.send.before,
      after: check.snapshot,
    }),
  });
}

function pollPopulationPlacementPostcondition<Check>(
  options: Readonly<{
    initial: ObservedEvidence;
    waitMs: number;
    check: (timeoutMs: number) => Promise<Check>;
    observe: (check: Check) => ObservedEvidence;
  }>
): Effect.Effect<PollEvidence> {
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
        attempts === 0 ? 0 : Math.min(POPULATION_PLACEMENT_POLL_MS, remainingBeforeDelay);
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
      if (isConfirmed(latest)) return latest;
    }

    return completed === 0 && failed ? { kind: "postcheck-unavailable" } : latest;
  });
}

function isConfirmed(evidence: ObservedEvidence): boolean {
  return civ7PopulationPlacementPostcondition(evidence).confidence === "confirmed";
}
