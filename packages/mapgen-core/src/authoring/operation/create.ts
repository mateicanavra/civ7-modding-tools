import type { Static, TSchema } from "typebox";
import {
  alignOwnDataRecords,
  captureOwnDataArray,
  captureOwnDataRecord,
  materializeOwnDataRecord,
  type OwnDataRecord,
} from "../snapshot/own-data.js";
import {
  assertCanonicalOpContract,
  type OpContractAny,
  readCanonicalOpInputAdmissionSchema,
  readCanonicalOpStrategyDefinitions,
} from "./contract.js";
import { admitOperationInput, compileOperationInputAdmissionPlan } from "./input-admission.js";
import {
  readStrategyBinding,
  type StrategyDescriptor,
  type StrategyDescriptorForOp,
  type StrategyImpl,
  type StrategySelection,
} from "./strategy.js";
import type { StrategyDefinitionAny } from "./strategy-definition.js";
import type { DomainOp, OpConfigSchema } from "./types.js";

type RuntimeStrategiesForContract<C extends OpContractAny> = Readonly<{
  [K in keyof C["strategies"] & string]: Readonly<{ config: C["strategies"][K]["config"] }>;
}>;

type StrategyDescriptorTupleFor<C extends OpContractAny> = readonly [
  StrategyDescriptorForOp<C>,
  ...StrategyDescriptorForOp<C>[],
];

type StrategyIdOfDescriptor<Descriptor> =
  Descriptor extends StrategyDescriptor<TSchema, TSchema, unknown, string, infer Id> ? Id : never;

type UniqueStrategyDescriptorIds<
  Descriptors extends readonly StrategyDescriptorForOp<any>[],
  Seen extends string = never,
> = Descriptors extends readonly [
  infer Descriptor extends StrategyDescriptorForOp<any>,
  ...infer Rest extends readonly StrategyDescriptorForOp<any>[],
]
  ? Extract<StrategyIdOfDescriptor<Descriptor>, Seen> extends never
    ? UniqueStrategyDescriptorIds<Rest, Seen | StrategyIdOfDescriptor<Descriptor>>
    : false
  : true;

type CompleteStrategyDescriptorSet<
  C extends OpContractAny,
  Descriptors extends readonly StrategyDescriptorForOp<C>[],
> =
  UniqueStrategyDescriptorIds<Descriptors> extends true
    ? [
        Exclude<keyof C["strategies"] & string, StrategyIdOfDescriptor<Descriptors[number]>>,
      ] extends [never]
      ? [
          Exclude<StrategyIdOfDescriptor<Descriptors[number]>, keyof C["strategies"] & string>,
        ] extends [never]
        ? Descriptors
        : never
      : never
    : never;

type TupleOpImpl<
  C extends OpContractAny,
  Descriptors extends StrategyDescriptorTupleFor<C>,
> = Readonly<{
  strategies: Descriptors & CompleteStrategyDescriptorSet<C, Descriptors>;
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
 * Creates one executable operation from a complete tuple of sealed strategy implementations.
 * Descriptor identity supplies strategy ids, so tuple order carries no registration authority.
 */
export function createOp<
  const C extends OpContractAny,
  const Descriptors extends StrategyDescriptorTupleFor<C>,
>(
  contract: C,
  implementation: TupleOpImpl<C, Descriptors>
): DomainOp<
  C["input"],
  C["output"],
  RuntimeStrategiesForContract<C>,
  C["id"],
  C["defaultStrategy"],
  C["kind"]
>;

export function createOp(contract: any, implementationInput: any): any {
  assertCanonicalOpContract(contract);
  const definition = captureOwnDataRecord(
    implementationInput,
    `createOp(${contract.id}) definition`
  );
  const strategyInput = definition.find(({ key }) => key === "strategies")?.value;
  if (strategyInput === undefined) {
    throw new Error(`createOp(${contract.id}) requires strategies`);
  }
  const strategyDefinitions = readCanonicalOpStrategyDefinitions(contract);
  const strategyDescriptors = captureStrategyDescriptors(strategyInput, contract);
  const strategies = alignOwnDataRecords(
    strategyDefinitions,
    strategyDescriptors,
    `createOp(${contract.id}) strategies`
  );

  const runtimeStrategies = materializeOwnDataRecord(
    strategies.map(({ key, authority }) =>
      Object.freeze({ key, value: Object.freeze({ config: authority.config }) })
    )
  );
  const strategyImpls = new Map<string, StrategyImpl<TSchema, TSchema, unknown>>();
  for (const { key: id, authority, candidate } of strategies) {
    if (candidate.definition !== authority) {
      throw new Error(
        `Strategy descriptor ${contract.id}#${candidate.definition.id} does not implement the exact canonical leaf ${contract.id}#${id}`
      );
    }
    strategyImpls.set(id, candidate.implementation);
  }

  const inputAdmission = compileOperationInputAdmissionPlan(
    contract.id,
    readCanonicalOpInputAdmissionSchema(contract)
  );

  const normalize = (cfg: StrategySelection<typeof runtimeStrategies>) => {
    if (!cfg || typeof cfg.strategy !== "string") {
      throw new Error(`createOp(${contract.id}) normalize requires a strategy`);
    }
    const selected = strategyImpls.get(cfg.strategy);
    if (!selected) {
      throw new Error(`createOp(${contract.id}) unknown strategy "${cfg.strategy}"`);
    }
    if (!selected.normalize) return cfg;
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
        throw new Error(`createOp(${contract.id}) requires config.strategy`);
      }
      const selected = strategyImpls.get(cfg.strategy);
      if (!selected) {
        throw new Error(`createOp(${contract.id}) unknown strategy "${cfg.strategy}"`);
      }
      const admittedInput = admitOperationInput(inputAdmission, input);
      return selected.run(admittedInput, cfg.config);
    },
  } as const);

  contractByDomainOp.set(domainOp, contract);
  return domainOp;
}

type StrategyBinding = Readonly<{
  definition: StrategyDefinitionAny;
  implementation: StrategyImpl<TSchema, TSchema, unknown>;
}>;

function captureStrategyDescriptors(
  input: unknown,
  contract: OpContractAny
): OwnDataRecord<StrategyBinding> {
  const descriptorInputs = captureOwnDataArray<unknown>(
    input,
    `createOp(${contract.id}) strategies`
  );
  const entries: Array<Readonly<{ key: string; value: StrategyBinding }>> = [];
  const seen = new Set<string>();
  for (const descriptorInput of descriptorInputs) {
    const binding = readStrategyBinding(descriptorInput, contract);
    if (seen.has(binding.definition.id)) {
      throw new Error(
        `createOp(${contract.id}) has duplicate strategy implementation "${binding.definition.id}"`
      );
    }
    seen.add(binding.definition.id);
    entries.push(Object.freeze({ key: binding.definition.id, value: binding }));
  }
  return Object.freeze(entries);
}
