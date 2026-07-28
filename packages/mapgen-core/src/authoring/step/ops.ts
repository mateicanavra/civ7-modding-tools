import type { OpContractAny } from "../operation/contract.js";
import type { OperationRun } from "../operation/types.js";

export type { OpContractAny } from "../operation/contract.js";

/** Canonical operation contracts selected by one step under step-local authoring keys. */
export type StepOpsDecl = Readonly<Record<string, OpContractAny>>;

type RuntimeOpFromContract<C extends OpContractAny> = OperationRun<
  C["input"],
  C["output"],
  C["strategies"]
>;

/** Exact executable operation capabilities derived from a step's canonical contracts. */
export type StepRuntimeOps<Decl> = [Decl] extends [StepOpsDecl]
  ? { readonly [K in keyof Decl]: RuntimeOpFromContract<Decl[K]> }
  : Readonly<Record<never, never>>;
