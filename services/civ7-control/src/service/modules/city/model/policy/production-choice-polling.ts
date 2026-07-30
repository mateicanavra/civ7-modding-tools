import { Clock, Effect, Option } from "effect";

import type {
  Civ7ControlOrpcProductionChoiceCheckResult,
  Civ7ControlOrpcProductionChoiceSendResult,
  Civ7ControlOrpcProductionChoiceValidationResult,
} from "#civ7-control-service/model/ports/direct-control";
import type { Civ7CityProductionChoiceInput } from "../../contract";
import {
  type Civ7ProductionChoicePostconditionEvidence,
  civ7ProductionChoicePostcondition,
} from "./production-choice-postcondition";

const PRODUCTION_CHOICE_POLL_MS = 250;

type ObservedProductionChoiceEvidence = Extract<
  Civ7ProductionChoicePostconditionEvidence,
  { kind: "observed" }
>;

type ProductionChoicePollState =
  | Readonly<{
      kind: "polling";
      attempts: number;
      completedPostchecks: number;
      sawPostcheckFailure: boolean;
      evidence: ObservedProductionChoiceEvidence;
    }>
  | Readonly<{
      kind: "resolved";
      evidence: Civ7ProductionChoicePostconditionEvidence;
    }>;

/** Polls bounded native production reads until evidence confirms the request or time expires. */
export function pollProductionChoicePostcondition(
  options: Readonly<{
    input: Civ7CityProductionChoiceInput;
    send: Civ7ControlOrpcProductionChoiceSendResult;
    check: (timeoutMs: number) => Promise<Civ7ControlOrpcProductionChoiceCheckResult>;
    waitMs: number;
  }>
): Effect.Effect<Civ7ProductionChoicePostconditionEvidence> {
  const initialEvidence = observedProductionChoiceEvidence({
    input: options.input,
    beforeValidation: options.send.validation,
    afterValidation: options.send.validation,
    before: options.send.before,
    after: options.send.after,
  });
  if (civ7ProductionChoicePostcondition(initialEvidence).confidence === "confirmed") {
    return Effect.succeed(initialEvidence);
  }

  return Effect.gen(function* () {
    const startedAt = yield* Clock.currentTimeMillis;
    const deadline = startedAt + options.waitMs;
    const initial: ProductionChoicePollState = {
      kind: "polling",
      attempts: 0,
      completedPostchecks: 0,
      sawPostcheckFailure: false,
      evidence: initialEvidence,
    };
    const terminal = yield* Effect.iterate<ProductionChoicePollState, never, never>(initial, {
      while: (state) => state.kind === "polling",
      body: (state) => productionChoicePollIteration(options, deadline, state),
    });
    return terminal.evidence;
  });
}

function productionChoicePollIteration(
  options: Readonly<{
    input: Civ7CityProductionChoiceInput;
    send: Civ7ControlOrpcProductionChoiceSendResult;
    check: (timeoutMs: number) => Promise<Civ7ControlOrpcProductionChoiceCheckResult>;
    waitMs: number;
  }>,
  deadline: number,
  state: ProductionChoicePollState
): Effect.Effect<ProductionChoicePollState> {
  if (state.kind === "resolved") return Effect.succeed(state);
  return Effect.gen(function* () {
    const beforeDelay = yield* Clock.currentTimeMillis;
    const remainingBeforeDelay = deadline - beforeDelay;
    if (remainingBeforeDelay <= 0) {
      return {
        kind: "resolved",
        evidence: productionChoiceTerminalPollEvidence(state),
      } satisfies ProductionChoicePollState;
    }
    const delayMs =
      state.attempts === 0 ? 0 : Math.min(PRODUCTION_CHOICE_POLL_MS, remainingBeforeDelay);
    if (delayMs > 0) yield* Effect.sleep(delayMs);

    const beforeRead = yield* Clock.currentTimeMillis;
    if (beforeRead >= deadline) {
      return {
        kind: "resolved",
        evidence: productionChoiceTerminalPollEvidence(state),
      } satisfies ProductionChoicePollState;
    }
    const remainingBeforeRead = Math.max(1, deadline - beforeRead);
    const postcheck = yield* Effect.tryPromise(() => options.check(remainingBeforeRead)).pipe(
      Effect.option,
      Effect.timeoutOption(remainingBeforeRead)
    );
    if (Option.isNone(postcheck)) {
      return {
        kind: "resolved",
        evidence: productionChoiceTerminalPollEvidence({
          ...state,
          attempts: state.attempts + 1,
          sawPostcheckFailure: true,
        }),
      } satisfies ProductionChoicePollState;
    }
    const completed = postcheck.value;
    if (Option.isNone(completed)) {
      const failedAt = yield* Clock.currentTimeMillis;
      const failedState = {
        ...state,
        attempts: state.attempts + 1,
        sawPostcheckFailure: true,
      } satisfies Extract<ProductionChoicePollState, { kind: "polling" }>;
      return failedAt < deadline
        ? failedState
        : ({
            kind: "resolved",
            evidence: productionChoiceTerminalPollEvidence(failedState),
          } satisfies ProductionChoicePollState);
    }

    const completedAt = yield* Clock.currentTimeMillis;
    const evidence = observedProductionChoiceEvidence({
      input: options.input,
      beforeValidation: options.send.validation,
      afterValidation: completed.value,
      before: options.send.before,
      after: completed.value.snapshot,
    });
    const confirmed = civ7ProductionChoicePostcondition(evidence).confidence === "confirmed";
    return !confirmed && completedAt < deadline
      ? ({
          kind: "polling",
          attempts: state.attempts + 1,
          completedPostchecks: state.completedPostchecks + 1,
          sawPostcheckFailure: state.sawPostcheckFailure,
          evidence,
        } satisfies ProductionChoicePollState)
      : ({
          kind: "resolved",
          evidence,
        } satisfies ProductionChoicePollState);
  });
}

function productionChoiceTerminalPollEvidence(
  state: Extract<ProductionChoicePollState, { kind: "polling" }>
): Civ7ProductionChoicePostconditionEvidence {
  return state.completedPostchecks === 0 && state.sawPostcheckFailure
    ? { kind: "postcheck-unavailable" }
    : state.evidence;
}

function observedProductionChoiceEvidence(
  input: Readonly<{
    input: Civ7CityProductionChoiceInput;
    beforeValidation: Civ7ControlOrpcProductionChoiceSendResult["validation"];
    afterValidation: Civ7ControlOrpcProductionChoiceValidationResult;
    before: Civ7ControlOrpcProductionChoiceSendResult["before"];
    after: Civ7ControlOrpcProductionChoiceSendResult["after"];
  }>
): ObservedProductionChoiceEvidence {
  return {
    kind: "observed",
    cityId: input.input.cityId,
    beforeValidation: input.beforeValidation,
    afterValidation: {
      valid: input.afterValidation.valid,
      result: input.afterValidation.result,
    },
    before: input.before,
    after: input.after,
  };
}
