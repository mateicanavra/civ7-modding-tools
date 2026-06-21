import type { GritProvider } from "@internal/habitat-harness/adapters/grit/provider/index";
import type { ApplyTransactionInput } from "@internal/habitat-harness/core/domains/pattern-governance/index";
import type { Layer } from "effect";

export interface TransactionsServiceContext {
  readonly transactions?: TransactionsServiceOptions;
}

export interface TransactionsServiceOptions {
  readonly providerLayer?: Layer.Layer<GritProvider>;
  readonly transactionInputs?: readonly ApplyTransactionInput[];
}
