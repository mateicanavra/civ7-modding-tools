import { type TSchema, Type } from "typebox";
import { Value } from "typebox/value";
import type { StrategyConfigSchemas } from "./types.js";

export type OpEnvelopeBuildResult = Readonly<{
  schema: TSchema;
  defaultConfig: StrategySelectionDefault;
  strategyIds: readonly string[];
}>;

export type StrategySelectionDefault = Readonly<{
  strategy: string;
  config: Record<string, unknown>;
}>;

function buildEnvelope(
  strategySchemas: StrategyConfigSchemas,
  defaultStrategy: string,
  defaultStrategySchema: TSchema
): OpEnvelopeBuildResult {
  const strategyIds = Object.keys(strategySchemas);
  const cases = strategyIds.map((id) =>
    Type.Object(
      {
        strategy: Type.Literal(id),
        config: strategySchemas[id]!,
      },
      { additionalProperties: false }
    )
  );
  const defaultStrategyConfig = Value.Create(defaultStrategySchema);
  Value.Assert(defaultStrategySchema, defaultStrategyConfig);
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

/** Builds the closed strategy envelope and materializes one explicitly selected default. */
export function buildOpEnvelopeSchema(
  contractId: string,
  strategySchemas: StrategyConfigSchemas,
  defaultStrategy: string
): OpEnvelopeBuildResult {
  if (typeof defaultStrategy !== "string" || defaultStrategy.length === 0) {
    throw new Error(`op(${contractId}) requires an explicit default strategy`);
  }
  const defaultStrategySchema = strategySchemas[defaultStrategy];
  if (
    !Object.prototype.hasOwnProperty.call(strategySchemas, defaultStrategy) ||
    defaultStrategySchema === undefined
  ) {
    throw new Error(
      `op(${contractId}) missing strategy "${defaultStrategy}" (available: ${Object.keys(strategySchemas).join(", ")})`
    );
  }
  return buildEnvelope(strategySchemas, defaultStrategy, defaultStrategySchema);
}
