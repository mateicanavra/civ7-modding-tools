import type { Static, TSchema } from "typebox";
import type { OpContract } from "./contract.js";
import { admitOperationInput, compileOperationInputAdmissionPlan } from "./input-admission.js";
import {
  type OpStrategy,
  readStrategyImplementation,
  type StrategyDescriptor,
  type StrategyImpl,
  type StrategyImplMapFor,
  type StrategySelection,
} from "./strategy.js";
import type { DomainOp, OpConfigSchema } from "./types.js";

type RuntimeStrategiesForContract<C extends OpContract<any, any, any, any, any>> = Readonly<{
  [K in keyof C["strategies"] & string]: OpStrategy<C["strategies"][K]>;
}>;

type StrategySelectionForContract<C extends OpContract<any, any, any, any, any>> =
  StrategySelection<RuntimeStrategiesForContract<C>>;

type OpImpl<C extends OpContract<any, any, any, any, any>> = Readonly<{
  strategies: StrategyImplMapFor<C>;
}>;

/**
 * Creates one executable domain operation from its contract and sealed strategy descriptors.
 * Typed-array input admission is compiled here once and always runs before strategy behavior.
 */
export function createOp<const C extends OpContract<any, any, any, any, any>>(
  contract: C,
  impl: OpImpl<C>
): DomainOp<C["input"], C["output"], RuntimeStrategiesForContract<C>, C["id"]>;

export function createOp(contract: any, impl: any): any {
  const rawStrategySchemas = contract?.strategies as Record<string, TSchema> | undefined;
  const strategyDescriptors = impl?.strategies as Record<string, unknown> | undefined;

  if (!rawStrategySchemas) {
    throw new Error(`createOp(${contract?.id ?? "unknown"}) requires a contract`);
  }

  if (!strategyDescriptors) {
    throw new Error(`createOp(${contract?.id ?? "unknown"}) requires strategies`);
  }

  const strategySchemas = rawStrategySchemas as typeof rawStrategySchemas & { default: TSchema };
  const configSchema = contract.config as TSchema | undefined;
  const defaultConfig = contract.defaultConfig as unknown;
  const strategyIds = Object.keys(strategySchemas);

  if (!configSchema) {
    throw new Error(`createOp(${contract?.id}) requires contract.config`);
  }

  if (!defaultConfig) {
    throw new Error(`createOp(${contract?.id}) requires contract.defaultConfig`);
  }

  const runtimeStrategies: Record<string, OpStrategy<TSchema>> = {};
  const strategyImpls: Record<string, StrategyImpl<TSchema, TSchema, unknown>> = {};
  for (const id of strategyIds) {
    const descriptor = strategyDescriptors[id];
    if (!descriptor) {
      throw new Error(`createOp(${contract?.id}) missing strategy "${id}"`);
    }
    const implStrategy = readStrategyImplementation(
      descriptor as StrategyDescriptor<TSchema, TSchema, unknown>,
      contract,
      id
    ) as StrategyImpl<TSchema, TSchema, unknown>;
    strategyImpls[id] = implStrategy;
    runtimeStrategies[id] = {
      config: strategySchemas[id]!,
    };
  }

  for (const id of Object.keys(strategyDescriptors)) {
    if (!Object.prototype.hasOwnProperty.call(strategySchemas, id)) {
      throw new Error(`createOp(${contract?.id}) has unknown strategy "${id}"`);
    }
  }

  const config = configSchema as unknown as OpConfigSchema<typeof runtimeStrategies>;
  const inputAdmission = compileOperationInputAdmissionPlan(contract.id, contract.input);

  const normalize = (cfg: StrategySelection<typeof runtimeStrategies>) => {
    if (!cfg || typeof cfg.strategy !== "string") {
      throw new Error(`createOp(${contract?.id}) normalize requires a strategy`);
    }
    const selected = strategyImpls[cfg.strategy];
    if (!selected) {
      throw new Error(`createOp(${contract?.id}) unknown strategy "${cfg.strategy}"`);
    }
    if (!selected.normalize) {
      return cfg;
    }
    return {
      strategy: cfg.strategy,
      config: selected.normalize(cfg.config),
    };
  };

  const domainOp = {
    kind: contract.kind,
    id: contract.id,
    input: contract.input,
    output: contract.output,
    strategies: runtimeStrategies,
    config,
    defaultConfig: defaultConfig as StrategySelection<typeof runtimeStrategies>,
    normalize,
    run: (input: any, cfg: any) => {
      if (!cfg || typeof cfg.strategy !== "string") {
        throw new Error(`createOp(${contract?.id}) requires config.strategy`);
      }
      const selected = strategyImpls[cfg.strategy];
      if (!selected) {
        throw new Error(`createOp(${contract?.id}) unknown strategy "${cfg.strategy}"`);
      }
      const admittedInput = admitOperationInput(inputAdmission, input);
      return selected.run(admittedInput, cfg.config);
    },
  } as const;

  return domainOp;
}
