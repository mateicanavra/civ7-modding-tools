import type { Static } from "typebox";

import type { OpContract } from "../op/contract.js";
import type { OpTypeBagOf } from "../op/types.js";

export type OpContractAny = OpContract<any, any, any, any, any>;

export type StepOpUse<
  C extends OpContractAny = OpContractAny,
  DefaultStrategy extends keyof C["strategies"] & string = keyof C["strategies"] & string,
> = Readonly<{
  contract: C;
  /**
   * Per-step default strategy. Wrapping a contract is reserved for an explicit scoped override;
   * steps that inherit the contract default declare the contract directly.
   */
  defaultStrategy: DefaultStrategy;
}>;

export type StepOpsDeclInput = Readonly<Record<string, OpContractAny | StepOpUse<OpContractAny>>>;

/** Correlates every step-local strategy override with the contract declared in that same entry. */
export type ValidatedStepOpsDeclInput<Ops extends StepOpsDeclInput> = Readonly<{
  [K in keyof Ops]: Ops[K] extends OpContractAny
    ? Ops[K]
    : Ops[K] extends StepOpUse<infer C, infer DefaultStrategy>
      ? DefaultStrategy extends keyof C["strategies"] & string
        ? Ops[K]
        : never
      : never;
}>;

export type StepOpsDecl = Readonly<Record<string, OpContractAny>>;

type BivariantFn<Args extends unknown[], R> = {
  bivarianceHack(...args: Args): R;
}["bivarianceHack"];

export type RuntimeOpFromContract<C extends OpContractAny> = BivariantFn<
  [input: Static<C["input"]>, config: OpTypeBagOf<C>["envelope"]],
  Static<C["output"]>
> &
  Readonly<{
    id: C["id"];
    kind: C["kind"];
  }>;

export type StepRuntimeOps<Decl> = [Decl] extends [StepOpsDecl]
  ? { [K in keyof Decl]: RuntimeOpFromContract<Decl[K]> }
  : {};
