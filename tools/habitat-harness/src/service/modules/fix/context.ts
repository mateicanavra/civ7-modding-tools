import type {
  ApplyAdmission,
  ApplyTransactionInput,
} from "@internal/habitat-harness/service/modules/fix/patterns/index";
import type { WorktreeObservation } from "@internal/habitat-harness/service/modules/fix/transactions/index";
import { habitatServiceImplementer } from "../../impl.js";

export interface FixServiceModuleContext {
  admissions?: readonly ApplyAdmission[];
  transactionInputs?: readonly ApplyTransactionInput[];
  worktree?: WorktreeObservation;
}

export const implementer = habitatServiceImplementer.fix.use(({ context, next }) =>
  next({ context: context.fix ?? {} })
);
