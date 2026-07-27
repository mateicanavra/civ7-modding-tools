import {
  captureOwnDataRecord,
  materializeOwnDataRecord,
  type OwnDataRecord,
} from "../snapshot/own-data.js";
import { readStepOpBindingContractInternal } from "../step/ops.js";
import type { OpContractAny } from "./contract.js";
import { readCanonicalDomainOpContract } from "./create.js";
import type { DomainOpKind, OperationRun } from "./types.js";

/** Type-erased operation authority stored by generic composition boundaries. */
export type DomainOpAny = Readonly<{
  kind: DomainOpKind;
  id: string;
  run: unknown;
  normalize: unknown;
}>;

/** @internal Canonical operation registry shared by recipe compilation and execution. */
export type OperationRegistry = Readonly<Record<string, DomainOpAny>>;

type BoundOperationRuns<Decl extends Readonly<Record<string, OpContractAny>>> = {
  readonly [K in keyof Decl]: OperationRun<
    Decl[K]["input"],
    Decl[K]["output"],
    Decl[K]["strategies"]
  >;
};

export type DomainOpsRouter<Op extends DomainOpAny> = Readonly<{
  bind: <Decl extends Readonly<Record<string, OpContractAny & Readonly<{ id: Op["id"] }>>>>(
    contracts: Decl
  ) => BoundOperationRuns<Decl>;
}>;

export type DomainOpsSurface<TOps extends Record<string, DomainOpAny>> = Readonly<
  TOps & DomainOpsRouter<TOps[keyof TOps]>
>;

class DomainOperationRootToken {
  readonly #authority: undefined = undefined;

  constructor() {
    void this.#authority;
  }
}

/** Nominal root accepted by `collectOperations`; child routers and bare surfaces are excluded. */
export type DomainOperationRoot = DomainOperationRootToken;

/** Reports that a declared operation contract has no implementation in the selected registry. */
export class OpBindingError extends Error {
  readonly opKey: string;
  readonly opId: string;

  constructor(opKey: string, opId: string) {
    super(`Missing op implementation for key "${opKey}" (id: "${opId}")`);
    this.name = "OpBindingError";
    this.opKey = opKey;
    this.opId = opId;
  }
}

type BoundOperations<
  Decl extends Readonly<Record<string, OpContractAny>>,
  Registry extends Record<string, unknown>,
> = {
  readonly [K in keyof Decl]: Registry[Decl[K]["id"] & keyof Registry];
};

type OperationIndex = ReadonlyMap<string, DomainOpAny>;
type DomainRootAuthority = Readonly<{
  domainId: string;
  operations: OperationIndex;
}>;
const operationIndexBySurface = new WeakMap<object, OperationIndex>();
const authorityByDomainRoot = new WeakMap<object, DomainRootAuthority>();

function captureCanonicalContracts(input: unknown, label: string): OwnDataRecord<OpContractAny> {
  const contracts = captureOwnDataRecord<OpContractAny>(input, label);
  return Object.freeze(
    contracts.map(({ key, value }) =>
      Object.freeze({
        key,
        value: readStepOpBindingContractInternal(value),
      })
    )
  );
}

function bindRecord<RegistryValue extends DomainOpAny, Selected>(
  contracts: OwnDataRecord<OpContractAny>,
  registry: ReadonlyMap<string, RegistryValue>,
  select: (operation: RegistryValue) => Selected
): Readonly<Record<string, Selected>> {
  return materializeOwnDataRecord(
    contracts.map(({ key, value: contract }) => {
      const implementation = registry.get(contract.id);
      if (!implementation) throw new OpBindingError(key, contract.id);
      if (readCanonicalDomainOpContract(implementation) !== contract) {
        throw new Error(
          `Operation binding "${key}" must implement its exact operation contract "${contract.id}"`
        );
      }
      return Object.freeze({ key, value: select(implementation) });
    })
  );
}

function bindFromIndex<Op extends DomainOpAny>(
  operations: OperationIndex
): DomainOpsRouter<Op>["bind"] {
  return ((contracts) => {
    const captured = captureCanonicalContracts(contracts, "operation contract bindings");
    return bindRecord(captured, operations, (operation) => operation.run);
  }) as DomainOpsRouter<Op>["bind"];
}

/** @internal Builds a child operation surface from already aligned canonical implementations. */
export function createDomainOpsSurfaceFromEntries<const TOps extends Record<string, DomainOpAny>>(
  entries: OwnDataRecord<DomainOpAny>
): DomainOpsSurface<TOps> {
  const registry = new Map<string, DomainOpAny>();
  for (const { value } of entries) {
    const contract = readCanonicalDomainOpContract(value);
    if (value.id !== contract.id)
      throw new Error(`Domain operation implementation id must equal "${contract.id}"`);
    if (registry.has(contract.id)) {
      throw new Error(`Duplicate domain operation id "${contract.id}"`);
    }
    registry.set(contract.id, value);
  }
  const surfaceEntries: OwnDataRecord<unknown> = Object.freeze([
    ...entries,
    Object.freeze({ key: "bind", value: bindFromIndex<TOps[keyof TOps]>(registry) }),
  ]);
  const surface = materializeOwnDataRecord(surfaceEntries) as DomainOpsSurface<TOps>;
  operationIndexBySurface.set(surface, registry);
  return surface;
}

type OperationOfDomainBranch<Branch> =
  Branch extends Readonly<{ ops: DomainOpsRouter<infer Op extends DomainOpAny> }> ? Op : never;

/** @internal Composes child routers and registers the resulting aggregate as a domain root. */
export function composeDomainOpsRouter<
  const Branches extends Readonly<Record<string, Readonly<{ ops: object }>>>,
>(
  domainId: string,
  branches: OwnDataRecord<Readonly<{ ops: object }>>
): Readonly<
  Branches &
    DomainOpsRouter<OperationOfDomainBranch<Branches[keyof Branches]>> &
    DomainOperationRoot
> {
  const registry = new Map<string, DomainOpAny>();
  for (const { value: branch } of branches) {
    const child = operationIndexBySurface.get(branch.ops);
    if (!child) throw new Error("domain router requires a canonical subdomain router");
    for (const [id, operation] of child) {
      if (registry.has(id)) throw new Error(`Duplicate domain operation id "${id}"`);
      registry.set(id, operation);
    }
  }
  const rootEntries: OwnDataRecord<unknown> = Object.freeze([
    ...branches,
    Object.freeze({ key: "bind", value: bindFromIndex(registry) }),
  ]);
  const root = materializeDomainRoot(rootEntries) as unknown as Readonly<
    Branches &
      DomainOpsRouter<OperationOfDomainBranch<Branches[keyof Branches]>> &
      DomainOperationRoot
  >;
  authorityByDomainRoot.set(root, { domainId, operations: registry });
  return root;
}

/** @internal Builds a temporary flat domain module as an operation root. */
export function createFlatDomainRoot<Contract extends object, Ops extends object>(
  domainId: string,
  domainContract: Contract,
  ops: Ops
): Readonly<{ contract: Contract; ops: Ops }> & DomainOperationRoot {
  const registry = operationIndexBySurface.get(ops);
  if (!registry) throw new Error("domain root requires a canonical operation surface");
  const root = materializeDomainRoot([
    Object.freeze({ key: "contract", value: domainContract }),
    Object.freeze({ key: "ops", value: ops }),
  ]) as Readonly<{ contract: Contract; ops: Ops }> & DomainOperationRoot;
  authorityByDomainRoot.set(root, { domainId, operations: registry });
  return root;
}

/**
 * Binds declared operation keys to their exact canonical implementations.
 * Contract identity, registry key, and implementation id must all agree so compilation cannot
 * silently substitute a shape-compatible operation from another authority.
 */
export function bindOperations<
  const Decl extends Readonly<Record<string, OpContractAny>>,
  const Registry extends Readonly<Record<string, DomainOpAny>>,
>(decl: Decl, registryById: Registry): BoundOperations<Decl, Registry> {
  const contracts = captureCanonicalContracts(decl, "operation contract bindings");
  const registry = captureOperationRegistry(registryById);
  return bindRecord(contracts, registry, (operation) => operation) as BoundOperations<
    Decl,
    Registry
  >;
}

/**
 * @internal Binds declared operation keys to the exact `run` functions owned by canonical
 * implementations. The operation registry remains the sole identity authority.
 */
export function bindOperationRuns<
  const Decl extends Readonly<Record<string, OpContractAny>>,
  const Registry extends Readonly<Record<string, DomainOpAny>>,
>(decl: Decl, registryById: Registry): BoundOperationRuns<Decl> {
  const contracts = captureCanonicalContracts(decl, "operation contract bindings");
  const registry = captureOperationRegistry(registryById);
  return bindRecord(contracts, registry, (operation) => operation.run) as BoundOperationRuns<Decl>;
}

function captureOperationRegistry(input: unknown): OperationIndex {
  const registry = new Map<string, DomainOpAny>();
  for (const { key, value } of captureOwnDataRecord<DomainOpAny>(input, "operation registry")) {
    const contract = readCanonicalDomainOpContract(value);
    if (key !== contract.id || value.id !== contract.id) {
      throw new Error(`Operation registry key "${key}" must equal "${contract.id}"`);
    }
    registry.set(key, value);
  }
  return registry;
}

function materializeDomainRoot(entries: OwnDataRecord<unknown>): DomainOperationRoot {
  const root = new DomainOperationRootToken();
  for (const { key, value } of entries) {
    Object.defineProperty(root, key, {
      configurable: false,
      enumerable: true,
      writable: false,
      value,
    });
  }
  Object.freeze(root);
  return root;
}

/** Projects canonical domain roots into the operation registry consumed by recipes. */
export function collectOperations(...domains: readonly DomainOperationRoot[]): OperationRegistry {
  const result = new Map<string, DomainOpAny>();
  const rootByDomainId = new Map<string, object>();
  for (const domain of domains) {
    const authority = authorityByDomainRoot.get(domain);
    if (!authority) throw new Error("collectOperations requires a root domain router");
    const existingRoot = rootByDomainId.get(authority.domainId);
    if (existingRoot === domain) continue;
    if (existingRoot) {
      throw new Error(`duplicate domain id "${authority.domainId}" across domain roots`);
    }
    rootByDomainId.set(authority.domainId, domain);
    for (const [id, operation] of authority.operations) {
      if (result.has(id)) throw new Error(`duplicate operation id "${id}" across domains`);
      result.set(id, operation);
    }
  }
  return materializeOwnDataRecord(
    [...result].map(([key, value]) => Object.freeze({ key, value }))
  ) as OperationRegistry;
}
