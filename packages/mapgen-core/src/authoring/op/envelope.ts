import { type TSchema, Type } from "typebox";
import { Value } from "typebox/value";
import { captureOwnDataRecord } from "../own-data-record.js";
import {
  assertCanonicalStrategyDefinition,
  type StrategyDefinitionAny,
} from "./strategy-definition.js";

type StrategyDefinitionMap = Readonly<Record<string, StrategyDefinitionAny>>;

export type OpEnvelopeBuildResult = Readonly<{
  schema: TSchema;
  defaultConfig: StrategySelectionDefault;
  strategyIds: readonly string[];
}>;

export type StrategySelectionDefault = Readonly<{
  strategy: string;
  config: Record<string, unknown>;
}>;

/** Builds one closed operation envelope from its canonical strategy-definition authority. */
export function buildOpEnvelopeSchema(
  contractId: string,
  strategySource: StrategyDefinitionMap,
  defaultStrategy: string
): OpEnvelopeBuildResult {
  if (typeof defaultStrategy !== "string" || defaultStrategy.length === 0) {
    throw new Error(`op(${contractId}) requires an explicit default strategy`);
  }

  const definitions = captureOwnDataRecord<StrategyDefinitionAny>(
    strategySource,
    `op(${contractId}) strategies`
  );
  for (const { key, value } of definitions) {
    assertCanonicalStrategyDefinition(value);
    if (key !== value.id) {
      throw new Error(
        `op(${contractId}) strategy key "${key}" must match canonical identity "${value.id}"`
      );
    }
  }

  const strategyIds = definitions.map(({ key }) => key);
  const defaultDefinition = definitions.find(({ key }) => key === defaultStrategy)?.value;
  if (!defaultDefinition) {
    throw new Error(
      `op(${contractId}) missing strategy "${defaultStrategy}" (available: ${strategyIds.join(", ")})`
    );
  }

  const cases = definitions.map(({ key, value }) =>
    Type.Object(
      {
        strategy: Type.Literal(key),
        config: value.config,
      },
      { additionalProperties: false }
    )
  );
  const defaultStrategyConfig = Value.Create(defaultDefinition.config);
  Value.Assert(defaultDefinition.config, defaultStrategyConfig);
  const defaultConfig: StrategySelectionDefault = {
    strategy: defaultStrategy,
    config: defaultStrategyConfig as Record<string, unknown>,
  };

  return {
    schema: Type.Union(cases, { default: defaultConfig }),
    defaultConfig,
    strategyIds,
  };
}
