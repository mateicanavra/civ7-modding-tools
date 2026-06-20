import type { Layer } from "effect";
import type { HabitatProcess } from "../../../lib/habitat-process.js";
import type { WorktreeObservation } from "../../../lib/pattern-apply/index.js";
import type { ApplyAdmission, ApplyTransactionInput } from "../../../rules/patterns/index.js";

export interface FixServiceOptions {
  admissions?: readonly ApplyAdmission[];
  transactionInputs?: readonly ApplyTransactionInput[];
  worktree?: WorktreeObservation;
  processLayer?: Layer.Layer<HabitatProcess>;
}

export interface FixServiceContext {
  readonly fix?: FixServiceOptions;
}
