import type { Static, TSchema } from "typebox";
import {
  alignOwnDataRecords,
  captureOwnDataRecord,
  materializeOwnDataRecord,
} from "../own-data-record.js";
import {
  assertCanonicalOpContract,
  type OpContractAny,
  readCanonicalOpStrategies,
} from "./contract.js";
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

type RuntimeStrategiesForContract<C extends OpContractAny> = Readonly<{
  [K in keyof C["strategies"] & string]: OpStrategy<C["strategies"][K]>;
}>;

type StrategySelectionForContract<C extends OpContractAny> = StrategySelection<
  RuntimeStrategiesForContract<C>
>;

type OpImpl<C extends OpContractAny> = Readonly<{
  strategies: StrategyImplMapFor<C>;
}>;

const contractByDomainOp = new WeakMap<object, OpContractAny>();

/** @internal Reports whether a value retains exact `createOp` factory authority. */
export function isCanonicalDomainOp(value: unknown): value is DomainOp<any, any, any> {
  return value !== null && typeof value === "object" && contractByDomainOp.has(value);
}

/** @internal Returns the exact contract that created one canonical executable operation. */
export function readCanonicalDomainOpContract(value: unknown): OpContractAny {
  const contract =
    value !== null && typeof value === "object" ? contractByDomainOp.get(value) : undefined;
  if (!contract) {
    throw new Error("operation implementation must be created by createOp");
  }
  return contract;
}

/**
 * Creates one executable domain operation from its contract and sealed strategy descriptors.
 * Typed-array input admission is compiled here once and always runs before strategy behavior.
 */
export function createOp<const C extends OpContractAny>(
  contract: C,
  impl: OpImpl<C>
): DomainOp<
  C["input"],
  C["output"],
  RuntimeStrategiesForContract<C>,
  C["id"],
  C["defaultStrategy"]
>;

export function createOp(contract: any, impl: any): any {
  assertCanonicalOpContract(contract);
  const definition = captureOwnDataRecord(impl, `createOp(${contract.id}) definition`);
  const strategyMap = definition.find(({ key }) => key === "strategies")?.value;
  if (strategyMap === undefined) {
    throw new Error(`createOp(${contract?.id ?? "unknown"}) requires strategies`);
  }
  const strategySchemas = readCanonicalOpStrategies(contract);
  const strategyDescriptors = captureOwnDataRecord(
    strategyMap,
    `createOp(${contract.id}) strategies`
  );
  const strategies = alignOwnDataRecords(
    strategySchemas,
    strategyDescriptors,
    `createOp(${contract.id}) strategies`
  );

  const runtimeStrategies = materializeOwnDataRecord(
    strategies.map(({ key, authority }) =>
      Object.freeze({ key, value: Object.freeze({ config: authority }) })
    )
  );
  const strategyImpls = new Map<string, StrategyImpl<TSchema, TSchema, unknown>>();
  for (const { key: id, candidate: descriptor } of strategies) {
    const implStrategy = readStrategyImplementation(
      descriptor as StrategyDescriptor<TSchema, TSchema, unknown>,
      contract,
      id
    ) as StrategyImpl<TSchema, TSchema, unknown>;
    strategyImpls.set(id, implStrategy);
  }

  const inputAdmission = compileOperationInputAdmissionPlan(contract.id, contract.input);

  const normalize = (cfg: StrategySelection<typeof runtimeStrategies>) => {
    if (!cfg || typeof cfg.strategy !== "string") {
      throw new Error(`createOp(${contract?.id}) normalize requires a strategy`);
    }
    const selected = strategyImpls.get(cfg.strategy);
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

  const domainOp = Object.freeze({
    kind: contract.kind,
    id: contract.id,
    input: contract.input,
    output: contract.output,
    strategies: runtimeStrategies,
    config: contract.config as unknown as OpConfigSchema<typeof runtimeStrategies>,
    defaultStrategy: contract.defaultStrategy,
    defaultConfig: contract.defaultConfig as StrategySelection<typeof runtimeStrategies>,
    normalize,
    run: (input: any, cfg: any) => {
      if (!cfg || typeof cfg.strategy !== "string") {
        throw new Error(`createOp(${contract?.id}) requires config.strategy`);
      }
      const selected = strategyImpls.get(cfg.strategy);
      if (!selected) {
        throw new Error(`createOp(${contract?.id}) unknown strategy "${cfg.strategy}"`);
      }
      const admittedInput = admitOperationInput(inputAdmission, input);
      return selected.run(admittedInput, cfg.config);
    },
  } as const);

  contractByDomainOp.set(domainOp, contract);
  return domainOp;
}
