import type { ApplyTransactionInput } from "@internal/habitat-harness/core/domains/pattern-governance/index";
import { habitatServiceImplementer } from "../../impl.js";

export interface TransactionsServiceModuleContext {
  readonly transactionInputs?: readonly ApplyTransactionInput[];
}

export const implementer = habitatServiceImplementer.transactions.use(({ context, next }) =>
  next({ context: context.transactions ?? {} })
);
