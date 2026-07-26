import type { Static } from "typebox";

import { isCanonicalOpContract, type OpContractAny } from "../operation/contract.js";
import type { OpTypeBagOf } from "../operation/types.js";

export type { OpContractAny } from "../operation/contract.js";

const sourceContractByScopedDeclaration = new WeakMap<object, OpContractAny>();

/** @internal Registers one step-scoped default override against its exact operation contract. */
export function registerScopedStepOpDeclarationInternal(
  declaration: object,
  sourceContract: OpContractAny
): void {
  if (!isCanonicalOpContract(sourceContract)) {
    throw new Error("step operation override requires a canonical operation contract");
  }
  sourceContractByScopedDeclaration.set(declaration, sourceContract);
}

/**
 * @internal Resolves a direct or step-scoped declaration to the exact operation contract that
 * executable bindings must implement.
 */
export function readStepOpBindingContractInternal(value: unknown): OpContractAny {
  if (isCanonicalOpContract(value)) return value;
  const source =
    value !== null && typeof value === "object"
      ? sourceContractByScopedDeclaration.get(value)
      : undefined;
  if (!source) {
    throw new Error("operation contract must be created by defineOp or admitted by defineStep");
  }
  return source;
}

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

type RuntimeOpFromContract<C extends OpContractAny> = BivariantFn<
  [input: Static<C["input"]>, config: OpTypeBagOf<C>["envelope"]],
  Static<C["output"]>
> &
  Readonly<{
    id: C["id"];
    kind: C["kind"];
  }>;

export type StepRuntimeOps<Decl> = [Decl] extends [StepOpsDecl]
  ? { readonly [K in keyof Decl]: RuntimeOpFromContract<Decl[K]> }
  : Readonly<Record<never, never>>;
