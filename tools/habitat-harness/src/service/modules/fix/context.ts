import type { Layer } from "effect";
import type {
  ApplyAdmission,
  ApplyTransactionInput,
} from "../../../domains/pattern-governance/index.js";
import type { WorktreeObservation } from "../../../domains/transformation-transaction/index.js";
import type { GritProvider } from "../../../providers/grit/index.js";

export interface FixServiceOptions {
  admissions?: readonly ApplyAdmission[];
  transactionInputs?: readonly ApplyTransactionInput[];
  worktree?: WorktreeObservation;
  providerLayer?: Layer.Layer<GritProvider>;
}

export interface FixServiceContext {
  readonly fix?: FixServiceOptions;
}
