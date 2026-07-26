import type { IsStringLiteral, IsUnion } from "type-fest";
import type { TSchema } from "typebox";
import { applySchemaConventions } from "../schema/conventions.js";
import { snapshotContractGraph } from "../snapshot/contract-graph.js";
import { captureOwnDataRecord } from "../snapshot/own-data.js";

const strategyDefinitionAuthority = new WeakSet<object>();
const RESERVED_STRATEGY_IDS = new Set(["__proto__", "constructor", "default", "prototype"]);

/** Immutable authored definition for one semantically named operation strategy. */
export type StrategyDefinition<Id extends string, ConfigSchema extends TSchema> = Readonly<{
  id: Id;
  config: ConfigSchema;
}>;

type SemanticStrategyId<Id extends string> =
  IsStringLiteral<Id> extends true ? (IsUnion<Id> extends false ? Id : never) : never;

/** Type-erased canonical strategy definition used only at generic Core boundaries. */
export type StrategyDefinitionAny = StrategyDefinition<string, TSchema>;

/** Reports whether a value retains exact `defineStrategy` factory authority. */
function isCanonicalStrategyDefinition(value: unknown): value is StrategyDefinitionAny {
  return value !== null && typeof value === "object" && strategyDefinitionAuthority.has(value);
}

/** Refuses strategy-definition lookalikes at type-erased composition boundaries. */
export function assertCanonicalStrategyDefinition(
  value: unknown
): asserts value is StrategyDefinitionAny {
  if (!isCanonicalStrategyDefinition(value)) {
    throw new Error("strategy definition must be created by defineStrategy");
  }
}

/** Refuses empty, reserved, or non-string strategy identities. */
function assertSemanticStrategyId(value: unknown, label = "strategy id"): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`${label} must be a non-empty string`);
  }
  if (RESERVED_STRATEGY_IDS.has(value)) {
    throw new TypeError(`${label} "${value}" must be replaced by a semantic identity`);
  }
  return value;
}

/**
 * Defines one semantic strategy definition and snapshots its TypeBox configuration exactly once.
 * Operation contracts compose this value directly, so the strategy leaf remains the sole schema
 * authority while consumers receive a detached, convention-normalized configuration schema.
 */
export function defineStrategy<const Id extends string, const ConfigSchema extends TSchema>(
  definition: Readonly<{ id: SemanticStrategyId<Id>; config: ConfigSchema }>
): StrategyDefinition<Id, ConfigSchema> {
  return defineStrategyDefinition(definition);
}

function defineStrategyDefinition<Id extends string, ConfigSchema extends TSchema>(
  definition: Readonly<{ id: Id; config: ConfigSchema }>
): StrategyDefinition<Id, ConfigSchema> {
  const entries = captureOwnDataRecord(definition, "strategy definition");
  if (entries.length !== 2) {
    throw new TypeError("strategy definition must own only id and config");
  }
  const idEntry = entries.find(({ key }) => key === "id");
  const configEntry = entries.find(({ key }) => key === "config");
  if (!idEntry || !configEntry) {
    throw new TypeError("strategy definition must own id and config");
  }
  const id = assertSemanticStrategyId(idEntry.value) as Id;
  const config = applySchemaConventions(
    snapshotContractGraph(configEntry.value, `strategy:${id}.config`) as ConfigSchema
  ) as ConfigSchema;
  const strategyDefinition = Object.freeze({ id, config });
  strategyDefinitionAuthority.add(strategyDefinition);
  return strategyDefinition;
}
