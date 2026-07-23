import type { SingleKeyObject } from "type-fest";
import type { TSchema, TUnsafe } from "typebox";

import { freezeContractGraph, snapshotContractGraph } from "../contract-graph.js";
import { captureOwnDataArray } from "../own-data-array.js";
import {
  captureOwnDataRecord,
  materializeOwnDataRecord,
  type OwnDataRecord,
} from "../own-data-record.js";
import { applySchemaConventions } from "../schema.js";
import { buildOpEnvelopeSchema } from "./envelope.js";
import {
  assertCanonicalStrategyContract,
  defineLegacyStrategy,
  type StrategyContract,
  type StrategyContractAny,
} from "./strategy-contract.js";
import type { DomainOpKind, OpTypeBag } from "./types.js";

export type { StrategyConfigSchemas } from "./types.js";

type StrategyContractTuple = readonly [StrategyContractAny, ...StrategyContractAny[]];
type StrategyContractsLike = Readonly<Record<string, StrategyContractAny>>;

type StrategyContractMap<Strategies extends readonly StrategyContractAny[]> = Readonly<{
  [Strategy in Strategies[number] as Strategy["id"]]: Strategy;
}>;

type UniqueStrategyContractIds<
  Strategies extends readonly StrategyContractAny[],
  Seen extends string = never,
> = Strategies extends readonly [
  infer Strategy extends StrategyContractAny,
  ...infer Rest extends readonly StrategyContractAny[],
]
  ? Extract<Strategy["id"], Seen> extends never
    ? UniqueStrategyContractIds<Rest, Seen | Strategy["id"]>
    : false
  : true;

type UniqueStrategyContracts<Strategies extends StrategyContractTuple> =
  UniqueStrategyContractIds<Strategies> extends true ? Strategies : never;

type EnsureSchemaValues<T> = {
  readonly [K in keyof T]: T[K] extends TSchema ? T[K] : never;
};

type SemanticLegacyStrategySchemas<Strategies extends Readonly<object>> =
  EnsureSchemaValues<Strategies> &
    (keyof Strategies extends never
      ? never
      : keyof Strategies extends string
        ? string extends keyof Strategies
          ? never
          : "default" extends keyof Strategies
            ? never
            : unknown
        : never);

type LegacyStrategyContractMap<Strategies extends Readonly<object>> = Readonly<{
  [K in keyof Strategies & string]: StrategyContract<
    K,
    Strategies[K] extends TSchema ? Strategies[K] : never
  >;
}>;

type OpContractDefinitionBase<
  Kind extends DomainOpKind,
  Id extends string,
  InputSchema extends TSchema,
  OutputSchema extends TSchema,
  Strategies,
> = Readonly<{
  kind: Kind;
  id: Id;
  input: InputSchema;
  output: OutputSchema;
  strategies: Strategies;
}>;

type DefaultStrategyAuthority<
  Strategies extends StrategyContractsLike,
  DefaultStrategy extends keyof Strategies & string,
> = [SingleKeyObject<Strategies>] extends [never]
  ? Readonly<{ defaultStrategy: DefaultStrategy }>
  : Readonly<{ defaultStrategy?: never }>;

type ResolvedDefaultStrategy<
  Strategies extends StrategyContractsLike,
  DefaultStrategy extends keyof Strategies & string,
> = [SingleKeyObject<Strategies>] extends [never] ? DefaultStrategy : keyof Strategies & string;

type OpContractAuthority = Readonly<{ strategies: OwnDataRecord<StrategyContractAny> }>;
const opContractAuthority = new WeakMap<object, OpContractAuthority>();
const RESERVED_OPERATION_IDS = new Set(["__proto__", "constructor", "prototype"]);

export type OpContractCore<
  Kind extends DomainOpKind,
  Id extends string,
  InputSchema extends TSchema,
  OutputSchema extends TSchema,
  Strategies extends StrategyContractsLike,
  DefaultStrategy extends keyof Strategies & string,
> = Readonly<{
  kind: Kind;
  id: Id;
  input: InputSchema;
  output: OutputSchema;
  /** Strategy selected when authored configuration omits this operation envelope. */
  defaultStrategy: DefaultStrategy;
  /** Semantic strategy contracts indexed by their own immutable identities. */
  strategies: Strategies;
}>;

export type OpContract<
  Kind extends DomainOpKind,
  Id extends string,
  InputSchema extends TSchema,
  OutputSchema extends TSchema,
  Strategies extends StrategyContractsLike,
  DefaultStrategy extends keyof Strategies & string = keyof Strategies & string,
> = OpContractCore<Kind, Id, InputSchema, OutputSchema, Strategies, DefaultStrategy> &
  Readonly<{
    config: TUnsafe<OpTypeBag<InputSchema, OutputSchema, Strategies>["envelope"]>;
    defaultConfig: Extract<
      OpTypeBag<InputSchema, OutputSchema, Strategies>["envelope"],
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
export function readCanonicalOpStrategies(
  contract: OpContractAny
): OwnDataRecord<StrategyContractAny> {
  assertCanonicalOpContract(contract);
  return opContractAuthority.get(contract)!.strategies;
}

/**
 * Defines one immutable operation contract from canonical semantic strategy contracts.
 * A sole strategy is necessarily the default; multi-strategy operations name their default
 * explicitly so tuple order never carries selection authority.
 */
export function defineOp<
  const Kind extends DomainOpKind,
  const Id extends string,
  const InputSchema extends TSchema,
  const OutputSchema extends TSchema,
  const Strategies extends StrategyContractTuple,
  const StrategyMap extends StrategyContractMap<Strategies> = StrategyContractMap<Strategies>,
  const DefaultStrategy extends keyof StrategyMap & string = keyof StrategyMap & string,
>(
  definition: OpContractDefinitionBase<
    Kind,
    Id,
    InputSchema,
    OutputSchema,
    UniqueStrategyContracts<Strategies>
  > &
    DefaultStrategyAuthority<StrategyMap, DefaultStrategy>
): OpContract<
  Kind,
  Id,
  InputSchema,
  OutputSchema,
  StrategyMap,
  ResolvedDefaultStrategy<StrategyMap, DefaultStrategy>
>;

/**
 * @deprecated Temporary schema-map bridge for operation consumers that have not yet moved each
 * strategy config into its canonical `defineStrategy` leaf contract.
 */
export function defineOp<
  const Kind extends DomainOpKind,
  const Id extends string,
  const InputSchema extends TSchema,
  const OutputSchema extends TSchema,
  const Strategies extends Readonly<object>,
  const StrategyMap extends
    LegacyStrategyContractMap<Strategies> = LegacyStrategyContractMap<Strategies>,
  const DefaultStrategy extends keyof StrategyMap & string = keyof StrategyMap & string,
>(
  definition: OpContractDefinitionBase<
    Kind,
    Id,
    InputSchema,
    OutputSchema,
    SemanticLegacyStrategySchemas<Strategies>
  > &
    DefaultStrategyAuthority<StrategyMap, DefaultStrategy>
): OpContract<
  Kind,
  Id,
  InputSchema,
  OutputSchema,
  StrategyMap,
  ResolvedDefaultStrategy<StrategyMap, DefaultStrategy>
>;

export function defineOp(definitionInput: any): any {
  const definition = captureOwnDataRecord(definitionInput, "operation definition");
  const readRequired = (key: "kind" | "id" | "input" | "output" | "strategies"): unknown => {
    const entry = definition.find((candidate) => candidate.key === key);
    if (!entry) throw new TypeError(`operation definition must own ${key}`);
    return entry.value;
  };
  const kind = readRequired("kind") as DomainOpKind;
  const id = readRequired("id");
  const authoredInput = readRequired("input") as TSchema;
  const authoredOutput = readRequired("output") as TSchema;
  const strategyInput = readRequired("strategies");
  if (typeof id !== "string" || id.length === 0) {
    throw new TypeError("operation definition id must be a non-empty string");
  }
  if (RESERVED_OPERATION_IDS.has(id)) {
    throw new TypeError(`operation definition id "${id}" is reserved`);
  }

  const authoredStrategies = captureStrategyContracts(strategyInput, id);
  const [firstStrategy] = authoredStrategies;
  if (firstStrategy === undefined) {
    throw new Error(`op(${id}) requires at least one semantic strategy`);
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

  const input = snapshotContractGraph(authoredInput, `op:${id}.input`) as TSchema;
  const output = snapshotContractGraph(authoredOutput, `op:${id}.output`) as TSchema;
  applySchemaConventions(input, `op:${id}.input`);
  applySchemaConventions(output, `op:${id}.output`);
  const strategyAuthority = Object.freeze(
    authoredStrategies.map(({ key, value }) => Object.freeze({ key, value }))
  );
  const strategies = materializeOwnDataRecord(strategyAuthority);
  const strategyConfigs = materializeOwnDataRecord(
    strategyAuthority.map(({ key, value }) => Object.freeze({ key, value: value.config }))
  );

  const { schema: configSchema, defaultConfig } = buildOpEnvelopeSchema(
    id,
    strategyConfigs,
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
    config: configSchema,
    defaultConfig,
  };
  // TypeBox schemas remain composable builder values. Only the operation authority and its
  // materialized default are immutable; factory-owned schema snapshots are already detached.
  freezeContractGraph(contract.defaultConfig);
  Object.freeze(contract);
  opContractAuthority.set(contract, { strategies: strategyAuthority });
  return contract;
}

function captureStrategyContracts(
  input: unknown,
  operationId: string
): OwnDataRecord<StrategyContractAny> {
  if (Array.isArray(input)) {
    const strategyInputs = captureOwnDataArray<unknown>(input, `op(${operationId}) strategies`);
    const entries: Array<Readonly<{ key: string; value: StrategyContractAny }>> = [];
    const seen = new Set<string>();
    for (const strategyInput of strategyInputs) {
      assertCanonicalStrategyContract(strategyInput);
      const strategy = strategyInput;
      if (seen.has(strategy.id)) {
        throw new Error(`op(${operationId}) has duplicate strategy "${strategy.id}"`);
      }
      seen.add(strategy.id);
      entries.push(Object.freeze({ key: strategy.id, value: strategy }));
    }
    return Object.freeze(entries);
  }

  const legacySchemas = captureOwnDataRecord<TSchema>(input, `op(${operationId}) strategies`);
  return Object.freeze(
    legacySchemas.map(({ key, value }) =>
      Object.freeze({ key, value: defineLegacyStrategy(key, value) })
    )
  );
}
