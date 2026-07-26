import type { Static, TSchema } from "typebox";
import {
  assertCanonicalOpContract,
  type OpContractAny,
  readCanonicalOpStrategies,
} from "./contract.js";
import type { AdmittedOperationInput } from "./input-admission.js";

type NoInfer<T> = [T][T extends any ? 0 : never];
type StrategyAuthority = Readonly<{
  contract: OpContractAny;
  strategyId: string;
  implementation: StrategyImpl<TSchema, TSchema, unknown>;
}>;
const strategyAuthority = new WeakMap<object, StrategyAuthority>();

/** Public authoring surface for one strategy; executable behavior remains private to `createOp`. */
export type OpStrategy<ConfigSchema extends TSchema> = Readonly<{
  config: ConfigSchema;
}>;

/** Implementation admitted into an opaque strategy descriptor for one operation contract. */
export type StrategyImpl<
  ConfigSchema extends TSchema,
  InputSchema extends TSchema,
  Output,
> = Readonly<{
  /** Normalizes only this strategy's authored configuration before execution. */
  normalize?: (config: Static<NoInfer<ConfigSchema>>) => Static<NoInfer<ConfigSchema>>;
  run: (
    input: AdmittedOperationInput<InputSchema>,
    config: Static<NoInfer<ConfigSchema>>
  ) => Output;
}>;

class StrategyDescriptorToken<
  ConfigSchema extends TSchema,
  InputSchema extends TSchema,
  Output,
  ContractId extends string,
  StrategyId extends string,
> {
  readonly #authority:
    | Readonly<{
        config: ConfigSchema;
        input: InputSchema;
        output: Output;
        contractId: ContractId;
        strategyId: StrategyId;
      }>
    | undefined = undefined;

  constructor() {
    void this.#authority;
  }
}

/** Opaque strategy value whose behavior can be unwrapped only by Core's operation factory. */
export type StrategyDescriptor<
  ConfigSchema extends TSchema,
  InputSchema extends TSchema,
  Output,
  ContractId extends string = string,
  StrategyId extends string = string,
> = StrategyDescriptorToken<ConfigSchema, InputSchema, Output, ContractId, StrategyId>;

/** Strategy implementation shape inferred from one contract strategy id. */
export type StrategyImplFor<
  C extends OpContractAny,
  Id extends keyof C["strategies"] & string,
> = StrategyImpl<C["strategies"][Id], C["input"], Static<C["output"]>>;

/** Opaque descriptor type for one declared strategy implementation. */
export type StrategyDescriptorFor<
  C extends OpContractAny,
  Id extends keyof C["strategies"] & string,
> = StrategyDescriptor<C["strategies"][Id], C["input"], Static<C["output"]>, C["id"], Id>;

/** Complete sealed implementation map required to construct one operation. */
export type StrategyImplMapFor<C extends OpContractAny> = Readonly<{
  [K in keyof C["strategies"] & string]: StrategyDescriptorFor<C, K>;
}>;

/** Seals executable strategy behavior behind an opaque descriptor consumed only by `createOp`. */
export function createStrategy<
  const C extends OpContractAny,
  const Id extends keyof C["strategies"] & string,
>(contract: C, id: Id, impl: StrategyImplFor<C, Id>): StrategyDescriptorFor<C, Id> {
  assertCanonicalOpContract(contract);
  if (!readCanonicalOpStrategies(contract).some((entry) => entry.key === id)) {
    throw new Error(`Operation ${contract.id} has no strategy "${id}"`);
  }
  if (impl === null || typeof impl !== "object") {
    throw new TypeError(`Strategy ${contract.id}#${id} implementation must be an object`);
  }
  const run = readStrategyFunction(impl, contract.id, id, "run", true)!;
  const normalize = readStrategyFunction(impl, contract.id, id, "normalize", false);
  const implementation = Object.freeze({
    run,
    ...(normalize === undefined ? {} : { normalize }),
  }) as StrategyImpl<TSchema, TSchema, unknown>;
  const descriptor = Object.freeze(
    new StrategyDescriptorToken<C["strategies"][Id], C["input"], Static<C["output"]>, C["id"], Id>()
  );
  strategyAuthority.set(descriptor, { contract, strategyId: id, implementation });
  return descriptor as StrategyDescriptorFor<C, Id>;
}

/** @internal Returns the sealed strategy behavior to Core's operation factory. */
export function readStrategyImplementation<
  ConfigSchema extends TSchema,
  InputSchema extends TSchema,
  Output,
  ContractId extends string,
  StrategyId extends string,
>(
  descriptor: StrategyDescriptor<ConfigSchema, InputSchema, Output, ContractId, StrategyId>,
  expectedContract: Readonly<{ id: ContractId }>,
  expectedStrategyId: StrategyId
): StrategyImpl<ConfigSchema, InputSchema, Output> {
  const authority =
    descriptor !== null && typeof descriptor === "object"
      ? strategyAuthority.get(descriptor)
      : undefined;
  if (!authority) throw new Error("Invalid MapGen strategy descriptor");
  if (authority.contract !== expectedContract || authority.strategyId !== expectedStrategyId) {
    throw new Error(
      `Strategy descriptor ${authority.contract.id}#${authority.strategyId} cannot implement ${expectedContract.id}#${expectedStrategyId}`
    );
  }
  return authority.implementation as StrategyImpl<ConfigSchema, InputSchema, Output>;
}

export type { StrategySelection } from "./types.js";

function readStrategyFunction(
  implementation: object,
  contractId: string,
  strategyId: string,
  key: "run" | "normalize",
  required: boolean
): ((...args: never[]) => unknown) | undefined {
  const descriptor = Object.getOwnPropertyDescriptor(implementation, key);
  if (!descriptor) {
    if (required) throw new TypeError(`Strategy ${contractId}#${strategyId} must own ${key}`);
    return undefined;
  }
  if (!descriptor.enumerable || !("value" in descriptor)) {
    throw new TypeError(
      `Strategy ${contractId}#${strategyId} ${key} must be an own enumerable data property`
    );
  }
  if (descriptor.value === undefined && !required) return undefined;
  if (typeof descriptor.value !== "function") {
    throw new TypeError(`Strategy ${contractId}#${strategyId} ${key} must be a function`);
  }
  return descriptor.value as (...args: never[]) => unknown;
}
