import type { IsStringLiteral, IsUnion } from "type-fest";
import type { TSchema } from "typebox";

import { snapshotContractGraph } from "../contract-graph.js";
import { captureOwnDataRecord } from "../own-data-record.js";
import { applySchemaConventions } from "../schema.js";

const strategyContractAuthority = new WeakSet<object>();
const RESERVED_STRATEGY_IDS = new Set(["__proto__", "constructor", "default", "prototype"]);

/** Immutable authored contract for one semantically named operation strategy. */
export type StrategyContract<Id extends string, ConfigSchema extends TSchema> = Readonly<{
  id: Id;
  config: ConfigSchema;
}>;

type SemanticStrategyId<Id extends string> =
  IsStringLiteral<Id> extends true ? (IsUnion<Id> extends false ? Id : never) : never;

/** Type-erased canonical strategy contract used only at generic Core boundaries. */
export type StrategyContractAny = StrategyContract<string, TSchema>;

/** Reports whether a value retains exact `defineStrategy` factory authority. */
export function isCanonicalStrategyContract(value: unknown): value is StrategyContractAny {
  return value !== null && typeof value === "object" && strategyContractAuthority.has(value);
}

/** Refuses strategy-contract lookalikes at type-erased composition boundaries. */
export function assertCanonicalStrategyContract(
  value: unknown
): asserts value is StrategyContractAny {
  if (!isCanonicalStrategyContract(value)) {
    throw new Error("strategy contract must be created by defineStrategy");
  }
}

/** Refuses empty, reserved, or non-string strategy identities. */
export function assertSemanticStrategyId(value: unknown, label = "strategy id"): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`${label} must be a non-empty string`);
  }
  if (RESERVED_STRATEGY_IDS.has(value)) {
    throw new TypeError(`${label} "${value}" must be replaced by a semantic identity`);
  }
  return value;
}

/**
 * Defines one semantic strategy contract and snapshots its TypeBox configuration exactly once.
 * Operation contracts compose this value directly, so the strategy leaf remains the sole schema
 * authority while consumers receive a detached, convention-normalized configuration schema.
 */
export function defineStrategy<const Id extends string, const ConfigSchema extends TSchema>(
  definition: Readonly<{ id: SemanticStrategyId<Id>; config: ConfigSchema }>
): StrategyContract<Id, ConfigSchema> {
  return defineStrategyContract(definition);
}

function defineStrategyContract<Id extends string, ConfigSchema extends TSchema>(
  definition: Readonly<{ id: Id; config: ConfigSchema }>
): StrategyContract<Id, ConfigSchema> {
  const entries = captureOwnDataRecord(definition, "strategy contract definition");
  if (entries.length !== 2) {
    throw new TypeError("strategy contract definition must own only id and config");
  }
  const idEntry = entries.find(({ key }) => key === "id");
  const configEntry = entries.find(({ key }) => key === "config");
  if (!idEntry || !configEntry) {
    throw new TypeError("strategy contract definition must own id and config");
  }
  const id = assertSemanticStrategyId(idEntry.value) as Id;
  const config = applySchemaConventions(
    snapshotContractGraph(configEntry.value, `strategy:${id}.config`) as ConfigSchema,
    `strategy:${id}.config`
  ) as ConfigSchema;
  const contract = Object.freeze({ id, config });
  strategyContractAuthority.add(contract);
  return contract;
}

/** @internal Admits a legacy id-keyed schema entry through the canonical strategy factory. */
export function defineLegacyStrategy(
  id: string,
  config: TSchema
): StrategyContract<string, TSchema> {
  return defineStrategyContract({ id, config });
}
