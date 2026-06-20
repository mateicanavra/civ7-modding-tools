import type { Layer } from "effect";
import type { ApplyTransactionInput } from "../../../domains/pattern-governance/index.js";
import type { GritProvider } from "../../../providers/grit/index.js";

export interface TransactionsServiceContext {
  readonly transactions?: TransactionsServiceOptions;
}

export interface TransactionsServiceOptions {
  readonly providerLayer?: Layer.Layer<GritProvider>;
  readonly transactionInputs?: readonly ApplyTransactionInput[];
}
