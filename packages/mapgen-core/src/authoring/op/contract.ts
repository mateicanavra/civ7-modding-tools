import type { SingleKeyObject } from "type-fest";
import type { TSchema, TUnsafe } from "typebox";

import { freezeContractGraph, snapshotContractGraph } from "../contract-graph.js";
import {
  captureOwnDataRecord,
  materializeOwnDataRecord,
  type OwnDataRecord,
} from "../own-data-record.js";
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

type OpContractAuthority = Readonly<{ strategies: OwnDataRecord<TSchema> }>;
const opContractAuthority = new WeakMap<object, OpContractAuthority>();
const RESERVED_STRATEGY_IDS = new Set(["__proto__", "constructor", "default", "prototype"]);
const RESERVED_OPERATION_IDS = new Set(["__proto__", "constructor", "prototype"]);

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

/** Type-erased canonical operation contract used only at generic Core boundaries. */
export type OpContractAny = OpContract<any, any, any, any, any>;

/** @internal Reports whether a value retains exact `defineOp` factory authority. */
export function isCanonicalOpContract(value: unknown): value is OpContractAny {
  return value !== null && typeof value === "object" && opContractAuthority.has(value);
}

/** @internal Refuses operation-contract lookalikes at type-erased composition boundaries. */
export function assertCanonicalOpContract(value: unknown): asserts value is OpContractAny {
  if (!isCanonicalOpContract(value)) {
    throw new Error("operation contract must be created by defineOp");
  }
}

/** @internal Returns canonical strategy authority without re-reading the public contract. */
export function readCanonicalOpStrategies(contract: OpContractAny): OwnDataRecord<TSchema> {
  assertCanonicalOpContract(contract);
  return opContractAuthority.get(contract)!.strategies;
}

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
  const definition = captureOwnDataRecord(def, "operation definition");
  const readRequired = (key: "kind" | "id" | "input" | "output" | "strategies"): unknown => {
    const entry = definition.find((candidate) => candidate.key === key);
    if (!entry) throw new TypeError(`operation definition must own ${key}`);
    return entry.value;
  };
  const kind = readRequired("kind") as Kind;
  const id = readRequired("id");
  const authoredInput = readRequired("input") as InputSchema;
  const authoredOutput = readRequired("output") as OutputSchema;
  const strategyInput = readRequired("strategies");
  if (typeof id !== "string" || id.length === 0) {
    throw new TypeError("operation definition id must be a non-empty string");
  }
  if (RESERVED_OPERATION_IDS.has(id)) {
    throw new TypeError(`operation definition id "${id}" is reserved`);
  }
  const authoredStrategies = captureOwnDataRecord<TSchema>(strategyInput, `op(${id}) strategies`);
  const [firstStrategy] = authoredStrategies;
  if (firstStrategy === undefined) {
    throw new Error(`op(${id}) requires at least one semantic strategy`);
  }
  for (const { key } of authoredStrategies) {
    if (RESERVED_STRATEGY_IDS.has(key)) {
      throw new Error(`op(${id}) strategy id "${key}" must be replaced by a semantic identity`);
    }
  }

  const declaredDefault = definition.find(({ key }) => key === "defaultStrategy")?.value;
  let defaultStrategy: string;
  if (authoredStrategies.length === 1) {
    if (declaredDefault !== undefined) {
      throw new Error(
        `op(${id}) infers its sole strategy "${firstStrategy.key}"; remove defaultStrategy`
      );
    }
    defaultStrategy = firstStrategy.key;
  } else {
    if (
      typeof declaredDefault !== "string" ||
      !authoredStrategies.some(({ key }) => key === declaredDefault)
    ) {
      throw new Error(`op(${id}) requires an explicit declared default strategy`);
    }
    defaultStrategy = declaredDefault;
  }

  const input = snapshotContractGraph(authoredInput, `op:${id}.input`) as InputSchema;
  const output = snapshotContractGraph(authoredOutput, `op:${id}.output`) as OutputSchema;
  applySchemaConventions(input, `op:${id}.input`);
  applySchemaConventions(output, `op:${id}.output`);
  const strategyAuthority = Object.freeze(
    authoredStrategies.map(({ key, value }) =>
      Object.freeze({
        key,
        value: applySchemaConventions(
          snapshotContractGraph(value, `op:${id}.strategies.${key}`) as TSchema,
          `op:${id}.strategies.${key}`
        ),
      })
    )
  );
  const strategies = materializeOwnDataRecord(strategyAuthority);

  const { schema: configSchema, defaultConfig } = buildOpEnvelopeSchema(
    id,
    strategies,
    defaultStrategy
  );
  applySchemaConventions(configSchema, `op:${id}.config`);

  const contract = {
    kind,
    id,
    input,
    output,
    strategies,
    defaultStrategy,
    config: configSchema as unknown as TUnsafe<
      OpTypeBag<typeof input, typeof output, EnsureSchemaValues<Strategies>>["envelope"]
    >,
    defaultConfig: defaultConfig as unknown as OpContract<
      Kind,
      Id,
      InputSchema,
      OutputSchema,
      Strategies,
      ResolvedDefaultStrategy<Strategies, DefaultStrategy>
    >["defaultConfig"],
  };
  // TypeBox schemas are composable builder values. Freezing their descriptors makes native
  // utilities such as Type.With fail while cloning the schema, so only the operation authority
  // and its materialized default are immutable; caller schema aliases were already detached above.
  freezeContractGraph(contract.defaultConfig);
  Object.freeze(contract);
  opContractAuthority.set(contract, { strategies: strategyAuthority });
  return contract as unknown as OpContract<
    Kind,
    Id,
    InputSchema,
    OutputSchema,
    Strategies,
    ResolvedDefaultStrategy<Strategies, DefaultStrategy>
  >;
}
