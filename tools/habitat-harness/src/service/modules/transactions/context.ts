import type { Layer } from "effect";
import type { GritProvider } from "../../../providers/grit/index.js";
import type { ApplyTransactionInput } from "../../../rules/patterns/index.js";

export interface TransactionsServiceContext {
  readonly transactions?: TransactionsServiceOptions;
}

export interface TransactionsServiceOptions {
  readonly providerLayer?: Layer.Layer<GritProvider>;
  readonly transactionInputs?: readonly ApplyTransactionInput[];
}
