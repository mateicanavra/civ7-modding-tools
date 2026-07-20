import type { Static, TSchema, TUnsafe } from "typebox";

import { applySchemaConventions } from "../schema.js";
import { buildOpEnvelopeSchema } from "./envelope.js";
import type { DomainOpKind, OpTypeBag, StrategyConfigSchemas } from "./types.js";

export type { StrategyConfigSchemas } from "./types.js";

type EnsureSchemaValues<T> = {
  readonly [K in keyof T]: T[K] extends TSchema ? T[K] : never;
};

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
 * The explicit default names one declared strategy; strategy object order carries no authority.
 */
export function defineOp<
  const Kind extends DomainOpKind,
  const Id extends string,
  const InputSchema extends TSchema,
  const OutputSchema extends TSchema,
  const Strategies extends Readonly<object>,
  const DefaultStrategy extends keyof Strategies & string,
>(def: OpContractCore<Kind, Id, InputSchema, OutputSchema, Strategies, DefaultStrategy>) {
  applySchemaConventions(def.input, `op:${def.id}.input`);
  applySchemaConventions(def.output, `op:${def.id}.output`);
  for (const [strategyId, schema] of Object.entries(def.strategies) as [string, TSchema][]) {
    applySchemaConventions(schema, `op:${def.id}.strategies.${strategyId}`);
  }

  const { schema: configSchema, defaultConfig } = buildOpEnvelopeSchema(
    def.id,
    def.strategies,
    def.defaultStrategy
  );
  applySchemaConventions(configSchema, `op:${def.id}.config`);

  return {
    ...def,
    config: configSchema as unknown as TUnsafe<
      OpTypeBag<typeof def.input, typeof def.output, typeof def.strategies>["envelope"]
    >,
    defaultConfig: defaultConfig as unknown as OpContract<
      Kind,
      Id,
      InputSchema,
      OutputSchema,
      Strategies,
      DefaultStrategy
    >["defaultConfig"],
  } as const;
}
