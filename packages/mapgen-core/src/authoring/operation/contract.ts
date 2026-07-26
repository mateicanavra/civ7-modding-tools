import type { SingleKeyObject } from "type-fest";
import type { TSchema, TUnsafe } from "typebox";
import { applySchemaConventions } from "../schema/conventions.js";
import { freezeContractGraph, snapshotContractGraph } from "../snapshot/contract-graph.js";
import {
  captureOwnDataArray,
  captureOwnDataRecord,
  materializeOwnDataRecord,
  type OwnDataRecord,
} from "../snapshot/own-data.js";
import { buildOpEnvelopeSchema } from "./envelope.js";
import {
  assertCanonicalStrategyDefinition,
  type StrategyDefinitionAny,
} from "./strategy-definition.js";
import type { DomainOpKind, OpTypeBag } from "./types.js";

type StrategyDefinitionTuple = readonly [StrategyDefinitionAny, ...StrategyDefinitionAny[]];
type StrategyDefinitionsLike = Readonly<Record<string, StrategyDefinitionAny>>;

type StrategyDefinitionMap<Definitions extends readonly StrategyDefinitionAny[]> = Readonly<{
  [Definition in Definitions[number] as Definition["id"]]: Definition;
}>;

type UniqueStrategyDefinitionIds<
  Strategies extends readonly StrategyDefinitionAny[],
  Seen extends string = never,
> = Strategies extends readonly [
  infer Definition extends StrategyDefinitionAny,
  ...infer Rest extends readonly StrategyDefinitionAny[],
]
  ? Extract<Definition["id"], Seen> extends never
    ? UniqueStrategyDefinitionIds<Rest, Seen | Definition["id"]>
    : false
  : true;

type UniqueStrategyDefinitions<Strategies extends StrategyDefinitionTuple> =
  UniqueStrategyDefinitionIds<Strategies> extends true ? Strategies : never;

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
  Strategies extends StrategyDefinitionsLike,
  DefaultStrategy extends keyof Strategies & string,
> = [SingleKeyObject<Strategies>] extends [never]
  ? Readonly<{ defaultStrategy: DefaultStrategy }>
  : Readonly<{ defaultStrategy?: never }>;

type ResolvedDefaultStrategy<
  Strategies extends StrategyDefinitionsLike,
  DefaultStrategy extends keyof Strategies & string,
> = [SingleKeyObject<Strategies>] extends [never] ? DefaultStrategy : keyof Strategies & string;

type OpContractAuthority = Readonly<{
  strategyDefinitions: OwnDataRecord<StrategyDefinitionAny>;
}>;
const opContractAuthority = new WeakMap<object, OpContractAuthority>();
const RESERVED_OPERATION_IDS = new Set(["__proto__", "constructor", "prototype"]);

type OpContractCore<
  Kind extends DomainOpKind,
  Id extends string,
  InputSchema extends TSchema,
  OutputSchema extends TSchema,
  Strategies extends StrategyDefinitionsLike,
  DefaultStrategy extends keyof Strategies & string,
> = Readonly<{
  kind: Kind;
  id: Id;
  input: InputSchema;
  output: OutputSchema;
  /** Strategy selected when authored configuration omits this operation envelope. */
  defaultStrategy: DefaultStrategy;
  /** Semantic strategy definitions indexed by their own immutable identities. */
  strategies: Strategies;
}>;

export type OpContract<
  Kind extends DomainOpKind,
  Id extends string,
  InputSchema extends TSchema,
  OutputSchema extends TSchema,
  Strategies extends StrategyDefinitionsLike,
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

/** @internal Returns canonical strategy definitions without re-reading the public contract. */
export function readCanonicalOpStrategyDefinitions(
  contract: OpContractAny
): OwnDataRecord<StrategyDefinitionAny> {
  assertCanonicalOpContract(contract);
  return opContractAuthority.get(contract)!.strategyDefinitions;
}

/**
 * Defines one immutable operation contract from canonical semantic strategy definitions.
 * A sole strategy is necessarily the default; multi-strategy operations name their default
 * explicitly so tuple order never carries selection authority.
 */
export function defineOp<
  const Kind extends DomainOpKind,
  const Id extends string,
  const InputSchema extends TSchema,
  const OutputSchema extends TSchema,
  const Strategies extends StrategyDefinitionTuple,
  const StrategyMap extends StrategyDefinitionMap<Strategies> = StrategyDefinitionMap<Strategies>,
  const DefaultStrategy extends keyof StrategyMap & string = keyof StrategyMap & string,
>(
  definition: OpContractDefinitionBase<
    Kind,
    Id,
    InputSchema,
    OutputSchema,
    UniqueStrategyDefinitions<Strategies>
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

  const authoredStrategyDefinitions = captureStrategyDefinitions(strategyInput, id);
  const [firstDefinition] = authoredStrategyDefinitions;
  if (firstDefinition === undefined) {
    throw new Error(`op(${id}) requires at least one semantic strategy`);
  }

  const declaredDefault = definition.find(({ key }) => key === "defaultStrategy")?.value;
  let defaultStrategy: string;
  if (authoredStrategyDefinitions.length === 1) {
    if (declaredDefault !== undefined) {
      throw new Error(
        `op(${id}) infers its sole strategy "${firstDefinition.key}"; remove defaultStrategy`
      );
    }
    defaultStrategy = firstDefinition.key;
  } else {
    if (
      typeof declaredDefault !== "string" ||
      !authoredStrategyDefinitions.some(({ key }) => key === declaredDefault)
    ) {
      throw new Error(`op(${id}) requires an explicit declared default strategy`);
    }
    defaultStrategy = declaredDefault;
  }

  const input = snapshotContractGraph(authoredInput, `op:${id}.input`) as TSchema;
  const output = snapshotContractGraph(authoredOutput, `op:${id}.output`) as TSchema;
  applySchemaConventions(input);
  applySchemaConventions(output);
  const strategyDefinitionAuthority = Object.freeze(
    authoredStrategyDefinitions.map(({ key, value }) => Object.freeze({ key, value }))
  );
  const strategies = materializeOwnDataRecord(strategyDefinitionAuthority);

  const { schema: configSchema, defaultConfig } = buildOpEnvelopeSchema(
    id,
    strategies,
    defaultStrategy
  );
  applySchemaConventions(configSchema);

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
  opContractAuthority.set(contract, { strategyDefinitions: strategyDefinitionAuthority });
  return contract;
}

function captureStrategyDefinitions(
  input: unknown,
  operationId: string
): OwnDataRecord<StrategyDefinitionAny> {
  const definitionInputs = captureOwnDataArray<unknown>(input, `op(${operationId}) strategies`);
  const entries: Array<Readonly<{ key: string; value: StrategyDefinitionAny }>> = [];
  const seen = new Set<string>();
  for (const definitionInput of definitionInputs) {
    assertCanonicalStrategyDefinition(definitionInput);
    const definition = definitionInput;
    if (seen.has(definition.id)) {
      throw new Error(`op(${operationId}) has duplicate strategy "${definition.id}"`);
    }
    seen.add(definition.id);
    entries.push(Object.freeze({ key: definition.id, value: definition }));
  }
  return Object.freeze(entries);
}
