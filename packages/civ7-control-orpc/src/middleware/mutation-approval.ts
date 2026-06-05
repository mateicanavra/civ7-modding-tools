import type { Civ7ActionApproval } from "@civ7/direct-control";

import { civ7ControlOrpcErrorCorrelationData } from "../model/correlation";
import { civ7ControlOrpcImplementer } from "../procedure";

import { civ7MutationProcedureKey } from "./mutation-procedure-key";

export const civ7MutationApprovalMiddleware =
  civ7ControlOrpcImplementer.middleware((
    { context, errors, next, path, procedure },
  ) => {
    const approval = mutationApprovalFromContext(context.approval);
    if (approval == null) {
      throw errors.MUTATION_APPROVAL_REQUIRED({
        data: {
          procedureKey: civ7MutationProcedureKey(procedure["~orpc"].meta, path),
          source: "context.approval",
          risk: "mutation",
          ...civ7ControlOrpcErrorCorrelationData(context),
        },
      });
    }

    return next({ context: { approval } });
  });

function mutationApprovalFromContext(
  approval: Civ7ActionApproval | undefined,
): Civ7ActionApproval | null {
  if (approval?.approved !== true) return null;
  if (!approval.reason.trim()) return null;
  return approval;
}
