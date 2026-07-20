import { Effect, Match, Option, Predicate } from "effect";
import type { EffectMiddlewareOptions } from "effect-orpc";

import type { Civ7ControlOrpcContext } from "../context";
import type { Civ7ControlOrpcErrorMap } from "../errors";
import type { Civ7ControlOrpcProcedureMeta } from "../metadata";
import { civ7ControlOrpcErrorCorrelationData } from "../model/correlation";

import { civ7MutationProcedureKey } from "./mutation-procedure-key";

export type Civ7MutationProofBoundaryViolation =
  | "missing-postcondition"
  | "missing-no-repeat-boundary"
  | "unverified-repeat-safe"
  | "sent-unverified-without-do-not-repeat"
  | "sent-guarded-without-do-not-repeat";

type Civ7MutationProofBoundaryErrorMap = Pick<
  Civ7ControlOrpcErrorMap,
  "MUTATION_PROOF_BOUNDARY_INVALID"
>;

type Civ7MutationProofBoundaryMiddlewareOptions<TOutput> = EffectMiddlewareOptions<
  Civ7ControlOrpcContext,
  TOutput,
  Civ7MutationProofBoundaryErrorMap,
  never,
  Civ7ControlOrpcProcedureMeta
>;

export function* civ7MutationProofBoundaryMiddleware<TOutput>({
  context,
  errors,
  next,
  path,
  procedure,
}: Civ7MutationProofBoundaryMiddlewareOptions<TOutput>) {
  const result = yield* next();
  const violation = civ7MutationProofBoundaryViolation(result.output);
  return yield* Option.match(violation, {
    onNone: () => Effect.succeed(result),
    onSome: (reason) =>
      Effect.fail(
        errors.MUTATION_PROOF_BOUNDARY_INVALID({
          data: {
            procedureKey: civ7MutationProcedureKey(procedure["~orpc"].meta, path),
            source: "mutation-proof-boundary",
            risk: "mutation",
            reason,
            ...civ7ControlOrpcErrorCorrelationData(context),
          },
        })
      ),
  });
}

const missingPostcondition = () =>
  Option.some<Civ7MutationProofBoundaryViolation>("missing-postcondition");

const mutationProofBoundaryViolationForObservedPostcondition = (
  output: Record<string, unknown>,
  postcondition: Record<string, unknown>
) =>
  Match.value(postcondition.noRepeatAfterUnverified).pipe(
    Match.when(Predicate.isBoolean, (noRepeat) =>
      mutationProofBoundaryViolationForPostcondition(output, postcondition, noRepeat)
    ),
    Match.orElse(() =>
      Option.some<Civ7MutationProofBoundaryViolation>("missing-no-repeat-boundary")
    )
  );

const mutationProofBoundaryViolationForOutput = (output: Record<string, unknown>) =>
  Option.liftPredicate(output.postcondition, isRecord).pipe(
    Option.match({
      onNone: missingPostcondition,
      onSome: (postcondition) =>
        mutationProofBoundaryViolationForObservedPostcondition(output, postcondition),
    })
  );

export const civ7MutationProofBoundaryViolation = (
  output: unknown
): Option.Option<Civ7MutationProofBoundaryViolation> =>
  Option.liftPredicate(output, isRecord).pipe(
    Option.match({
      onNone: missingPostcondition,
      onSome: mutationProofBoundaryViolationForOutput,
    })
  );

function mutationProofBoundaryViolationForPostcondition(
  output: Record<string, unknown>,
  postcondition: Record<string, unknown>,
  noRepeatAfterUnverified: boolean
): Option.Option<Civ7MutationProofBoundaryViolation> {
  const confidence = postcondition.confidence;
  const status = output.status;
  const hasDoNotRepeat = hasDoNotRepeatNextStep(output);
  const unverifiedRepeatSafe =
    (confidence === "unverified" || confidence === "pending-runtime-proof") &&
    !noRepeatAfterUnverified;
  return Match.value({ hasDoNotRepeat, status, unverifiedRepeatSafe }).pipe(
    Match.when({ unverifiedRepeatSafe: true }, () =>
      Option.some<Civ7MutationProofBoundaryViolation>("unverified-repeat-safe")
    ),
    Match.when({ status: "sent-unverified", hasDoNotRepeat: false }, () =>
      Option.some<Civ7MutationProofBoundaryViolation>("sent-unverified-without-do-not-repeat")
    ),
    Match.when({ status: "sent-guarded", hasDoNotRepeat: false }, () =>
      Option.some<Civ7MutationProofBoundaryViolation>("sent-guarded-without-do-not-repeat")
    ),
    Match.orElse(() => Option.none<Civ7MutationProofBoundaryViolation>())
  );
}

function hasDoNotRepeatNextStep(output: Record<string, unknown>): boolean {
  const nextSteps = output.nextSteps;
  return (
    Array.isArray(nextSteps) &&
    nextSteps.some((step) => isRecord(step) && step.kind === "do-not-repeat")
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
