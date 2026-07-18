import type { Static, TSchema } from "typebox";
import type { OpContract } from "./contract.js";

type NoInfer<T> = [T][T extends any ? 0 : never];

export type OpStrategy<ConfigSchema extends TSchema, Input, Output> = Readonly<{
  config: ConfigSchema;
  /** Normalizes only this strategy's authored configuration before execution. */
  normalize?: (config: Static<NoInfer<ConfigSchema>>) => Static<NoInfer<ConfigSchema>>;
  run: (input: Input, config: Static<NoInfer<ConfigSchema>>) => Output;
}>;

export type StrategyImpl<ConfigSchema extends TSchema, Input, Output> = Readonly<{
  /** Normalizes only this strategy's authored configuration before execution. */
  normalize?: (config: Static<NoInfer<ConfigSchema>>) => Static<NoInfer<ConfigSchema>>;
  run: (input: Input, config: Static<NoInfer<ConfigSchema>>) => Output;
}>;

export type StrategyImplFor<
  C extends OpContract<any, any, any, any, any>,
  Id extends keyof C["strategies"] & string,
> = StrategyImpl<C["strategies"][Id], Static<C["input"]>, Static<C["output"]>>;

export type StrategyImplMapFor<C extends OpContract<any, any, any, any, any>> = Readonly<{
  [K in keyof C["strategies"] & string]: StrategyImplFor<C, K>;
}>;

export function createStrategy<
  const C extends OpContract<any, any, any, any, any>,
  const Id extends keyof C["strategies"] & string,
>(contract: C, id: Id, impl: StrategyImplFor<C, Id>): StrategyImplFor<C, Id> {
  void contract;
  void id;
  return impl;
}

export type { StrategySelection } from "./types.js";
