import type { Static, TSchema } from "typebox";
import {
  assertCanonicalOpContract,
  type OpContractAny,
  readCanonicalOpStrategyDefinitions,
} from "./contract.js";
import type { AdmittedOperationInput } from "./input-admission.js";
import {
  assertCanonicalStrategyDefinition,
  type StrategyDefinitionAny,
} from "./strategy-definition.js";

type NoInfer<T> = [T][T extends any ? 0 : never];
type StrategyImplementationAuthority = Readonly<{
  contract: OpContractAny;
  definition: StrategyDefinitionAny;
  implementation: StrategyImpl<TSchema, TSchema, unknown>;
}>;
const strategyImplementationAuthority = new WeakMap<object, StrategyImplementationAuthority>();

/** Public authoring surface for one strategy; executable behavior remains private to `createOp`. */
export type OpStrategy<ConfigSchema extends TSchema> = Readonly<{
  config: ConfigSchema;
}>;

/** Implementation admitted into an opaque strategy descriptor for one operation contract. */
export type StrategyImpl<
  ConfigSchema extends TSchema,
  InputSchema extends TSchema,
  Output,
> = Readonly<{
  /** Normalizes only this strategy's authored configuration before execution. */
  normalize?: (config: Static<NoInfer<ConfigSchema>>) => Static<NoInfer<ConfigSchema>>;
  run: (
    input: AdmittedOperationInput<InputSchema>,
    config: Static<NoInfer<ConfigSchema>>
  ) => Output;
}>;

class StrategyDescriptorToken<
  ConfigSchema extends TSchema,
  InputSchema extends TSchema,
  Output,
  ContractId extends string,
  StrategyId extends string,
> {
  readonly #authority:
    | Readonly<{
        config: ConfigSchema;
        input: InputSchema;
        output: Output;
        contractId: ContractId;
        strategyId: StrategyId;
      }>
    | undefined = undefined;

  constructor() {
    void this.#authority;
  }
}

/** Opaque strategy value whose behavior can be unwrapped only by Core's operation factory. */
export type StrategyDescriptor<
  ConfigSchema extends TSchema,
  InputSchema extends TSchema,
  Output,
  ContractId extends string = string,
  StrategyId extends string = string,
> = StrategyDescriptorToken<ConfigSchema, InputSchema, Output, ContractId, StrategyId>;

type StrategyDefinitionFor<C extends OpContractAny> = C["strategies"][keyof C["strategies"] &
  string];

/** Strategy implementation shape inferred from one canonical strategy definition. */
export type StrategyImplForDefinition<
  C extends OpContractAny,
  Definition extends StrategyDefinitionFor<C>,
> = StrategyImpl<Definition["config"], C["input"], Static<C["output"]>>;

/** Strategy implementation shape inferred from one contract strategy id. */
export type StrategyImplFor<
  C extends OpContractAny,
  Id extends keyof C["strategies"] & string,
> = StrategyImplForDefinition<C, C["strategies"][Id]>;

/** Opaque descriptor type for one canonical strategy leaf implementation. */
export type StrategyDescriptorForDefinition<
  C extends OpContractAny,
  Definition extends StrategyDefinitionFor<C>,
> = StrategyDescriptor<
  Definition["config"],
  C["input"],
  Static<C["output"]>,
  C["id"],
  Definition["id"]
>;

/** Opaque descriptor type for one declared strategy implementation. */
export type StrategyDescriptorFor<
  C extends OpContractAny,
  Id extends keyof C["strategies"] & string,
> = StrategyDescriptorForDefinition<C, C["strategies"][Id]>;

/** @deprecated Legacy id-keyed implementation map retained during strategy-leaf migration. */
export type StrategyImplMapFor<C extends OpContractAny> = Readonly<{
  [K in keyof C["strategies"] & string]: StrategyDescriptorFor<C, K>;
}>;

/** Any sealed strategy descriptor belonging to one operation contract. */
export type StrategyDescriptorForOp<C extends OpContractAny> = {
  [K in keyof C["strategies"] & string]: StrategyDescriptorFor<C, K>;
}[keyof C["strategies"] & string];

/** Seals executable behavior against the exact strategy leaf composed into an operation contract. */
export function createStrategy<
  const C extends OpContractAny,
  const Definition extends StrategyDefinitionFor<C>,
>(
  contract: C,
  definition: Definition,
  implementation: StrategyImplForDefinition<C, Definition>
): StrategyDescriptorForDefinition<C, Definition>;

/**
 * @deprecated Temporary identity bridge for implementation leaves that have not yet imported their
 * canonical `defineStrategy` definition directly.
 */
export function createStrategy<
  const C extends OpContractAny,
  const Id extends keyof C["strategies"] & string,
>(contract: C, id: Id, implementation: StrategyImplFor<C, Id>): StrategyDescriptorFor<C, Id>;

export function createStrategy(contract: any, strategyInput: any, implementation: any): any {
  assertCanonicalOpContract(contract);
  const strategyDefinitions = readCanonicalOpStrategyDefinitions(contract);
  const definition =
    typeof strategyInput === "string"
      ? strategyDefinitions.find(({ key }) => key === strategyInput)?.value
      : strategyInput;
  if (!definition) {
    throw new Error(`Operation ${contract.id} has no strategy "${String(strategyInput)}"`);
  }
  assertCanonicalStrategyDefinition(definition);
  if (!strategyDefinitions.some(({ value }) => value === definition)) {
    throw new Error(
      `Strategy definition ${definition.id} is not the exact leaf composed into operation ${contract.id}`
    );
  }
  if (implementation === null || typeof implementation !== "object") {
    throw new TypeError(
      `Strategy ${contract.id}#${definition.id} implementation must be an object`
    );
  }
  const run = readStrategyFunction(implementation, contract.id, definition.id, "run", true)!;
  const normalize = readStrategyFunction(
    implementation,
    contract.id,
    definition.id,
    "normalize",
    false
  );
  const sealedImplementation = Object.freeze({
    run,
    ...(normalize === undefined ? {} : { normalize }),
  }) as StrategyImpl<TSchema, TSchema, unknown>;
  const descriptor = Object.freeze(
    new StrategyDescriptorToken<TSchema, TSchema, unknown, string, string>()
  );
  strategyImplementationAuthority.set(descriptor, {
    contract,
    definition,
    implementation: sealedImplementation,
  });
  return descriptor;
}

/** @internal Returns sealed behavior and semantic identity to Core's operation factory. */
export function readStrategyBinding(
  descriptor: unknown,
  expectedContract: OpContractAny
): Readonly<{
  definition: StrategyDefinitionAny;
  implementation: StrategyImpl<TSchema, TSchema, unknown>;
}> {
  const authority =
    descriptor !== null && typeof descriptor === "object"
      ? strategyImplementationAuthority.get(descriptor)
      : undefined;
  if (!authority) throw new Error("Invalid MapGen strategy descriptor");
  if (authority.contract !== expectedContract) {
    throw new Error(
      `Strategy descriptor ${authority.contract.id}#${authority.definition.id} cannot implement ${expectedContract.id}#${authority.definition.id}`
    );
  }
  return Object.freeze({
    definition: authority.definition,
    implementation: authority.implementation,
  });
}

export type { StrategySelection } from "./types.js";

function readStrategyFunction(
  implementation: object,
  contractId: string,
  strategyId: string,
  key: "run" | "normalize",
  required: boolean
): ((...args: never[]) => unknown) | undefined {
  const descriptor = Object.getOwnPropertyDescriptor(implementation, key);
  if (!descriptor) {
    if (required) throw new TypeError(`Strategy ${contractId}#${strategyId} must own ${key}`);
    return undefined;
  }
  if (!descriptor.enumerable || !("value" in descriptor)) {
    throw new TypeError(
      `Strategy ${contractId}#${strategyId} ${key} must be an own enumerable data property`
    );
  }
  if (descriptor.value === undefined && !required) return undefined;
  if (typeof descriptor.value !== "function") {
    throw new TypeError(`Strategy ${contractId}#${strategyId} ${key} must be a function`);
  }
  return descriptor.value as (...args: never[]) => unknown;
}
