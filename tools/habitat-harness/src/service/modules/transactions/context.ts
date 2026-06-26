import type { Layer } from "effect";
import type { GritProvider } from "../../../adapters/grit/provider/index.js";
import type { ApplyTransactionInput } from "../../../domains/pattern-governance/index.js";

export interface TransactionsServiceContext {
  readonly transactions?: TransactionsServiceOptions;
}

export interface TransactionsServiceOptions {
  readonly providerLayer?: Layer.Layer<GritProvider>;
  readonly transactionInputs?: readonly ApplyTransactionInput[];
}
