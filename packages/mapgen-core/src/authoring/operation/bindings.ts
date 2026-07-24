import type { TSchema } from "typebox";
import {
  captureOwnDataRecord,
  materializeOwnDataRecord,
  type OwnDataRecord,
} from "../own-data-record.js";
import { readStepOpBindingContractInternal } from "../step/ops.js";
import type { OpContractAny } from "./contract.js";
import { readCanonicalDomainOpContract } from "./create.js";
import type { DomainOp } from "./types.js";

export type OpId = string;
export type OpsById<Op extends { id: OpId }> = Readonly<{
  [K in Op["id"]]: Extract<Op, { id: K }>;
}>;

export type DomainOpCompileAny = DomainOp<
  TSchema,
  TSchema,
  Record<string, { config: TSchema }>,
  string
>;

/** @internal Flat compile-operation registry shared by recipe authorship and compilation. */
export type CompileOpsById = OpsById<DomainOpCompileAny>;

type BivariantFn<Args extends unknown[], R> = {
  bivarianceHack(...args: Args): R;
}["bivarianceHack"];

export type DomainOpRuntime<Op extends DomainOpCompileAny> = Op extends DomainOpCompileAny
  ? BivariantFn<
      [input: Parameters<Op["run"]>[0], config: Parameters<Op["run"]>[1]],
      ReturnType<Op["run"]>
    > &
      Readonly<{ id: Op["id"]; kind: Op["kind"] }>
  : never;

export type DomainOpRuntimeAny = DomainOpRuntime<DomainOpCompileAny>;

export type DomainOpsRouter<Op extends DomainOpCompileAny> = Readonly<{
  bind: <Decl extends Readonly<Record<string, OpContractAny>>>(
    contracts: Decl
  ) => Readonly<{
    compile: BoundOps<Decl, OpsById<Op>>;
    runtime: BoundOps<Decl, OpsById<DomainOpRuntime<Op>>>;
  }>;
}>;

export type DomainOpsSurface<TOps extends Record<string, DomainOpCompileAny>> = Readonly<
  TOps & DomainOpsRouter<TOps[keyof TOps]>
>;

class DomainCompileRootToken<Op extends DomainOpCompileAny> {
  readonly #authority: Op | undefined = undefined;

  constructor() {
    void this.#authority;
  }
}

/** Nominal root accepted by `collectCompileOps`; child routers and bare surfaces are excluded. */
export type DomainCompileRoot<Op extends DomainOpCompileAny = DomainOpCompileAny> =
  DomainCompileRootToken<Op>;

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

type BoundOps<
  Decl extends Readonly<Record<string, OpContractAny>>,
  Registry extends Record<string, unknown>,
> = {
  readonly [K in keyof Decl]: Registry[Decl[K]["id"] & keyof Registry];
};

type CompileRegistry = ReadonlyMap<string, DomainOpCompileAny>;
type CompileRootAuthority = Readonly<{
  domainId: string;
  domainContract: object;
  registry: CompileRegistry;
}>;
const registryByOpsSurface = new WeakMap<object, CompileRegistry>();
const authorityByCompileRoot = new WeakMap<object, CompileRootAuthority>();
const runtimeByCompileOp = new WeakMap<object, DomainOpRuntimeAny>();
const contractByRuntimeOp = new WeakMap<object, OpContractAny>();

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

function bindRecord<RegistryValue extends object>(
  contracts: OwnDataRecord<OpContractAny>,
  registry: ReadonlyMap<string, RegistryValue>,
  readContract: (operation: RegistryValue) => OpContractAny
): Readonly<Record<string, unknown>> {
  return materializeOwnDataRecord(
    contracts.map(({ key, value: contract }) => {
      const implementation = registry.get(contract.id);
      if (!implementation) throw new OpBindingError(key, contract.id);
      if (readContract(implementation) !== contract) {
        throw new Error(
          `Operation binding "${key}" must implement its exact operation contract "${contract.id}"`
        );
      }
      return Object.freeze({ key, value: implementation });
    })
  );
}

function bindFromRegistry<Op extends DomainOpCompileAny>(
  registry: CompileRegistry
): DomainOpsRouter<Op>["bind"] {
  const runtimeRegistry = new Map(
    [...registry].map(([id, operation]) => [id, runtimeOp(operation)])
  );
  return ((contracts) => {
    const captured = captureCanonicalContracts(contracts, "operation contract bindings");
    return Object.freeze({
      compile: bindRecord(captured, registry, readCanonicalDomainOpContract),
      runtime: bindRecord(captured, runtimeRegistry, readRuntimeOpContract),
    });
  }) as DomainOpsRouter<Op>["bind"];
}

/** @internal Builds a child operation surface from already aligned canonical implementations. */
export function createDomainOpsSurfaceFromEntries<
  const TOps extends Record<string, DomainOpCompileAny>,
>(entries: OwnDataRecord<DomainOpCompileAny>): DomainOpsSurface<TOps> {
  const registry = new Map<string, DomainOpCompileAny>();
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
    Object.freeze({ key: "bind", value: bindFromRegistry<TOps[keyof TOps]>(registry) }),
  ]);
  const surface = materializeOwnDataRecord(surfaceEntries) as DomainOpsSurface<TOps>;
  registryByOpsSurface.set(surface, registry);
  return surface;
}

/** @internal Composes child routers and registers the resulting aggregate as a compile root. */
export function composeDomainOpsRouter<
  const Branches extends Readonly<Record<string, Readonly<{ ops: object }>>>,
>(
  domainId: string,
  domainContract: object,
  branches: OwnDataRecord<Readonly<{ ops: object }>>
): Readonly<Branches & DomainOpsRouter<DomainOpCompileAny> & DomainCompileRoot> {
  const registry = new Map<string, DomainOpCompileAny>();
  for (const { value: branch } of branches) {
    const child = registryByOpsSurface.get(branch.ops);
    if (!child) throw new Error("domain router requires a canonical subdomain router");
    for (const [id, operation] of child) {
      if (registry.has(id)) throw new Error(`Duplicate domain operation id "${id}"`);
      registry.set(id, operation);
    }
  }
  const rootEntries: OwnDataRecord<unknown> = Object.freeze([
    ...branches,
    Object.freeze({ key: "bind", value: bindFromRegistry(registry) }),
  ]);
  const root = materializeCompileRoot(rootEntries) as unknown as Readonly<
    Branches & DomainOpsRouter<DomainOpCompileAny> & DomainCompileRoot
  >;
  authorityByCompileRoot.set(root, { domainId, domainContract, registry });
  return root;
}

/** @internal Builds a temporary flat domain module as a compiler root. */
export function createFlatDomainCompileRoot<
  Contract extends object,
  Ops extends object,
  Op extends DomainOpCompileAny,
>(
  domainId: string,
  domainContract: Contract,
  ops: Ops
): Readonly<{ contract: Contract; ops: Ops }> & DomainCompileRoot<Op> {
  const registry = registryByOpsSurface.get(ops);
  if (!registry) throw new Error("domain compile root requires a canonical operation surface");
  const root = materializeCompileRoot([
    Object.freeze({ key: "contract", value: domainContract }),
    Object.freeze({ key: "ops", value: ops }),
  ]) as Readonly<{ contract: Contract; ops: Ops }> & DomainCompileRoot<Op>;
  authorityByCompileRoot.set(root, { domainId, domainContract, registry });
  return root;
}

/**
 * Binds declared operation keys to their exact canonical compile implementations.
 * Contract identity, registry key, and implementation id must all agree so compilation cannot
 * silently substitute a shape-compatible operation from another authority.
 */
export function bindCompileOps<
  const Decl extends Readonly<Record<string, OpContractAny>>,
  const Registry extends Readonly<Record<string, DomainOpCompileAny>>,
>(decl: Decl, registryById: Registry): BoundOps<Decl, Registry> {
  const contracts = captureCanonicalContracts(decl, "operation contract bindings");
  const registry = captureCompileRegistry(registryById);
  return bindRecord(contracts, registry, readCanonicalDomainOpContract) as BoundOps<Decl, Registry>;
}

/**
 * Binds declared operation keys to their exact runtime projections.
 * Runtime wrappers retain the originating contract identity, preventing recipe execution from
 * accepting an implementation that merely shares the same operation id.
 */
export function bindRuntimeOps<
  const Decl extends Readonly<Record<string, OpContractAny>>,
  const Registry extends Readonly<Record<string, DomainOpRuntimeAny>>,
>(decl: Decl, registryById: Registry): BoundOps<Decl, Registry> {
  const contracts = captureCanonicalContracts(decl, "operation contract bindings");
  const registry = captureRuntimeRegistry(registryById);
  return bindRecord(contracts, registry, readRuntimeOpContract) as BoundOps<Decl, Registry>;
}

function captureCompileRegistry(input: unknown): ReadonlyMap<string, DomainOpCompileAny> {
  const registry = new Map<string, DomainOpCompileAny>();
  for (const { key, value } of captureOwnDataRecord<DomainOpCompileAny>(
    input,
    "compile operation registry"
  )) {
    const contract = readCanonicalDomainOpContract(value);
    if (key !== contract.id || value.id !== contract.id) {
      throw new Error(`Compile operation registry key "${key}" must equal "${contract.id}"`);
    }
    registry.set(key, value);
  }
  return registry;
}

function captureRuntimeRegistry(input: unknown): ReadonlyMap<string, DomainOpRuntimeAny> {
  const registry = new Map<string, DomainOpRuntimeAny>();
  for (const { key, value } of captureOwnDataRecord<DomainOpRuntimeAny>(
    input,
    "runtime operation registry"
  )) {
    const contract = readRuntimeOpContract(value);
    if (key !== contract.id || value.id !== contract.id) {
      throw new Error(`Runtime operation registry key "${key}" must equal "${contract.id}"`);
    }
    registry.set(key, value);
  }
  return registry;
}

function materializeCompileRoot<Op extends DomainOpCompileAny>(
  entries: OwnDataRecord<unknown>
): DomainCompileRoot<Op> {
  const root = new DomainCompileRootToken<Op>();
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

/** Projects canonical domain roots into the flat registry required by recipe compilation. */
export function collectCompileOps(
  ...domains: readonly DomainCompileRoot[]
): OpsById<DomainOpCompileAny> {
  const result = new Map<string, DomainOpCompileAny>();
  const rootByDomainId = new Map<string, object>();
  for (const domain of domains) {
    const authority = authorityByCompileRoot.get(domain);
    if (!authority) throw new Error("collectCompileOps requires a root domain router");
    const existingRoot = rootByDomainId.get(authority.domainId);
    if (existingRoot === domain) continue;
    if (existingRoot) {
      throw new Error(`duplicate domain id "${authority.domainId}" across domain roots`);
    }
    rootByDomainId.set(authority.domainId, domain);
    for (const [id, operation] of authority.registry) {
      if (result.has(id)) throw new Error(`duplicate operation id "${id}" across domains`);
      result.set(id, operation);
    }
  }
  return materializeOwnDataRecord(
    [...result].map(([key, value]) => Object.freeze({ key, value }))
  ) as OpsById<DomainOpCompileAny>;
}

/** Converts one compile operation into its cached immutable runtime callable. */
export function runtimeOp<Op extends DomainOpCompileAny>(op: Op): DomainOpRuntime<Op> {
  const contract = readCanonicalDomainOpContract(op);
  const cached = runtimeByCompileOp.get(op);
  if (cached) return cached as DomainOpRuntime<Op>;
  const fn = ((input: Parameters<Op["run"]>[0], config: Parameters<Op["run"]>[1]) =>
    op.run(input, config)) as DomainOpRuntime<Op>;
  Object.defineProperties(fn, {
    id: { value: op.id, enumerable: true },
    kind: { value: op.kind, enumerable: true },
  });
  Object.freeze(fn);
  runtimeByCompileOp.set(op, fn);
  contractByRuntimeOp.set(fn, contract);
  return fn;
}

function readRuntimeOpContract(operation: DomainOpRuntimeAny): OpContractAny {
  const contract = contractByRuntimeOp.get(operation);
  if (!contract) throw new Error("runtime operation must be created by runtimeOp");
  return contract;
}
