import type { Layer } from "effect";
import type { HabitatProcess } from "../../../lib/habitat-process.js";
import type { ApplyTransactionInput } from "../../../rules/patterns/index.js";

export interface TransactionsServiceContext {
  readonly transactions?: TransactionsServiceOptions;
}

export interface TransactionsServiceOptions {
  readonly processLayer?: Layer.Layer<HabitatProcess>;
  readonly transactionInputs?: readonly ApplyTransactionInput[];
}
