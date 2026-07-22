import type { SingleKeyObject } from "type-fest";
import type { TSchema, TUnsafe } from "typebox";

import { applySchemaConventions } from "../schema.js";
import { buildOpEnvelopeSchema } from "./envelope.js";
import type { DomainOpKind, OpTypeBag } from "./types.js";

export type { StrategyConfigSchemas } from "./types.js";

type EnsureSchemaValues<T> = {
  readonly [K in keyof T]: T[K] extends TSchema ? T[K] : never;
};

type SemanticStrategySchemas<Strategies extends Readonly<object>> = EnsureSchemaValues<Strategies> &
  (keyof Strategies extends never
    ? never
    : keyof Strategies extends string
      ? string extends keyof Strategies
        ? never
        : "default" extends keyof Strategies
          ? never
          : unknown
      : never);

type OpContractDefinitionBase<
  Kind extends DomainOpKind,
  Id extends string,
  InputSchema extends TSchema,
  OutputSchema extends TSchema,
  Strategies extends Readonly<object>,
> = Readonly<{
  kind: Kind;
  id: Id;
  input: InputSchema;
  output: OutputSchema;
  strategies: SemanticStrategySchemas<Strategies>;
}>;

type DefaultStrategyAuthority<
  Strategies extends Readonly<object>,
  DefaultStrategy extends keyof Strategies & string,
> = [SingleKeyObject<Strategies>] extends [never]
  ? Readonly<{ defaultStrategy: DefaultStrategy }>
  : Readonly<{ defaultStrategy?: never }>;

type ResolvedDefaultStrategy<
  Strategies extends Readonly<object>,
  DefaultStrategy extends keyof Strategies & string,
> = [SingleKeyObject<Strategies>] extends [never] ? DefaultStrategy : keyof Strategies & string;

export type OpContractCore<
  Kind extends DomainOpKind,
  Id extends string,
  InputSchema extends TSchema,
  OutputSchema extends TSchema,
  // IMPORTANT: avoid constraining strategies to Record<string, TSchema> here.
  // Doing so tends to widen `keyof strategies` to `string`, which destroys authoring DX.
  Strategies extends Readonly<object>,
  DefaultStrategy extends keyof Strategies & string,
> = Readonly<{
  kind: Kind;
  id: Id;
  input: InputSchema;
  output: OutputSchema;
  /** Strategy selected when authored configuration omits this operation envelope. */
  defaultStrategy: DefaultStrategy;
  strategies: EnsureSchemaValues<Strategies>;
}>;

export type OpContract<
  Kind extends DomainOpKind,
  Id extends string,
  InputSchema extends TSchema,
  OutputSchema extends TSchema,
  Strategies extends Readonly<object>,
  DefaultStrategy extends keyof Strategies & string = keyof Strategies & string,
> = OpContractCore<Kind, Id, InputSchema, OutputSchema, Strategies, DefaultStrategy> &
  Readonly<{
    config: TUnsafe<
      OpTypeBag<InputSchema, OutputSchema, EnsureSchemaValues<Strategies>>["envelope"]
    >;
    defaultConfig: Extract<
      OpTypeBag<InputSchema, OutputSchema, EnsureSchemaValues<Strategies>>["envelope"],
      Readonly<{ strategy: DefaultStrategy }>
    >;
  }>;

/**
 * Defines one immutable operation contract and derives its closed configuration envelope.
 * A sole semantic strategy is necessarily the default; multi-strategy operations name their default
 * explicitly so strategy object order never carries authority.
 */
export function defineOp<
  const Kind extends DomainOpKind,
  const Id extends string,
  const InputSchema extends TSchema,
  const OutputSchema extends TSchema,
  const Strategies extends Readonly<object>,
  const DefaultStrategy extends keyof Strategies & string = keyof Strategies & string,
>(
  def: OpContractDefinitionBase<Kind, Id, InputSchema, OutputSchema, Strategies> &
    DefaultStrategyAuthority<Strategies, DefaultStrategy>
): OpContract<
  Kind,
  Id,
  InputSchema,
  OutputSchema,
  Strategies,
  ResolvedDefaultStrategy<Strategies, DefaultStrategy>
> {
  const strategyIds = Object.keys(def.strategies);
  const [firstStrategyId] = strategyIds;
  if (firstStrategyId === undefined) {
    throw new Error(`op(${def.id}) requires at least one semantic strategy`);
  }
  if (strategyIds.includes("default")) {
    throw new Error(`op(${def.id}) strategy id "default" must be replaced by a semantic identity`);
  }

  const declaredDefault = Object.hasOwn(def, "defaultStrategy")
    ? (def as Readonly<{ defaultStrategy?: unknown }>).defaultStrategy
    : undefined;
  let defaultStrategy: string;
  if (strategyIds.length === 1) {
    if (declaredDefault !== undefined) {
      throw new Error(
        `op(${def.id}) infers its sole strategy "${firstStrategyId}"; remove defaultStrategy`
      );
    }
    defaultStrategy = firstStrategyId;
  } else {
    if (typeof declaredDefault !== "string" || !Object.hasOwn(def.strategies, declaredDefault)) {
      throw new Error(`op(${def.id}) requires an explicit declared default strategy`);
    }
    defaultStrategy = declaredDefault;
  }

  applySchemaConventions(def.input, `op:${def.id}.input`);
  applySchemaConventions(def.output, `op:${def.id}.output`);
  for (const [strategyId, schema] of Object.entries(def.strategies) as [string, TSchema][]) {
    applySchemaConventions(schema, `op:${def.id}.strategies.${strategyId}`);
  }

  const { schema: configSchema, defaultConfig } = buildOpEnvelopeSchema(
    def.id,
    def.strategies,
    defaultStrategy
  );
  applySchemaConventions(configSchema, `op:${def.id}.config`);

  return {
    ...def,
    defaultStrategy,
    config: configSchema as unknown as TUnsafe<
      OpTypeBag<typeof def.input, typeof def.output, typeof def.strategies>["envelope"]
    >,
    defaultConfig: defaultConfig as unknown as OpContract<
      Kind,
      Id,
      InputSchema,
      OutputSchema,
      Strategies,
      ResolvedDefaultStrategy<Strategies, DefaultStrategy>
    >["defaultConfig"],
  } as unknown as OpContract<
    Kind,
    Id,
    InputSchema,
    OutputSchema,
    Strategies,
    ResolvedDefaultStrategy<Strategies, DefaultStrategy>
  >;
}
