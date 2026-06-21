import type {
  ApplyAdmission,
  ApplyTransactionInput,
} from "@internal/habitat-harness/core/domains/pattern-governance/index";
import type { WorktreeObservation } from "@internal/habitat-harness/core/domains/transformation-transaction/index";
import { habitatServiceImplementer } from "../../impl.js";

export interface FixServiceModuleContext {
  admissions?: readonly ApplyAdmission[];
  transactionInputs?: readonly ApplyTransactionInput[];
  worktree?: WorktreeObservation;
}

export const module = habitatServiceImplementer.fix.use(({ context, next }) =>
  next({ context: context.fix ?? {} })
);
