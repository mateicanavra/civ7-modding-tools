import type { Static, TSchema, TUnsafe } from "typebox";
import type { ReadonlyData } from "../data/readonly-data.js";
import type { StrategyDefinition } from "./strategy-definition.js";

// Allow ops with specific input/config types to flow through generic registries.
type BivariantCallback<Args extends unknown[], Return> = {
  bivarianceHack(...args: Args): Return;
}["bivarianceHack"];

type StrategyDefinitionsLike = Readonly<Record<string, StrategyDefinition<string, TSchema>>>;
type RuntimeStrategiesLike = Readonly<Record<string, { config: TSchema }>>;

type StrategyConfigSchemaOf<T> = T extends { config: infer C extends TSchema } ? C : never;

/**
 * Canonical zero-copy observation surface for an operation's caller-provided input.
 *
 * Mutable schema-shaped values remain assignable at invocation. The readonly projection guides
 * authors but does not provide runtime isolation against structural widening or explicit casts.
 */
export type OperationInput<InputSchema extends TSchema> = ReadonlyData<Static<InputSchema>>;

export type StrategySelection<Strategies extends RuntimeStrategiesLike> = {
  [K in keyof Strategies & string]: Readonly<{
    strategy: K;
    config: Static<StrategyConfigSchemaOf<Strategies[K]>>;
  }>;
}[keyof Strategies & string];

export type OpContractLike = Readonly<{
  input: TSchema;
  output: TSchema;
  defaultStrategy: string;
  strategies: StrategyDefinitionsLike;
}>;

export type OpStrategyId<TStrategies extends StrategyDefinitionsLike> = keyof TStrategies & string;

export type OpTypeBag<
  InputSchema extends TSchema,
  OutputSchema extends TSchema,
  Strategies extends StrategyDefinitionsLike,
> = Readonly<{
  input: OperationInput<InputSchema>;
  output: Static<OutputSchema>;
  strategyId: OpStrategyId<Strategies>;
  config: Readonly<{
    [K in OpStrategyId<Strategies>]: Static<Strategies[K]["config"]>;
  }>;
  envelope: {
    [K in OpStrategyId<Strategies>]: Readonly<{
      strategy: K;
      config: Static<Strategies[K]["config"]>;
    }>;
  }[OpStrategyId<Strategies>];
}>;

export type OpTypeBagOf<TContract extends OpContractLike> = OpTypeBag<
  TContract["input"],
  TContract["output"],
  TContract["strategies"]
>;

export type OpConfigSchema<Strategies extends RuntimeStrategiesLike> = TUnsafe<
  StrategySelection<Strategies>
>;

/** The configuration case selected by an operation's explicit default authority. */
type DefaultStrategySelection<
  Strategies extends RuntimeStrategiesLike,
  DefaultStrategy extends keyof Strategies & string,
> = Extract<StrategySelection<Strategies>, Readonly<{ strategy: DefaultStrategy }>>;

/**
 * Strict operation kind taxonomy for domain operation modules.
 *
 * Kinds are semantic and should remain trustworthy over time (i.e., avoid using `compute` as a
 * catch-all). Runtime enforcement is not required, but tooling/lint and code review may rely on
 * these meanings for consistency and observability.
 *
 * Boundary intent:
 * - Ops are pure domain contracts: `run(input, config) -> output`.
 * - Op inputs/outputs should be plain values (POJOs + POJO-ish runtime values such as typed arrays),
 *   not runtime/engine “views” (e.g., adapters or callback readbacks).
 * - Pure ops own complete domain transitions and allocate their result products; steps own runtime
 *   binding, adapter reads, engine writes, and artifact publication.
 *
 * Export discipline:
 * - Only export ops that are intended to be step-callable domain contracts.
 * - Internal phases can still be modeled as ops when useful, without being exported from the domain.
 */
export type DomainOpKind = "plan" | "compute" | "score" | "select";

export type DomainOp<
  InputSchema extends TSchema,
  OutputSchema extends TSchema,
  Strategies extends RuntimeStrategiesLike,
  Id extends string = string,
  DefaultStrategy extends keyof Strategies & string = keyof Strategies & string,
  Kind extends DomainOpKind = DomainOpKind,
> = Readonly<{
  kind: Kind;
  id: Id;
  input: InputSchema;
  output: OutputSchema;
  config: OpConfigSchema<Strategies>;
  defaultStrategy: DefaultStrategy;
  defaultConfig: DefaultStrategySelection<Strategies, DefaultStrategy>;
  strategies: Strategies;
  run: BivariantCallback<
    [OperationInput<InputSchema>, StrategySelection<Strategies>],
    Static<OutputSchema>
  >;
  /**
   * Normalizes one selected operation configuration during compilation.
   *
   * Physical map setup is already admitted by the pipeline boundary and is intentionally absent;
   * operation normalization owns only the operation's authored configuration values.
   */
  normalize: BivariantCallback<[StrategySelection<Strategies>], StrategySelection<Strategies>>;
}>;
