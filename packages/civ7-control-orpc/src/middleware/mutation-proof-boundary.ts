import { civ7ControlOrpcErrorCorrelationData } from "../model/correlation";
import { civ7ControlOrpcImplementer } from "../procedure";

import { civ7MutationProcedureKey } from "./mutation-procedure-key";

export type Civ7MutationProofBoundaryViolation =
  | "missing-postcondition"
  | "missing-no-repeat-boundary"
  | "unverified-repeat-safe"
  | "sent-unverified-without-do-not-repeat"
  | "sent-guarded-without-do-not-repeat";

export const civ7MutationProofBoundaryMiddleware =
  civ7ControlOrpcImplementer.middleware(async (
    { context, errors, next, path, procedure },
  ) => {
    const result = await next();
    const violation = civ7MutationProofBoundaryViolation(result.output);
    if (violation == null) return result;

    throw errors.MUTATION_PROOF_BOUNDARY_INVALID({
      data: {
        procedureKey: civ7MutationProcedureKey(procedure["~orpc"].meta, path),
        source: "mutation-proof-boundary",
        risk: "mutation",
        reason: violation,
        ...civ7ControlOrpcErrorCorrelationData(context),
      },
    });
  });

export function civ7MutationProofBoundaryViolation(
  output: unknown,
): Civ7MutationProofBoundaryViolation | null {
  if (!isRecord(output)) return "missing-postcondition";

  const postcondition = output.postcondition;
  if (!isRecord(postcondition)) return "missing-postcondition";

  const noRepeatAfterUnverified = postcondition.noRepeatAfterUnverified;
  if (typeof noRepeatAfterUnverified !== "boolean") {
    return "missing-no-repeat-boundary";
  }

  const confidence = postcondition.confidence;
  const status = output.status;
  if (
    (confidence === "unverified" || confidence === "pending-runtime-proof")
    && !noRepeatAfterUnverified
  ) {
    return "unverified-repeat-safe";
  }

  if (status === "sent-unverified" && !hasDoNotRepeatNextStep(output)) {
    return "sent-unverified-without-do-not-repeat";
  }

  if (status === "sent-guarded" && !hasDoNotRepeatNextStep(output)) {
    return "sent-guarded-without-do-not-repeat";
  }

  return null;
}

function hasDoNotRepeatNextStep(output: Record<string, unknown>): boolean {
  const nextSteps = output.nextSteps;
  return Array.isArray(nextSteps)
    && nextSteps.some((step) => isRecord(step) && step.kind === "do-not-repeat");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
