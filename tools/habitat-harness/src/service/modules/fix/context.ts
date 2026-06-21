import type { GritProvider } from "@internal/habitat-harness/adapters/grit/provider/index";
import type {
  ApplyAdmission,
  ApplyTransactionInput,
} from "@internal/habitat-harness/core/domains/pattern-governance/index";
import type { WorktreeObservation } from "@internal/habitat-harness/core/domains/transformation-transaction/index";
import type { Layer } from "effect";

export interface FixServiceOptions {
  admissions?: readonly ApplyAdmission[];
  transactionInputs?: readonly ApplyTransactionInput[];
  worktree?: WorktreeObservation;
  providerLayer?: Layer.Layer<GritProvider>;
}

export interface FixServiceContext {
  readonly fix?: FixServiceOptions;
}
