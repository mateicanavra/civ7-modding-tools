import type { Static, TSchema } from "typebox";
import type { OpContract } from "./contract.js";
import type { AdmittedOperationInput } from "./input-admission.js";

type NoInfer<T> = [T][T extends any ? 0 : never];
const strategyImplementation = Symbol("mapgen.strategy-implementation");
const strategyIdentity = Symbol("mapgen.strategy-identity");

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

declare const strategyDescriptorType: unique symbol;

/** Opaque strategy value whose behavior can be unwrapped only by Core's operation factory. */
export type StrategyDescriptor<
  ConfigSchema extends TSchema,
  InputSchema extends TSchema,
  Output,
  ContractId extends string = string,
  StrategyId extends string = string,
> = Readonly<{
  [strategyDescriptorType]: Readonly<{
    contractId: ContractId;
    strategyId: StrategyId;
    implementation: StrategyImpl<ConfigSchema, InputSchema, Output>;
  }>;
}>;

/** Strategy implementation shape inferred from one contract strategy id. */
export type StrategyImplFor<
  C extends OpContract<any, any, any, any, any>,
  Id extends keyof C["strategies"] & string,
> = StrategyImpl<C["strategies"][Id], C["input"], Static<C["output"]>>;

/** Opaque descriptor type for one declared strategy implementation. */
export type StrategyDescriptorFor<
  C extends OpContract<any, any, any, any, any>,
  Id extends keyof C["strategies"] & string,
> = StrategyDescriptor<C["strategies"][Id], C["input"], Static<C["output"]>, C["id"], Id>;

/** Complete sealed implementation map required to construct one operation. */
export type StrategyImplMapFor<C extends OpContract<any, any, any, any, any>> = Readonly<{
  [K in keyof C["strategies"] & string]: StrategyDescriptorFor<C, K>;
}>;

/** Seals executable strategy behavior behind an opaque descriptor consumed only by `createOp`. */
export function createStrategy<
  const C extends OpContract<any, any, any, any, any>,
  const Id extends keyof C["strategies"] & string,
>(contract: C, id: Id, impl: StrategyImplFor<C, Id>): StrategyDescriptorFor<C, Id> {
  return Object.freeze({
    [strategyImplementation]: Object.freeze(impl),
    [strategyIdentity]: Object.freeze({ contract, strategyId: id }),
  }) as unknown as StrategyDescriptorFor<C, Id>;
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
  const internal = descriptor as unknown as Readonly<{
    [strategyImplementation]?: StrategyImpl<ConfigSchema, InputSchema, Output>;
    [strategyIdentity]?: Readonly<{
      contract: Readonly<{ id: string }>;
      strategyId: string;
    }>;
  }>;
  const implementation = internal[strategyImplementation];
  const identity = internal[strategyIdentity];
  if (!implementation || !identity) throw new Error("Invalid MapGen strategy descriptor");
  if (identity.contract !== expectedContract || identity.strategyId !== expectedStrategyId) {
    throw new Error(
      `Strategy descriptor ${identity.contract.id}#${identity.strategyId} cannot implement ${expectedContract.id}#${expectedStrategyId}`
    );
  }
  return implementation;
}

export type { StrategySelection } from "./types.js";
